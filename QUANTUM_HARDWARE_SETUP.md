# QuantumForge - Real Quantum Hardware Setup Guide

## 🎉 Installation Complete!

IBM Quantum Runtime and AWS Braket SDKs are now installed. Follow this guide to configure API access.

---

## 🔐 IBM Quantum Configuration

### Step 1: Create IBM Quantum Account
1. Visit [https://quantum.ibm.com/](https://quantum.ibm.com/)
2. Click **"Sign Up"** (or login if you have an account)
3. Complete registration - **it's completely FREE**

### Step 2: Get Your API Token
1. After login, click your profile icon (top right)
2. Select **"Account Settings"**
3. Navigate to **"API tokens"** tab
4. Click **"Generate new token"** or copy existing token
5. Copy the token (starts with `IBM_QUANTUM_...`)

### Step 3: Configure QuantumForge
**Option A: Using Configuration Script (Recommended)**
```powershell
cd "c:\Users\wlwil\Desktop\Aeonmi QW\AQW\New folder\backend"
python quantum_config.py
# Select option 1, paste your token when prompted
```

**Option B: Manual Configuration**
```python
from qiskit_ibm_runtime import QiskitRuntimeService

# Save your token
QiskitRuntimeService.save_account(
    channel="ibm_quantum",
    token="YOUR_IBM_QUANTUM_TOKEN_HERE",
    overwrite=True
)

# Test connection
service = QiskitRuntimeService()
backends = service.backends()
print(f"Connected! Found {len(backends)} quantum systems")
```

### Available IBM Quantum Systems
Once configured, you'll have access to:
- **ibm_brisbane** - 127-qubit quantum processor
- **ibm_kyoto** - 127-qubit quantum processor  
- **ibm_osaka** - 127-qubit quantum processor
- **ibmq_qasm_simulator** - 32-qubit cloud simulator
- And more! (Free tier includes real quantum computers)

---

## ☁️ AWS Braket Configuration

### Step 1: Create AWS Account
1. Visit [https://aws.amazon.com/](https://aws.amazon.com/)
2. Click **"Create an AWS Account"**
3. Complete registration (requires payment method, but free tier available)

### Step 2: Enable AWS Braket
1. Login to [AWS Console](https://console.aws.amazon.com/)
2. Search for **"Braket"** in services
3. Select your region (e.g., **us-east-1**)
4. Enable AWS Braket service

### Step 3: Create IAM User with Braket Access
1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click **"Users"** → **"Add users"**
3. Enter username (e.g., `quantumforge-braket`)
4. Select **"Access key - Programmatic access"**
5. Click **"Next: Permissions"**
6. Attach policy: **"AmazonBraketFullAccess"**
7. Click through to **"Create user"**
8. **IMPORTANT**: Download CSV with access keys or copy:
   - Access Key ID
   - Secret Access Key

### Step 4: Configure QuantumForge
**Option A: Using Configuration Script (Recommended)**
```powershell
cd "c:\Users\wlwil\Desktop\Aeonmi QW\AQW\New folder\backend"
python quantum_config.py
# Select option 2, paste credentials when prompted
```

**Option B: Manual Configuration**
Create `~/.aws/credentials` file:
```ini
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
```

Create `~/.aws/config` file:
```ini
[default]
region = us-east-1
```

**Option C: Environment Variables**
```powershell
$env:AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY_ID"
$env:AWS_SECRET_ACCESS_KEY="YOUR_SECRET_ACCESS_KEY"
$env:AWS_DEFAULT_REGION="us-east-1"
```

### Available AWS Braket Devices
Once configured, you'll have access to:
- **IonQ Harmony** - 11-qubit trapped ion QPU
- **IonQ Aria** - 25-qubit trapped ion QPU
- **Rigetti Aspen-M-3** - 80-qubit superconducting QPU
- **SV1** - State vector simulator (34 qubits)
- **TN1** - Tensor network simulator (50 qubits)
- **DM1** - Density matrix simulator (17 qubits)

---

## ✅ Verify Configuration

### Check Status
```powershell
cd "c:\Users\wlwil\Desktop\Aeonmi QW\AQW\New folder\backend"
python quantum_config.py
# Select option 3 to check configuration status
```

### Test Backend Integration
Restart the QuantumForge backend:
```powershell
cd "c:\Users\wlwil\Desktop\Aeonmi QW\AQW\New folder\backend"
python app.py
```

Look for startup messages:
```
✅ IBM Quantum Runtime: Available (X systems)
✅ AWS Braket: Available (Y devices)
```

Instead of:
```
⚠️ IBM Quantum Runtime not installed - hardware features limited
⚠️ AWS Braket not installed - AWS hardware features limited
```

---

## 🚀 Using Real Quantum Hardware

### In the QuantumForge UI:
1. Navigate to **"Hardware"** tab
2. Select a real quantum device (not simulator)
3. Choose quantum algorithm (Grover/Shor/VQE)
4. Click **"Submit to Quantum Hardware"**
5. Monitor job queue - status updates in real-time
6. View results when job completes

### Device Selection Tips:
- **IBM Quantum**: Look for devices with low queue depth
- **AWS Braket**: IonQ devices have highest fidelity
- **Simulators**: Use for testing before submitting to real QPU
- **Qubits**: Match algorithm requirements (Grover=3, Shor=8, VQE=4)

### Costs:
- **IBM Quantum**: FREE tier includes access to real quantum computers
- **AWS Braket**: 
  - Simulators: ~$0.075 per minute
  - QPUs: $0.30 per task + $0.00145-0.035 per shot
  - Free tier: 1 hour simulator time (first month)

---

## 🔧 Troubleshooting

### IBM Quantum Issues
**Error: "Invalid authentication credentials"**
- Check token is correct (copy-paste carefully)
- Regenerate token in IBM Quantum dashboard
- Run: `QiskitRuntimeService.delete_account()` then reconfigure

**Error: "No backends available"**
- Account may not be activated yet (check email)
- Try: `service = QiskitRuntimeService(channel="ibm_quantum")`

### AWS Braket Issues
**Error: "The security token included in the request is invalid"**
- Check AWS credentials are correct
- Verify IAM user has AmazonBraketFullAccess policy
- Check region is enabled for Braket

**Error: "Could not connect to the endpoint URL"**
- Check `~/.aws/config` has correct region
- Try: `export AWS_DEFAULT_REGION=us-east-1`

**Error: "AccessDeniedException"**
- IAM user missing Braket permissions
- Add AmazonBraketFullAccess policy to user

### General Issues
**Backend still shows warnings after configuration**
- Restart backend: `Ctrl+C` then `python app.py`
- Check Python environment: `python --version` (should be 3.11)
- Verify imports: `python -c "from qiskit_ibm_runtime import QiskitRuntimeService"`

**Packages not found**
```powershell
cd "c:\Users\wlwil\Desktop\Aeonmi QW\AQW\New folder\backend"
pip install qiskit-ibm-runtime==0.20.0 amazon-braket-sdk==1.70.0 boto3==1.34.0
```

---

## 📚 Additional Resources

### IBM Quantum
- [IBM Quantum Documentation](https://quantum.ibm.com/docs)
- [Qiskit Runtime Guide](https://qiskit.github.io/qiskit-ibm-runtime/)
- [IBM Quantum Learning](https://learning.quantum.ibm.com/)

### AWS Braket
- [AWS Braket Documentation](https://docs.aws.amazon.com/braket/)
- [Braket Pricing](https://aws.amazon.com/braket/pricing/)
- [Braket Developer Guide](https://docs.aws.amazon.com/braket/latest/developerguide/)

### QuantumForge
- Backend API: `http://localhost:5000/api/quantum/hardware/devices`
- Job submission: `POST /api/quantum/hardware/submit`
- Job status: `GET /api/quantum/hardware/jobs/{job_id}`

---

## 🎯 Quick Start After Configuration

1. **Start Backend**:
   ```powershell
   cd "c:\Users\wlwil\Desktop\Aeonmi QW\AQW\New folder\backend"
   python app.py
   ```

2. **Start Frontend**:
   ```powershell
   cd "c:\Users\wlwil\Desktop\Aeonmi QW\AQW\New folder\app"
   npm run dev
   ```

3. **Submit Your First Quantum Job**:
   - Open QuantumForge UI
   - Go to **Hardware** tab
   - Select **ibmq_qasm_simulator** (free, instant results)
   - Choose **Grover's Algorithm**
   - Click **Submit to Quantum Hardware**
   - Watch your first quantum circuit execute! 🎉

---

**Need Help?**  
Run the interactive configuration wizard:
```powershell
python quantum_config.py
```

Ready to explore quantum computing on real hardware! 🚀
