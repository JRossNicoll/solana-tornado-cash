# Solana Tornado Cash - Step-by-Step Deployment Guide

## 📋 Prerequisites

Before starting, ensure you have the following installed:

### Required Software
1. **Node.js** (v18 or higher)
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Rust** (latest stable)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   ```

3. **Solana CLI** (v1.16 or higher)
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"
   export PATH="~/.local/share/solana/install/active_release/bin:$PATH"
   ```

4. **Anchor Framework** (v0.28 or higher)
   ```bash
   npm install -g @coral-xyz/anchor-cli
   ```

5. **Git**
   ```bash
   sudo apt update && sudo apt install git
   ```

## 🚀 Step 1: Repository Setup

### 1.1 Create GitHub Repository
1. Go to [GitHub](https://github.com) and sign in
2. Click "New repository"
3. Name it: `solana-tornado-cash`
4. Set visibility to Public or Private (your choice)
5. **Do NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### 1.2 Clone and Setup Local Repository
```bash
# Clone the repository (replace YOUR_USERNAME)
git clone https://github.com/YOUR_USERNAME/solana-tornado-cash.git
cd solana-tornado-cash

# Copy the implementation files from this session
# (You'll need to get the files from the current implementation)
```

## 🔧 Step 2: Environment Setup

### 2.1 Configure Solana CLI
```bash
# Set to devnet for testing
solana config set --url devnet

# Generate a new keypair (or use existing)
solana-keygen new --outfile ~/.config/solana/id.json

# Check your configuration
solana config get

# Airdrop some SOL for testing
solana airdrop 2
```

### 2.2 Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your settings
nano .env
```

Update `.env` with your values:
```env
SOLANA_NETWORK=devnet
RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=YOUR_DEPLOYED_PROGRAM_ID
WALLET_PATH=~/.config/solana/id.json
REACT_APP_SOLANA_NETWORK=devnet
REACT_APP_RPC_URL=https://api.devnet.solana.com
REACT_APP_PROGRAM_ID=YOUR_DEPLOYED_PROGRAM_ID
```

## 🏗️ Step 3: Build and Deploy Solana Program

### 3.1 Install Dependencies
```bash
# Install root dependencies
npm install

# Install Anchor dependencies
anchor build
```

### 3.2 Deploy to Devnet
```bash
# Build the program
anchor build

# Deploy to devnet
anchor deploy

# Note the Program ID from the output and update your .env file
```

### 3.3 Update Program ID
After deployment, update the Program ID in:
- `.env` file
- `Anchor.toml` file
- `frontend/.env` (if exists)

## 🎨 Step 4: Frontend Setup

### 4.1 Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 4.2 Configure Frontend Environment
```bash
# Create frontend environment file
cp ../.env.example .env.local

# Update with your deployed program ID
nano .env.local
```

### 4.3 Build and Test Frontend
```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 🧪 Step 5: Testing

### 5.1 Test Solana Program
```bash
# Run Anchor tests
anchor test

# Test CLI functionality
cd cli
node cli.js --help
node cli.js balance
```

### 5.2 Test Frontend
1. Open browser to `http://localhost:5173`
2. Connect wallet (use browser wallet or test wallet)
3. Test deposit flow:
   - Select amount (0.1, 1, 10, or 100 SOL)
   - Click "Deposit"
   - Save the generated note securely
4. Test withdrawal flow:
   - Switch to "Withdraw" tab
   - Paste your note
   - Enter recipient address
   - Click "Withdraw"

## 🌐 Step 6: Production Deployment

### 6.1 Deploy to Mainnet (Optional)
```bash
# Switch to mainnet
solana config set --url mainnet-beta

# Deploy program to mainnet
anchor deploy --provider.cluster mainnet

# Update environment variables for mainnet
```

### 6.2 Deploy Frontend
Choose one of these options:

#### Option A: Vercel
```bash
cd frontend
npm install -g vercel
vercel --prod
```

#### Option B: Netlify
```bash
cd frontend
npm run build
# Upload dist/ folder to Netlify
```

#### Option C: GitHub Pages
```bash
cd frontend
npm run build
# Configure GitHub Pages to serve from dist/ folder
```

## 🔐 Step 7: Security Considerations

### 7.1 Mainnet Deployment Checklist
- [ ] Audit smart contract code
- [ ] Test thoroughly on devnet
- [ ] Use hardware wallet for deployment
- [ ] Set up monitoring and alerts
- [ ] Implement proper access controls

### 7.2 Frontend Security
- [ ] Use HTTPS in production
- [ ] Implement Content Security Policy
- [ ] Validate all user inputs
- [ ] Use secure RPC endpoints

## 📚 Step 8: Usage Instructions

### 8.1 For Users
1. **Connect Wallet**: Use Phantom, Solflare, or other Solana wallets
2. **Deposit**: 
   - Choose amount
   - Confirm transaction
   - **SAVE THE NOTE SECURELY** - you need it to withdraw
3. **Withdraw**:
   - Enter your saved note
   - Specify recipient address
   - Confirm withdrawal

### 8.2 For Developers
```bash
# Start development environment
anchor build && anchor deploy
cd frontend && npm run dev

# Run tests
anchor test
cd frontend && npm test

# Check logs
solana logs YOUR_PROGRAM_ID
```

## 🆘 Troubleshooting

### Common Issues

#### Program Deployment Fails
```bash
# Check Solana balance
solana balance

# Airdrop more SOL if needed
solana airdrop 2

# Check program size
ls -la target/deploy/
```

#### Frontend Won't Connect to Wallet
- Ensure wallet extension is installed
- Check network settings (devnet vs mainnet)
- Verify RPC URL in environment variables

#### Transaction Fails
- Check account has sufficient SOL
- Verify program is deployed correctly
- Check transaction logs: `solana logs YOUR_PROGRAM_ID`

### Getting Help
- Check Anchor documentation: https://book.anchor-lang.com/
- Solana documentation: https://docs.solana.com/
- Join Solana Discord for community support

## 🎯 Next Steps

1. **Test thoroughly** on devnet before mainnet
2. **Implement additional features**:
   - Multiple denomination pools
   - Relayer network
   - Advanced privacy features
3. **Security audit** before mainnet deployment
4. **Community feedback** and testing

---

**⚠️ Important Security Notice**: This is a demonstration implementation. Conduct thorough security audits and testing before using with real funds on mainnet.
