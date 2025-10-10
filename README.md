# Solana Tornado Cash

⚠️ **EDUCATIONAL/DEMO SOFTWARE - NOT PRODUCTION READY** ⚠️

A privacy solution for Solana based on the TornadoCash protocol. This implementation provides non-custodial private transactions on Solana using zkSNARKs to break the on-chain link between sender and recipient addresses.

**Important:** Please read [SECURITY.md](./SECURITY.md) before using this software. This is a demonstration/educational implementation with simplified proof verification that is not suitable for use with real funds.

## Architecture

- **Solana Program**: Rust-based smart contract handling deposits and withdrawals
- **zkSNARK Circuits**: Circom circuits for generating privacy proofs
- **Frontend**: React application with Solana wallet integration
- **CLI**: Command-line tools for advanced users

## Features

- Private SOL transfers using zkSNARK proofs
- Merkle tree-based commitment scheme
- Relayer support for anonymous withdrawals
- Web interface with Solana wallet integration

## Prerequisites

- Node.js 18+ and npm
- Rust 1.70+
- Solana CLI 1.16+
- Anchor Framework 0.28+
- circom and snarkjs for circuit compilation

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

2. Build zkSNARK circuits:
   ```bash
   npm run build:circuit
   ```

3. Build the Solana program:
   ```bash
   anchor build
   ```

4. Deploy locally:
   ```bash
   # In one terminal, start local validator
   solana-test-validator
   
   # In another terminal, deploy
   anchor deploy --provider.cluster localnet
   ```

5. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Usage

### Deposit
```bash
./cli.js deposit SOL 0.1
```

### Withdraw
```bash
./cli.js withdraw <note> <recipient-address>
```

## Security

⚠️ **READ THIS FIRST:** [SECURITY.md](./SECURITY.md)

**This implementation has simplified proof verification and is for educational purposes only.**

Cryptographic components:
- Pedersen hash for commitments
- MiMC hash for Merkle tree (in circuits)
- Groth16 zkSNARK proofs
- Keccak256 for on-chain merkle tree

**Critical Limitation:** The on-chain proof verification is currently a placeholder. Solana lacks Ethereum's native pairing precompiles, making full Groth16 verification challenging within compute budgets. See [SECURITY.md](./SECURITY.md) for details.

## License

MIT License
