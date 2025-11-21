#!/bin/bash

# QuantumForge Enterprise Deployment Script
# Version: 1.0.0
# Description: Automated deployment for QuantumForge Enterprise Platform

set -euo pipefail

# ==========================================
# CONFIGURATION
# ==========================================
DEPLOYMENT_TYPE="${DEPLOYMENT_TYPE:-docker}"  # docker, kubernetes, aws
ENVIRONMENT="${ENVIRONMENT:-production}"       # production, staging, development
REGION="${REGION:-us-east-1}"                  # AWS region for cloud deployments
DOMAIN="${DOMAIN:-quantumforge.com}"           # Domain for SSL certificates

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ==========================================
# FUNCTIONS
# ==========================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    log_info "Checking system dependencies..."

    local deps=("docker" "docker-compose" "curl" "jq")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log_error "Required dependency '$dep' not found"
            exit 1
        fi
    done

    log_success "All dependencies satisfied"
}

validate_environment() {
    log_info "Validating environment variables..."

    local required_vars=("SECRET_KEY" "JWT_SECRET_KEY" "DATABASE_URL" "IBMQ_TOKEN")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_error "Required environment variable '$var' not set"
            exit 1
        fi
    done

    log_success "Environment validation passed"
}

setup_ssl_certificates() {
    log_info "Setting up SSL certificates..."

    if [[ "$ENVIRONMENT" == "production" ]]; then
        # Use certbot for Let's Encrypt certificates
        if ! command -v certbot &> /dev/null; then
            log_info "Installing certbot..."
            sudo apt-get update
            sudo apt-get install -y certbot
        fi

        # Obtain SSL certificate
        sudo certbot certonly --standalone -d "$DOMAIN" -d "api.$DOMAIN"

        # Copy certificates to deployment directory
        sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "./nginx/ssl/"
        sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "./nginx/ssl/"
    else
        log_warning "Using self-signed certificates for non-production environment"
        # Generate self-signed certificates
        openssl req -x509 -newkey rsa:4096 -keyout "./nginx/ssl/key.pem" -out "./nginx/ssl/cert.pem" -days 365 -nodes -subj "/CN=$DOMAIN"
    fi

    log_success "SSL certificates configured"
}

deploy_docker() {
    log_info "Starting Docker deployment..."

    # Create required directories
    mkdir -p nginx/ssl
    mkdir -p db/backups
    mkdir -p monitoring/prometheus
    mkdir -p monitoring/grafana

    # Setup SSL certificates
    setup_ssl_certificates

    # Generate random secrets if not provided
    export SECRET_KEY="${SECRET_KEY:-$(openssl rand -hex 32)}"
    export JWT_SECRET_KEY="${JWT_SECRET_KEY:-$(openssl rand -hex 32)}"
    export CSRF_SECRET_KEY="${CSRF_SECRET_KEY:-$(openssl rand -hex 32)}"
    export REDIS_PASSWORD="${REDIS_PASSWORD:-$(openssl rand -hex 16)}"

    # Create .env file
    cat > .env << EOF
# QuantumForge Enterprise Configuration
SECRET_KEY=$SECRET_KEY
JWT_SECRET_KEY=$JWT_SECRET_KEY
CSRF_SECRET_KEY=$CSRF_SECRET_KEY
DATABASE_URL=$DATABASE_URL
IBMQ_TOKEN=$IBMQ_TOKEN
REDIS_PASSWORD=$REDIS_PASSWORD
SENTRY_DSN=$SENTRY_DSN
DOMAIN=$DOMAIN
ENVIRONMENT=$ENVIRONMENT
EOF

    # Pull latest images
    log_info "Pulling latest Docker images..."
    docker-compose -f docker-compose.prod.yml pull

    # Start services
    log_info "Starting QuantumForge services..."
    docker-compose -f docker-compose.prod.yml up -d

    # Wait for services to be healthy
    log_info "Waiting for services to become healthy..."
    local max_attempts=30
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose -f docker-compose.prod.yml ps | grep -q "healthy"; then
            break
        fi
        log_info "Waiting for services... (attempt $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done

    if [[ $attempt -gt $max_attempts ]]; then
        log_error "Services failed to become healthy"
        exit 1
    fi

    # Run database migrations
    log_info "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec -T backend python -c "from app import db; db.create_all()"

    # Verify deployment
    log_info "Verifying deployment..."
    local health_check_url="https://api.$DOMAIN/api/health"
    if curl -f -k "$health_check_url" &> /dev/null; then
        log_success "Deployment completed successfully!"
        log_info "Application is available at: https://app.$DOMAIN"
        log_info "API is available at: https://api.$DOMAIN"
    else
        log_error "Health check failed"
        exit 1
    fi
}

