import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey('2MWC2S6c94YGKQ2yicmXweZBd93VbTaDkUcfA16R3hSK');

export const TORNADO_STATE_SEED = 'tornado-state';

export const getTornadoStatePDA = () => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(TORNADO_STATE_SEED)],
    PROGRAM_ID
  );
  return pda;
};

export const getAnchorProgram = (wallet: any, cluster: string = 'devnet') => {
  const endpoint = cluster === 'devnet' 
    ? 'https://api.devnet.solana.com'
    : 'http://localhost:8899';
    
  const connection = new Connection(endpoint, 'confirmed');
  
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    { commitment: 'confirmed' }
  );
  
  return {
    connection,
    provider,
    programId: PROGRAM_ID,
    tornadoStatePDA: getTornadoStatePDA()
  };
};
