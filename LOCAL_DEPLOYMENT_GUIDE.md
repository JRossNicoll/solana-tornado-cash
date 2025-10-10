# Local Deployment Guide for Windows WSL Ubuntu

This guide will help you build and deploy the Solana Tornado Cash smart contract from your local Windows machine using WSL Ubuntu.

## Prerequisites Check

First, let's check what you already have installed. Open your WSL Ubuntu terminal and run these commands:

```bash
# Check Rust
rustc --version

# Check Solana CLI
solana --version

# Check Anchor
anchor --version

# Check Node.js
node --version
npm --version
```

## Step 1: Install Rust (if not already installed)

If `rustc --version` didn't work, install Rust:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

When prompted, press `1` and Enter to proceed with default installation.

Then reload your shell:
```bash
source ~/.bashrc
rustc --version  # Verify installation
```

## Step 2: Install Solana CLI

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

Add Solana to your PATH:
```bash
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

Verify installation:
```bash
solana --version
```

## Step 3: Install Anchor Framework

Install dependencies first:
```bash
sudo apt-get update
sudo apt-get install -y pkg-config build-essential libudev-dev libssl-dev
```

Install Anchor Version Manager (AVM):
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
```

Install Anchor (this may take 5-10 minutes):
```bash
avm install latest
avm use latest
```

Verify installation:
```bash
anchor --version
```

## Step 4: Clone the Repository (if you haven't already)

```bash
# Navigate to where you want the code
cd ~

# Clone the repo
git clone https://github.com/JRossNicoll/solana-tornado-cash.git
cd solana-tornado-cash

# Checkout the feature branch
git checkout devin/1756418130-solana-tornado-cash
```

## Step 5: Install Node.js Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Step 6: Build zkSNARK Circuits

This step compiles the zero-knowledge proof circuits:

```bash
npm run build:circuit
```

This should create files in `build/circuits/`:
- `withdraw.wasm`
- `withdraw_proving_key.bin`
- `verification_key.json`

If you see these files, the circuits built successfully!

## Step 7: Configure Solana for Devnet

Set up your Solana configuration to use devnet:

```bash
# Set cluster to devnet
solana config set --url https://api.devnet.solana.com

# Create a new keypair (or use existing)
solana-keygen new

# Get some devnet SOL (airdrop)
solana airdrop 2

# Check your balance
solana balance
```

## Step 8: Build the Smart Contract

```bash
anchor build
```

This will compile the Rust smart contract. You should see output ending with something like:
```
Finished release [optimized] target(s) in XX.XXs
```

## Step 9: Get the Program ID

After building, get your program ID:

```bash
anchor keys list
```

You should see output like:
```
solana_tornado_cash: <PROGRAM_ID>
```

**IMPORTANT: Copy this PROGRAM_ID** - you'll need to send it to me!

## Step 10: Deploy to Devnet

Deploy the smart contract to Solana devnet:

```bash
anchor deploy --provider.cluster devnet
```

You should see output like:
```
Deploying cluster: https://api.devnet.solana.com
Upgrade authority: <your-wallet-address>
Deploying program "solana_tornado_cash"...
Program Id: <PROGRAM_ID>

Deploy success
```

## Step 11: Send Me the Program ID

Once deployment is complete, send me the **Program ID** from the output above.

It will look something like:
```
8zGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Once I have this, I'll:
1. Update the program ID in the codebase
2. Implement real blockchain integration in the frontend
3. Test the full deposit/withdraw flow
4. Redeploy the frontend with working blockchain transactions

## Troubleshooting

### "error: binary `anchor` already exists"
If you get this error during Anchor installation:
```bash
rm -f ~/.cargo/bin/anchor
avm install latest --force
```

### "Failed to airdrop"
If the devnet airdrop fails, try again in a few minutes:
```bash
solana airdrop 2
```

Or use the Solana faucet: https://faucet.solana.com/

### "Insufficient funds for deploy"
Make sure you have enough SOL:
```bash
solana balance
solana airdrop 2  # Request more if needed
```

### Build errors
If `anchor build` fails, make sure all dependencies are installed:
```bash
cargo clean
anchor build
```

## Next Steps

After you send me the Program ID, I'll handle:
- ✅ Updating program ID in all config files
- ✅ Implementing Anchor client in frontend
- ✅ Real deposit function (commitment generation + blockchain call)
- ✅ Real withdraw function (zkSNARK proof + blockchain call)
- ✅ Testing full flow locally
- ✅ Redeploying frontend to https://tornado-cache-website-f818m6vv.devinapps.com
- ✅ Updating PR #1 with all changes

---

**Questions?** Let me know at any step if you run into issues!
