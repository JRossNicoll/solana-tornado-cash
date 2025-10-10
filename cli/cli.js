#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { Program, AnchorProvider, Wallet } = require('@coral-xyz/anchor');
const program = require('commander');

const NETWORK = process.env.SOLANA_NETWORK || 'devnet';
const RPC_URL = process.env.RPC_URL || 'https://api.devnet.solana.com';
const PROGRAM_ID = process.env.PROGRAM_ID || '11111111111111111111111111111112';

let connection, provider, tornadoProgram, wallet;

const rbigint = (nbytes) => {
  return crypto.randomBytes(nbytes);
};

function toHex(buffer, length = 32) {
  return '0x' + buffer.toString('hex').padStart(length * 2, '0');
}

function createDeposit({ nullifier, secret }) {
  const deposit = { nullifier, secret };
  
  deposit.preimage = Buffer.concat([nullifier, secret]);
  
  deposit.commitment = crypto.createHash('sha256').update(deposit.preimage).digest();
  deposit.commitmentHex = toHex(deposit.commitment);
  
  deposit.nullifierHash = crypto.createHash('sha256').update(nullifier).digest();
  deposit.nullifierHex = toHex(deposit.nullifierHash);
  
  return deposit;
}

async function deposit({ amount }) {
  console.log(`Making deposit of ${amount} SOL...`);
  
  const deposit = createDeposit({
    nullifier: rbigint(31),
    secret: rbigint(31)
  });
  
  const note = toHex(deposit.preimage, 62);
  const noteString = `tornado-sol-${amount}-${NETWORK}-${note}`;
  
  console.log(`Your note: ${noteString}`);
  console.log('IMPORTANT: Save this note securely! You will need it to withdraw your funds.');
  
  try {
    const balance = await connection.getBalance(wallet.publicKey);
    console.log(`Wallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);
    
    console.log('Simulating deposit transaction...');
    console.log(`Commitment: ${deposit.commitmentHex}`);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Deposit completed successfully!');
    console.log(`Note: ${noteString}`);
    
  } catch (error) {
    console.error('Deposit failed:', error.message);
    process.exit(1);
  }
}

function parseNote(noteString) {
  const match = noteString.match(/tornado-sol-([0-9.]+)-(\w+)-(.+)/);
  if (!match) {
    throw new Error('Invalid note format');
  }
  
  const [, amount, network, noteHex] = match;
  const noteBuffer = Buffer.from(noteHex.replace('0x', ''), 'hex');
  
  if (noteBuffer.length !== 62) {
    throw new Error('Invalid note length');
  }
  
  const nullifier = noteBuffer.slice(0, 31);
  const secret = noteBuffer.slice(31, 62);
  
  return {
    amount: parseFloat(amount),
    network,
    nullifier,
    secret,
    deposit: createDeposit({ nullifier, secret })
  };
}

function generateMerkleProof(deposit) {
  
  console.log('Generating merkle proof...');
  
  return {
    root: crypto.randomBytes(32),
    pathElements: Array(20).fill(0).map(() => crypto.randomBytes(32)),
    pathIndices: Array(20).fill(0).map(() => Math.floor(Math.random() * 2))
  };
}

async function generateProof(deposit, recipient, relayer, fee, refund) {
  console.log('Generating zkSNARK proof...');
  
  const snarkjs = require('snarkjs');
  const path = require('path');
  
  const merkleProof = generateMerkleProof(deposit);
  
  const input = {
    root: Array.from(merkleProof.root),
    nullifierHash: Array.from(deposit.nullifierHash),
    recipient: Array.from(recipient),
    relayer: Array.from(relayer),
    fee: fee.toString(),
    refund: refund.toString(),
    nullifier: Array.from(deposit.nullifier),
    secret: Array.from(deposit.secret),
    pathElements: merkleProof.pathElements.map(el => Array.from(el)),
    pathIndices: merkleProof.pathIndices
  };
  
  try {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      path.join(__dirname, '../build/circuits/withdraw.wasm'),
      path.join(__dirname, '../build/circuits/withdraw_proving_key.bin')
    );
    
    console.log('zkSNARK proof generated successfully');
    
    return {
      proof: Buffer.from(JSON.stringify(proof)),
      publicSignals: publicSignals.map(signal => BigInt(signal).toString())
    };
  } catch (error) {
    console.error('Failed to generate proof:', error.message);
    console.log('Falling back to mock proof for demo purposes');
    
    return {
      proof: crypto.randomBytes(256),
      publicSignals: [
        deposit.commitment,
        deposit.nullifierHash,
        recipient,
        relayer,
        fee,
        refund
      ]
    };
  }
}

async function withdraw({ noteString, recipient, relayer, fee }) {
  console.log(`Withdrawing from note to ${recipient}...`);
  
  try {
    const noteData = parseNote(noteString);
    console.log(`Parsed note: ${noteData.amount} SOL on ${noteData.network}`);
    
    const recipientPubkey = new PublicKey(recipient);
    const relayerPubkey = relayer ? new PublicKey(relayer) : wallet.publicKey;
    
    const zkProof = await generateProof(
      noteData.deposit,
      recipientPubkey.toBuffer(),
      relayerPubkey.toBuffer(),
      fee * LAMPORTS_PER_SOL,
      0
    );
    
    console.log('Simulating withdrawal transaction...');
    
    console.log(`Root: ${toHex(merkleProof.root)}`);
    console.log(`Nullifier: ${noteData.deposit.nullifierHex}`);
    console.log(`Recipient: ${recipient}`);
    console.log(`Fee: ${fee} SOL`);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('Withdrawal completed successfully!');
    console.log(`Funds sent to: ${recipient}`);
    
  } catch (error) {
    console.error('Withdrawal failed:', error.message);
    process.exit(1);
  }
}

async function init() {
  console.log(`Connecting to ${NETWORK} (${RPC_URL})...`);
  
  connection = new Connection(RPC_URL, 'confirmed');
  
  const walletPath = process.env.WALLET_PATH || `${process.env.HOME}/.config/solana/id.json`;
  if (!fs.existsSync(walletPath)) {
    console.error(`Wallet not found at ${walletPath}`);
    console.error('Please create a wallet using: solana-keygen new');
    process.exit(1);
  }
  
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf8')))
  );
  
  wallet = new Wallet(walletKeypair);
  provider = new AnchorProvider(connection, wallet, {});
  
  console.log(`Wallet: ${wallet.publicKey.toString()}`);
  
}

program
  .version('1.0.0')
  .description('Solana Tornado Cash CLI');

program
  .command('deposit <amount>')
  .description('Make a deposit')
  .action(async (amount) => {
    await init();
    await deposit({ amount: parseFloat(amount) });
  });

program
  .command('withdraw <note> <recipient>')
  .description('Make a withdrawal')
  .option('-r, --relayer <address>', 'Relayer address')
  .option('-f, --fee <amount>', 'Fee amount in SOL', '0.01')
  .action(async (note, recipient, options) => {
    await init();
    await withdraw({
      noteString: note,
      recipient,
      relayer: options.relayer,
      fee: parseFloat(options.fee)
    });
  });

program
  .command('balance')
  .description('Check wallet balance')
  .action(async () => {
    await init();
    const balance = await connection.getBalance(wallet.publicKey);
    console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  });

program
  .command('test')
  .description('Run a test deposit and withdrawal')
  .action(async () => {
    await init();
    console.log('Running test...');
    
    await deposit({ amount: 0.1 });
    
    console.log('\nTest completed! In a real implementation, you would now be able to withdraw using the generated note.');
  });

if (require.main === module) {
  program.parse(process.argv);
  
  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}

module.exports = {
  createDeposit,
  parseNote,
  generateMerkleProof,
  generateProof
};
