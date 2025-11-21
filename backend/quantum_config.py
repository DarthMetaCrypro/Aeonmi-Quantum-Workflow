"""
QuantumForge - Quantum Hardware Configuration Helper
Configure IBM Quantum and AWS Braket API access
"""

import os
from pathlib import Path

def configure_ibm_quantum():
    """
    Configure IBM Quantum Runtime access
    
    Steps:
    1. Create free IBM Quantum account at https://quantum.ibm.com/
    2. Navigate to Account Settings → API tokens
    3. Copy your API token
    4. Run this script and paste your token when prompted
    
    Your token will be saved securely to ~/.qiskit/qiskit-ibm.json
    """
    print("=" * 60)
    print("IBM Quantum Configuration")
    print("=" * 60)
    
    try:
        from qiskit_ibm_runtime import QiskitRuntimeService
        
        print("\nGet your IBM Quantum API token:")
        print("1. Visit https://quantum.ibm.com/")
        print("2. Login or create account (free)")
        print("3. Go to Account → API tokens")
        print("4. Copy your token\n")
        
        token = input("Paste your IBM Quantum API token (or press Enter to skip): ").strip()
        
        if not token:
            print("⏭️  Skipped IBM Quantum configuration")
            return False
        
        # Save account credentials
        QiskitRuntimeService.save_account(
            channel="ibm_quantum",
            token=token,
            overwrite=True
        )
        
        print("✅ IBM Quantum token saved successfully!")
        
        # Test connection
        print("\nTesting connection...")
        service = QiskitRuntimeService()
        backends = service.backends()
        
        print(f"✅ Connected! Found {len(backends)} quantum systems:")
        for backend in backends[:5]:
            print(f"   • {backend.name} ({backend.num_qubits} qubits)")
        
        return True
        
    except ImportError:
        print("❌ qiskit-ibm-runtime not installed")
        print("   Run: pip install qiskit-ibm-runtime")
        return False
    except Exception as e:
        print(f"❌ Configuration failed: {e}")
        return False

def configure_aws_braket():
    """
    Configure AWS Braket access
    
    Steps:
    1. Create AWS account at https://aws.amazon.com/
    2. Enable AWS Braket service in your region
    3. Create IAM user with Braket permissions
    4. Generate access key and secret key
    5. Configure using AWS CLI or this script
    
    Your credentials will be saved to ~/.aws/credentials
    """
    print("\n" + "=" * 60)
    print("AWS Braket Configuration")
    print("=" * 60)
    
    try:
        import boto3
        from botocore.exceptions import NoCredentialsError, ClientError
        
        print("\nGet your AWS credentials:")
        print("1. Visit https://console.aws.amazon.com/iam/")
        print("2. Create IAM user with AmazonBraketFullAccess policy")
        print("3. Generate access key and secret key")
        print("4. Note your preferred region (e.g., us-east-1)\n")
        
        access_key = input("AWS Access Key ID (or press Enter to skip): ").strip()
        
        if not access_key:
            print("⏭️  Skipped AWS Braket configuration")
            return False
        
        secret_key = input("AWS Secret Access Key: ").strip()
        region = input("AWS Region (default: us-east-1): ").strip() or "us-east-1"
        
        # Save credentials to ~/.aws/credentials
        aws_dir = Path.home() / ".aws"
        aws_dir.mkdir(exist_ok=True)
        
        credentials_file = aws_dir / "credentials"
        config_file = aws_dir / "config"
        
        # Write credentials
        with open(credentials_file, "w") as f:
            f.write("[default]\n")
            f.write(f"aws_access_key_id = {access_key}\n")
            f.write(f"aws_secret_access_key = {secret_key}\n")
        
        # Write config
        with open(config_file, "w") as f:
            f.write("[default]\n")
            f.write(f"region = {region}\n")
        
        print("✅ AWS credentials saved successfully!")
        
        # Test connection
        print("\nTesting connection...")
        from braket.aws import AwsDevice
        
        # List available devices
        session = boto3.Session(
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region
        )
        braket_client = session.client('braket')
        
        response = braket_client.search_devices(
            filters=[{'name': 'deviceType', 'values': ['QPU', 'SIMULATOR']}]
        )
        
        devices = response.get('devices', [])
        print(f"✅ Connected! Found {len(devices)} quantum devices:")
        for device in devices[:5]:
            print(f"   • {device['deviceName']} ({device['deviceType']})")
        
        return True
        
    except ImportError:
        print("❌ boto3 or amazon-braket-sdk not installed")
        print("   Run: pip install amazon-braket-sdk boto3")
        return False
    except Exception as e:
        print(f"❌ Configuration failed: {e}")
        return False

def check_configuration():
    """Check if quantum hardware APIs are configured"""
    print("\n" + "=" * 60)
    print("Configuration Status Check")
    print("=" * 60)
    
    ibm_configured = False
    aws_configured = False
    
    # Check IBM Quantum
    try:
        from qiskit_ibm_runtime import QiskitRuntimeService
        service = QiskitRuntimeService()
        backends = service.backends()
        print(f"✅ IBM Quantum: Connected ({len(backends)} systems available)")
        ibm_configured = True
    except Exception as e:
        print(f"❌ IBM Quantum: Not configured - {e}")
    
    # Check AWS Braket
    try:
        import boto3
        from braket.aws import AwsDevice
        
        session = boto3.Session()
        braket_client = session.client('braket')
        response = braket_client.search_devices(
            filters=[{'name': 'deviceType', 'values': ['QPU', 'SIMULATOR']}]
        )
        devices = response.get('devices', [])
        print(f"✅ AWS Braket: Connected ({len(devices)} devices available)")
        aws_configured = True
    except Exception as e:
        print(f"❌ AWS Braket: Not configured - {e}")
    
    print("\n" + "=" * 60)
    
    if ibm_configured or aws_configured:
        print("✅ Ready to submit quantum jobs!")
    else:
        print("⚠️  No quantum hardware configured")
        print("   Run configuration to enable real quantum computing")
    
    return ibm_configured, aws_configured

def main():
    """Interactive configuration wizard"""
    print("\n🔬 QuantumForge - Quantum Hardware Setup")
    print("=" * 60)
    print("\nThis wizard will help you configure access to:")
    print("  • IBM Quantum computers (up to 127 qubits)")
    print("  • AWS Braket quantum systems (IonQ, Rigetti, etc.)")
    print("\nYou can configure one or both services.\n")
    
    while True:
        print("\nOptions:")
        print("  1. Configure IBM Quantum")
        print("  2. Configure AWS Braket")
        print("  3. Check current configuration")
        print("  4. Exit")
        
        choice = input("\nSelect option (1-4): ").strip()
        
        if choice == "1":
            configure_ibm_quantum()
        elif choice == "2":
            configure_aws_braket()
        elif choice == "3":
            check_configuration()
        elif choice == "4":
            print("\n✅ Configuration complete!")
            print("   Restart backend (python app.py) to apply changes\n")
            break
        else:
            print("❌ Invalid option")

if __name__ == "__main__":
    main()