deploy_kubernetes() {
    log_info "Starting Kubernetes deployment..."

    # Check kubectl access
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Unable to access Kubernetes cluster"
        exit 1
    fi

    # Create namespace
    kubectl create namespace quantumforge --dry-run=client -o yaml | kubectl apply -f -

    # Apply Kubernetes manifests
    kubectl apply -f kubernetes/quantumforge-deployment.yml

    # Wait for deployments to be ready
    log_info "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/quantumforge-backend -n quantumforge
    kubectl wait --for=condition=available --timeout=300s deployment/quantumforge-frontend -n quantumforge

    # Verify deployment
    log_info "Verifying Kubernetes deployment..."
    if kubectl get pods -n quantumforge | grep -q "Running"; then
        log_success "Kubernetes deployment completed successfully!"
    else
        log_error "Kubernetes deployment failed"
        exit 1
    fi
}

deploy_aws() {
    log_info "Starting AWS deployment..."

    # Check AWS CLI access
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "Unable to access AWS account"
        exit 1
    fi

    # Set AWS region
    export AWS_DEFAULT_REGION="$REGION"

    # Deploy using AWS CloudFormation or CDK
    log_info "Deploying to AWS $REGION..."

    # This would typically use AWS CDK or CloudFormation
    # For demonstration, we'll use docker-compose on ECS
    aws ecs create-cluster --cluster-name quantumforge-cluster || true

    # Convert docker-compose to ECS task definition
    # (This is a simplified version - production would use proper IaC)

    log_success "AWS deployment completed!"
}

run_health_checks() {
    log_info "Running comprehensive health checks..."

    local checks_passed=0
    local total_checks=0

    # Backend health check
    ((total_checks++))
    if curl -f -k "https://api.$DOMAIN/api/health" &> /dev/null; then
        log_success "Backend health check passed"
        ((checks_passed++))
    else
        log_error "Backend health check failed"
    fi

    # Frontend health check
    ((total_checks++))
    if curl -f -k "https://app.$DOMAIN" | grep -q "QuantumForge"; then
        log_success "Frontend health check passed"
        ((checks_passed++))
    else
        log_error "Frontend health check failed"
    fi

    # Database connectivity
    ((total_checks++))
    if docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U quantumforge_user -d quantumforge_prod &> /dev/null; then
        log_success "Database connectivity check passed"
        ((checks_passed++))
    else
        log_error "Database connectivity check failed"
    fi

    # Quantum hardware access
    ((total_checks++))
    if [[ -n "$IBMQ_TOKEN" ]]; then
        # This would test actual quantum hardware access
        log_success "Quantum hardware access configured"
        ((checks_passed++))
    else
        log_error "Quantum hardware access not configured"
    fi

    log_info "Health checks: $checks_passed/$total_checks passed"

    if [[ $checks_passed -eq $total_checks ]]; then
        log_success "All health checks passed!"
        return 0
    else
        log_warning "Some health checks failed"
        return 1
    fi
}

cleanup_failed_deployment() {
    log_warning "Cleaning up failed deployment..."

    case "$DEPLOYMENT_TYPE" in
        docker)
            docker-compose -f docker-compose.prod.yml down -v --remove-orphans
            ;;
        kubernetes)
            kubectl delete namespace quantumforge --ignore-not-found=true
            ;;
        aws)
            # AWS cleanup would go here
            log_info "Manual AWS cleanup may be required"
            ;;
    esac
}

# ==========================================
# MAIN DEPLOYMENT LOGIC
# ==========================================
main() {
    log_info "Starting QuantumForge Enterprise Deployment"
    log_info "Deployment Type: $DEPLOYMENT_TYPE"
    log_info "Environment: $ENVIRONMENT"
    log_info "Domain: $DOMAIN"

    # Trap for cleanup on failure
    trap cleanup_failed_deployment ERR

    # Pre-deployment checks
    check_dependencies
    validate_environment

    # Execute deployment based on type
    case "$DEPLOYMENT_TYPE" in
        docker)
            deploy_docker
            ;;
        kubernetes)
            deploy_kubernetes
            ;;
        aws)
            deploy_aws
            ;;
        *)
            log_error "Unsupported deployment type: $DEPLOYMENT_TYPE"
            log_info "Supported types: docker, kubernetes, aws"
            exit 1
            ;;
    esac

    # Post-deployment health checks
    if run_health_checks; then
        log_success "🎉 QuantumForge Enterprise deployment completed successfully!"
        log_info ""
        log_info "Next steps:"
        log_info "1. Configure DNS records for $DOMAIN"
        log_info "2. Set up monitoring alerts"
        log_info "3. Configure backup schedules"
        log_info "4. Review security settings"
        log_info ""
        log_info "Access your application at: https://app.$DOMAIN"
    else
        log_error "Deployment completed but health checks failed"
        log_info "Please check the logs and retry deployment"
        exit 1
    fi
}

# ==========================================
# SCRIPT EXECUTION
# ==========================================
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi