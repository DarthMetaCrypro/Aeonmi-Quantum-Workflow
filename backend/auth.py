"""
QuantumForge Authentication & User Management
JWT-based authentication with subscription tiers
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta
import re

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

# In-memory user storage (will be replaced with database)
users_db = {}
sessions = {}

# Subscription tiers
SUBSCRIPTION_TIERS = {
    'free': {
        'name': 'Free',
        'price': 0,
        'quantum_jobs_per_month': 10,
        'max_qubits': 5,
        'ai_optimizations_per_day': 5,
        'workflow_limit': 10,
        'features': ['Basic quantum algorithms', 'Local simulators', 'Community support']
    },
    'pro': {
        'name': 'Professional',
        'price': 29.99,
        'quantum_jobs_per_month': 500,
        'max_qubits': 32,
        'ai_optimizations_per_day': 100,
        'workflow_limit': 100,
        'features': ['All quantum algorithms', 'Real quantum hardware', 'Priority queue', 'Email support', 'API access']
    },
    'enterprise': {
        'name': 'Enterprise',
        'price': 299.99,
        'quantum_jobs_per_month': -1,  # Unlimited
        'max_qubits': 127,
        'ai_optimizations_per_day': -1,  # Unlimited
        'workflow_limit': -1,  # Unlimited
        'features': ['Everything in Pro', 'Dedicated quantum resources', 'Custom algorithms', 'SLA guarantee', 'Phone support', 'Team collaboration']
    }
}

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength (min 8 chars, 1 uppercase, 1 number)"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number"
    return True, "Valid"

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register new user"""
    data = request.get_json()
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name = data.get('name', '').strip()
    
    # Validation
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    is_valid, message = validate_password(password)
    if not is_valid:
        return jsonify({'error': message}), 400
    
    if email in users_db:
        return jsonify({'error': 'Email already registered'}), 409
    
    # Create user
    user_id = f"user_{len(users_db) + 1}"
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    users_db[email] = {
        'id': user_id,
        'email': email,
        'name': name or email.split('@')[0],
        'password': hashed_password,
        'subscription_tier': 'free',
        'subscription_status': 'active',
        'created_at': datetime.utcnow().isoformat(),
        'usage': {
            'quantum_jobs_this_month': 0,
            'ai_optimizations_today': 0,
            'workflows_created': 0,
            'last_reset': datetime.utcnow().isoformat()
        },
        'stripe_customer_id': None,
        'stripe_subscription_id': None
    }
    
    # Create tokens
    access_token = create_access_token(identity=user_id, expires_delta=timedelta(hours=24))
    refresh_token = create_refresh_token(identity=user_id, expires_delta=timedelta(days=30))
    
    user_info = {k: v for k, v in users_db[email].items() if k != 'password'}
    
    return jsonify({
        'message': 'Registration successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user_info
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login"""
    data = request.get_json()
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    user = users_db.get(email)
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if not bcrypt.check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Create tokens
    access_token = create_access_token(identity=user['id'], expires_delta=timedelta(hours=24))
    refresh_token = create_refresh_token(identity=user['id'], expires_delta=timedelta(days=30))
    
    user_info = {k: v for k, v in user.items() if k != 'password'}
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user_info
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id, expires_delta=timedelta(hours=24))
    
    return jsonify({'access_token': access_token}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user profile"""
    user_id = get_jwt_identity()
    
    # Find user by ID
    user = None
    for email, u in users_db.items():
        if u['id'] == user_id:
            user = u
            break
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user_info = {k: v for k, v in user.items() if k != 'password'}
    tier_info = SUBSCRIPTION_TIERS.get(user['subscription_tier'], SUBSCRIPTION_TIERS['free'])
    
    return jsonify({
        'user': user_info,
        'subscription': tier_info
    }), 200

@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Find user
    user = None
    user_email = None
    for email, u in users_db.items():
        if u['id'] == user_id:
            user = u
            user_email = email
            break
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Update allowed fields
    if 'name' in data:
        user['name'] = data['name'].strip()
    
    if 'password' in data and data['password']:
        is_valid, message = validate_password(data['password'])
        if not is_valid:
            return jsonify({'error': message}), 400
        user['password'] = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    user_info = {k: v for k, v in user.items() if k != 'password'}
    
    return jsonify({
        'message': 'Profile updated',
        'user': user_info
    }), 200

@auth_bp.route('/subscription/tiers', methods=['GET'])
def get_subscription_tiers():
    """Get available subscription tiers"""
    return jsonify({'tiers': SUBSCRIPTION_TIERS}), 200

@auth_bp.route('/subscription/upgrade', methods=['POST'])
@jwt_required()
def upgrade_subscription():
    """Upgrade subscription (placeholder for Stripe integration)"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    tier = data.get('tier')
    if tier not in SUBSCRIPTION_TIERS:
        return jsonify({'error': 'Invalid subscription tier'}), 400
    
    # Find user
    user = None
    for email, u in users_db.items():
        if u['id'] == user_id:
            user = u
            break
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # TODO: Integrate with Stripe for actual payment processing
    # For now, just update the tier (for development)
    user['subscription_tier'] = tier
    user['subscription_status'] = 'active'
    
    return jsonify({
        'message': f'Subscription upgraded to {SUBSCRIPTION_TIERS[tier]["name"]}',
        'subscription': SUBSCRIPTION_TIERS[tier]
    }), 200

@auth_bp.route('/usage', methods=['GET'])
@jwt_required()
def get_usage_stats():
    """Get user usage statistics"""
    user_id = get_jwt_identity()
    
    # Find user
    user = None
    for email, u in users_db.items():
        if u['id'] == user_id:
            user = u
            break
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    tier = SUBSCRIPTION_TIERS.get(user['subscription_tier'], SUBSCRIPTION_TIERS['free'])
    usage = user.get('usage', {})
    
    return jsonify({
        'usage': usage,
        'limits': {
            'quantum_jobs_per_month': tier['quantum_jobs_per_month'],
            'max_qubits': tier['max_qubits'],
            'ai_optimizations_per_day': tier['ai_optimizations_per_day'],
            'workflow_limit': tier['workflow_limit']
        },
        'percentage_used': {
            'quantum_jobs': (usage.get('quantum_jobs_this_month', 0) / tier['quantum_jobs_per_month'] * 100) if tier['quantum_jobs_per_month'] > 0 else 0,
            'ai_optimizations': (usage.get('ai_optimizations_today', 0) / tier['ai_optimizations_per_day'] * 100) if tier['ai_optimizations_per_day'] > 0 else 0,
            'workflows': (usage.get('workflows_created', 0) / tier['workflow_limit'] * 100) if tier['workflow_limit'] > 0 else 0
        }
    }), 200

def check_usage_limit(user_id, limit_type):
    """Check if user has exceeded usage limits"""
    # Find user
    user = None
    for email, u in users_db.items():
        if u['id'] == user_id:
            user = u
            break
    
    if not user:
        return False, "User not found"
    
    tier = SUBSCRIPTION_TIERS.get(user['subscription_tier'], SUBSCRIPTION_TIERS['free'])
    usage = user.get('usage', {})
    
    # Reset counters if needed
    now = datetime.utcnow()
    last_reset = datetime.fromisoformat(usage.get('last_reset', now.isoformat()))
    
    # Reset monthly counter
    if now.month != last_reset.month or now.year != last_reset.year:
        usage['quantum_jobs_this_month'] = 0
    
    # Reset daily counter
    if now.date() != last_reset.date():
        usage['ai_optimizations_today'] = 0
    
    usage['last_reset'] = now.isoformat()
    
    # Check limits
    if limit_type == 'quantum_job':
        limit = tier['quantum_jobs_per_month']
        current = usage.get('quantum_jobs_this_month', 0)
        if limit > 0 and current >= limit:
            return False, f"Monthly quantum job limit reached ({limit} jobs). Upgrade to continue."
        usage['quantum_jobs_this_month'] = current + 1
        return True, None
    
    elif limit_type == 'ai_optimization':
        limit = tier['ai_optimizations_per_day']
        current = usage.get('ai_optimizations_today', 0)
        if limit > 0 and current >= limit:
            return False, f"Daily AI optimization limit reached ({limit} optimizations). Upgrade to continue."
        usage['ai_optimizations_today'] = current + 1
        return True, None
    
    elif limit_type == 'workflow':
        limit = tier['workflow_limit']
        current = usage.get('workflows_created', 0)
        if limit > 0 and current >= limit:
            return False, f"Workflow limit reached ({limit} workflows). Upgrade to continue."
        usage['workflows_created'] = current + 1
        return True, None
    
    return True, None
