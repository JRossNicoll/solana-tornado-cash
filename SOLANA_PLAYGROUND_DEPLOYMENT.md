# Deploying to Solana Playground

This guide explains how to deploy the Solana Tornado Cash smart contract using Solana Playground (https://beta.solpg.io/), a web-based IDE that doesn't require local setup.

## Prerequisites

- A browser with a Solana wallet extension (Phantom, Solflare, etc.)
- Some devnet SOL for deployment (you can get this from https://faucet.solana.com/)

## Step 1: Access Solana Playground

1. Go to https://beta.solpg.io/
2. Click "Connect" in the top right to connect your wallet
3. Make sure you're on **Devnet** (check the network selector in the top right)

## Step 2: Create a New Project

1. Click the "+" icon or "New Project" 
2. Choose "Anchor" as the framework
3. Name your project "solana-tornado-cash"

## Step 3: Upload Program Files

You need to upload the program code from `programs/solana-tornado-cash/src/lib.rs`:

1. In the Solana Playground file explorer, navigate to `src/lib.rs`
2. Copy the contents from your local `programs/solana-tornado-cash/src/lib.rs` file
3. Paste it into the Solana Playground editor, replacing the default code

## Step 4: Update Cargo.toml

1. In the Solana Playground file explorer, open `Cargo.toml`
2. Update it to match your local `programs/solana-tornado-cash/Cargo.toml`:

```toml
[package]
name = "solana-tornado-cash"
version = "0.1.0"
description = "Created with Anchor"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "solana_tornado_cash"

[features]
no-entrypoint = []
no-idl = []
no-log-ix-name = []
cpi = ["no-entrypoint"]
default = []

[dependencies]
anchor-lang = "0.31.0"
anchor-spl = "0.31.0"
bytemuck = "1.4.0"
```

## Step 5: Build the Program

1. Click the "Build" button (hammer icon) in the left sidebar
2. Wait for the build to complete - this may take a few minutes
3. You should see "Build successful" in the output panel

**Note**: If you encounter build errors, Solana Playground may have different dependency versions. Try updating anchor-lang and anchor-spl to match the playground's default versions.

## Step 6: Deploy to Devnet

1. Make sure your wallet has devnet SOL (get from https://faucet.solana.com/ if needed)
2. Click the "Deploy" button (rocket icon) in the left sidebar
3. Confirm the transaction in your wallet
4. Wait for deployment to complete

## Step 7: Get Your Program ID

After successful deployment, you'll see output like:

```
Program Id: 8zGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Copy this Program ID** - you'll need it for the frontend!

## Step 8: Update the Frontend

Send the Program ID to Devin so it can be updated in the frontend:

1. The Program ID needs to be updated in `frontend/src/lib/anchorClient.ts`
2. The frontend will then be able to interact with your deployed program

## Step 9: Test the Deployment

You can test the program directly in Solana Playground:

1. Click the "Test" tab
2. Try calling the `initialize` instruction
3. Try calling the `deposit` instruction with test parameters

## Troubleshooting

### Build Fails in Solana Playground

If the build fails due to dependency issues:

1. Try using Solana Playground's default Anchor version (might be different from 0.31.0)
2. Update the `Cargo.toml` to use the versions that Solana Playground provides
3. You may need to simplify some dependencies

### Not Enough SOL for Deployment

Deployment costs around 2-5 SOL on devnet:

1. Go to https://faucet.solana.com/
2. Enter your wallet address
3. Request an airdrop
4. Wait a few seconds and try deploying again

### Wallet Connection Issues

1. Make sure your wallet extension is unlocked
2. Try refreshing the Solana Playground page
3. Switch to devnet in your wallet settings
4. Disconnect and reconnect your wallet

## Alternative: Using Anchor Verify

If Solana Playground doesn't work, you can also try:

1. **Anchor Verifiable Build**: Create a Docker-based build that's reproducible
2. **GitHub Actions**: Set up CI/CD to build and deploy automatically
3. **Rental Services**: Use a cloud VM with Anchor pre-installed

## Next Steps

Once deployed:

1. Share the Program ID with Devin
2. The frontend will be updated to use your deployed program
3. Test deposits and withdrawals through the UI at https://tornado-cache-website-f818m6vv.devinapps.com
4. Remember: **This is a demo - only use devnet funds, never real SOL!**

## Important Security Notes

⚠️ **This is an educational demo only**:
- The zkSNARK proof verification uses a simplified approach
- Solana lacks native pairing precompiles needed for full Groth16 verification
- Do NOT use this with real funds or on mainnet
- See SECURITY.md for full details on the security limitations

## Support

If you encounter issues:

1. Check the Solana Playground documentation: https://docs.solpg.io/
2. Ask in the Solana Discord: https://discord.gg/solana
3. Review the error messages carefully - they often indicate what's wrong
