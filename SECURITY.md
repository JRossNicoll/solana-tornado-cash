# Security Notice

⚠️ **EDUCATIONAL/DEMO SOFTWARE - NOT PRODUCTION READY** ⚠️

## Critical Security Limitations

This implementation of Tornado Cash for Solana is **for educational and demonstration purposes only**. It contains significant security limitations that make it unsuitable for use with real funds.

### 1. Simplified Proof Verification

**Current Implementation:**
- The smart contract's `verify_proof()` function at `programs/solana-tornado-cash/src/lib.rs:271-273` currently returns `true` for all proofs
- This means **ANY withdrawal can be made without valid zkSNARK proof verification**
- Privacy guarantees are NOT enforced on-chain

**Why:**
- Solana lacks native BN254 pairing precompiles (unlike Ethereum)
- Proper Groth16 proof verification on Solana requires significant compute units that may exceed transaction limits
- Implementing efficient proof verification on Solana requires specialized libraries or custom solutions

**Production Requirements:**
To make this production-ready, you would need to:
- Research and integrate Solana zkSNARK verification libraries (e.g., Light Protocol, Elusiv)
- Implement efficient on-chain proof verification within Solana's compute budget constraints
- Consider hybrid approaches (off-chain verification with on-chain attestations)
- Conduct extensive security audits

### 2. zkSNARK Circuits

**Current Status:**
- Circuits are implemented and compile successfully (`circuits/withdraw.circom`, `circuits/merkleTree.circom`)
- Proving and verification keys are generated correctly
- Proof generation works in principle

**Limitation:**
- Even though proofs can be generated, they are not actually verified on-chain
- The circuit implementation should be audited before production use

### 3. Merkle Tree Implementation

**Current Implementation:**
- Basic merkle tree tracking is implemented in the smart contract
- Uses Keccak256 for hashing (differs from original Tornado Cash's MiMC)

**Considerations:**
- The merkle tree implementation should be thoroughly tested
- Gas costs for merkle tree updates should be measured
- Consider optimizations for production use

## Architectural Differences from Original Tornado Cash

### Original (Ethereum):
- Uses Groth16 zkSNARK proofs with BN254 curve
- Leverages Ethereum's native precompiled contracts for pairing operations
- MiMC hash function for merkle tree
- Fully verified on-chain proof validation

### This Implementation (Solana):
- Same Groth16 proof system
- **No native pairing support** - this is the critical limitation
- Uses Keccak256 for merkle tree (Solana native)
- **Simplified/placeholder proof verification** (not production-ready)

## What This Demo Shows

✅ **Working:**
- Circuit compilation and key generation
- Proof generation (off-chain)
- Deposit transactions with commitment tracking
- Withdraw transaction flow
- Merkle tree management
- UI/UX matching original Tornado Cash

❌ **Not Production-Ready:**
- On-chain proof verification (placeholder only)
- Security guarantees for privacy
- Protection against malicious withdrawals

## Recommendations

### For Learning/Development:
- Use on devnet/testnet only
- Do not deposit real SOL
- Great for understanding zkSNARK mixer architecture
- Good reference for Solana smart contract development

### For Production Use:
1. Implement proper zkSNARK verification using Solana-compatible libraries
2. Conduct security audits by reputable firms
3. Extensive testing on testnet with adversarial scenarios
4. Consider compute budget optimizations
5. Implement additional safeguards (e.g., rate limiting, circuit breakers)
6. Legal compliance review depending on jurisdiction

## References

- Original Tornado Cash: https://github.com/tornadocash
- Solana zkSNARK libraries:
  - Light Protocol: https://github.com/Lightprotocol/light-protocol
  - Elusiv: https://github.com/elusiv-privacy/elusiv
- Groth16 proof system: https://eprint.iacr.org/2016/260.pdf

---

**Last Updated:** October 10, 2025

**Disclaimer:** This software is provided "as is" without warranty of any kind. Use at your own risk.
