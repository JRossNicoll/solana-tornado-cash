# Solana Tornado Cash

A privacy solution for Solana based on the TornadoCash protocol. This implementation provides non-custodial private transactions on Solana using zkSNARKs to break the on-chain link between sender and recipient addresses.

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

## Quick Start

1. Install dependencies: `npm install`
2. Build the program: `anchor build`
3. Deploy locally: `anchor deploy`
4. Start frontend: `npm run dev`

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

This implementation uses the same cryptographic primitives as TornadoCash:
- Pedersen hash for commitments
- MiMC hash for Merkle tree
- Groth16 zkSNARK proofs

## License

MIT License
