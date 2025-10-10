import { keccak256 } from '@ethersproject/keccak256';
import { Buffer } from 'buffer';

export function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function pedersenHash(data: Uint8Array): Uint8Array {
  const hash = keccak256(data);
  return Buffer.from(hash.slice(2), 'hex');
}

export function computeNullifierHash(nullifier: Uint8Array): Uint8Array {
  return pedersenHash(nullifier);
}

export function computeCommitment(nullifier: Uint8Array, secret: Uint8Array): Uint8Array {
  const combined = new Uint8Array(nullifier.length + secret.length);
  combined.set(nullifier, 0);
  combined.set(secret, nullifier.length);
  return pedersenHash(combined);
}

export function createNote(amount: number, nullifier: Uint8Array, secret: Uint8Array): string {
  const nullifierHex = Buffer.from(nullifier).toString('hex');
  const secretHex = Buffer.from(secret).toString('hex');
  return `tornado-sol-${amount}-${nullifierHex}-${secretHex}`;
}

export function parseNote(note: string): { amount: number; nullifier: Uint8Array; secret: Uint8Array } | null {
  try {
    const parts = note.split('-');
    if (parts.length !== 5 || parts[0] !== 'tornado' || parts[1] !== 'sol') {
      return null;
    }
    
    const amount = parseFloat(parts[2]);
    const nullifier = new Uint8Array(Buffer.from(parts[3], 'hex'));
    const secret = new Uint8Array(Buffer.from(parts[4], 'hex'));
    
    return { amount, nullifier, secret };
  } catch (error) {
    console.error('Failed to parse note:', error);
    return null;
  }
}
