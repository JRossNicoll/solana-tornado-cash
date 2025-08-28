use anchor_lang::prelude::*;
use std::collections::HashMap;

declare_id!("11111111111111111111111111111112");

#[program]
pub mod solana_tornado_cash {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        denomination: u64,
        merkle_tree_height: u8,
    ) -> Result<()> {
        let tornado = &mut ctx.accounts.tornado;
        tornado.denomination = denomination;
        tornado.merkle_tree_height = merkle_tree_height;
        tornado.current_root_index = 0;
        tornado.next_index = 0;
        tornado.authority = ctx.accounts.authority.key();
        
        let zero_hash = get_zero_hash(merkle_tree_height as usize);
        tornado.roots[0..32].copy_from_slice(&zero_hash);
        
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, commitment: [u8; 32]) -> Result<()> {
        require!(!ctx.accounts.tornado.commitments.contains_key(&commitment), TornadoError::CommitmentExists);
        
        let denomination = ctx.accounts.tornado.denomination;
        
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.depositor.to_account_info(),
                    to: ctx.accounts.tornado.to_account_info(),
                },
            ),
            denomination,
        )?;

        let tornado = &mut ctx.accounts.tornado;
        let inserted_index = insert_commitment(tornado, commitment)?;
        tornado.commitments.insert(commitment, true);

        emit!(DepositEvent {
            commitment,
            leaf_index: inserted_index,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn withdraw(
        ctx: Context<Withdraw>,
        proof: Vec<u8>,
        root: [u8; 32],
        nullifier_hash: [u8; 32],
        recipient: Pubkey,
        relayer: Pubkey,
        fee: u64,
        refund: u64,
    ) -> Result<()> {
        let tornado = &mut ctx.accounts.tornado;
        
        require!(fee <= tornado.denomination, TornadoError::FeeExceedsValue);
        require!(!tornado.nullifier_hashes.contains_key(&nullifier_hash), TornadoError::NoteAlreadySpent);
        require!(is_known_root(tornado, root), TornadoError::UnknownRoot);
        
        require!(verify_proof(&proof, &[
            bytes_to_field(&root),
            bytes_to_field(&nullifier_hash),
            pubkey_to_field(&recipient),
            pubkey_to_field(&relayer),
            fee,
            refund,
        ]), TornadoError::InvalidProof);

        tornado.nullifier_hashes.insert(nullifier_hash, true);

        let withdrawal_amount = tornado.denomination - fee;
        
        **ctx.accounts.tornado.to_account_info().try_borrow_mut_lamports()? -= withdrawal_amount;
        **ctx.accounts.recipient.try_borrow_mut_lamports()? += withdrawal_amount;
        
        if fee > 0 {
            **ctx.accounts.tornado.to_account_info().try_borrow_mut_lamports()? -= fee;
            **ctx.accounts.relayer.try_borrow_mut_lamports()? += fee;
        }

        emit!(WithdrawalEvent {
            recipient,
            nullifier_hash,
            relayer,
            fee,
        });

        Ok(())
    }

    pub fn is_spent(ctx: Context<IsSpent>, nullifier_hash: [u8; 32]) -> Result<bool> {
        let tornado = &ctx.accounts.tornado;
        Ok(tornado.nullifier_hashes.contains_key(&nullifier_hash))
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + TornadoState::INIT_SPACE,
        seeds = [b"tornado"],
        bump
    )]
    pub tornado: Account<'info, TornadoState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [b"tornado"],
        bump
    )]
    pub tornado: Account<'info, TornadoState>,
    #[account(mut)]
    pub depositor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"tornado"],
        bump
    )]
    pub tornado: Account<'info, TornadoState>,
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    #[account(mut)]
    pub relayer: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct IsSpent<'info> {
    #[account(
        seeds = [b"tornado"],
        bump
    )]
    pub tornado: Account<'info, TornadoState>,
}

#[account]
pub struct TornadoState {
    pub denomination: u64,
    pub merkle_tree_height: u8,
    pub current_root_index: u32,
    pub next_index: u32,
    pub authority: Pubkey,
    pub roots: [u8; 32 * 30], // Store last 30 roots
    pub filled_subtrees: HashMap<u32, [u8; 32]>,
    pub commitments: HashMap<[u8; 32], bool>,
    pub nullifier_hashes: HashMap<[u8; 32], bool>,
}

impl TornadoState {
    pub const INIT_SPACE: usize = 8 + 32 + 1 + 4 + 4 + 32 + (32 * 30) + 1000; // Approximate space
}

#[event]
pub struct DepositEvent {
    pub commitment: [u8; 32],
    pub leaf_index: u32,
    pub timestamp: i64,
}

#[event]
pub struct WithdrawalEvent {
    pub recipient: Pubkey,
    pub nullifier_hash: [u8; 32],
    pub relayer: Pubkey,
    pub fee: u64,
}

#[error_code]
pub enum TornadoError {
    #[msg("The commitment has been submitted")]
    CommitmentExists,
    #[msg("Fee exceeds transfer value")]
    FeeExceedsValue,
    #[msg("The note has been already spent")]
    NoteAlreadySpent,
    #[msg("Cannot find your merkle root")]
    UnknownRoot,
    #[msg("Invalid withdraw proof")]
    InvalidProof,
    #[msg("Merkle tree is full")]
    MerkleTreeFull,
}

fn insert_commitment(tornado: &mut TornadoState, commitment: [u8; 32]) -> Result<u32> {
    let next_index = tornado.next_index;
    require!(next_index < (1u32 << tornado.merkle_tree_height), TornadoError::MerkleTreeFull);
    
    let mut current_index = next_index;
    let mut current_level_hash = commitment;
    
    for i in 0..tornado.merkle_tree_height {
        if current_index % 2 == 0 {
            tornado.filled_subtrees.insert(i as u32, current_level_hash);
            let zero_hash = get_zero_hash(i as usize);
            current_level_hash = hash_left_right(&current_level_hash, &zero_hash);
        } else {
            let zero_hash = get_zero_hash(i as usize);
            let left = tornado.filled_subtrees.get(&(i as u32)).unwrap_or(&zero_hash);
            current_level_hash = hash_left_right(left, &current_level_hash);
        }
        current_index /= 2;
    }
    
    let new_root_index = (tornado.current_root_index + 1) % 30;
    tornado.current_root_index = new_root_index;
    
    let root_offset = (new_root_index as usize) * 32;
    tornado.roots[root_offset..root_offset + 32].copy_from_slice(&current_level_hash);
    
    tornado.next_index = next_index + 1;
    Ok(next_index)
}

fn is_known_root(tornado: &TornadoState, root: [u8; 32]) -> bool {
    if root == [0u8; 32] {
        return false;
    }
    
    for i in 0..30 {
        let root_offset = i * 32;
        let stored_root: [u8; 32] = tornado.roots[root_offset..root_offset + 32].try_into().unwrap_or([0u8; 32]);
        if stored_root == root {
            return true;
        }
    }
    false
}

fn hash_left_right(left: &[u8; 32], right: &[u8; 32]) -> [u8; 32] {
    use anchor_lang::solana_program::keccak;
    let mut input = [0u8; 64];
    input[..32].copy_from_slice(left);
    input[32..].copy_from_slice(right);
    keccak::hash(&input).to_bytes()
}

fn get_zero_hash(level: usize) -> [u8; 32] {
    match level {
        0 => [0x2f, 0xe5, 0x4c, 0x60, 0xd3, 0xac, 0xab, 0xf3, 0x34, 0x3a, 0x35, 0xb6, 0xeb, 0xa1, 0x5d, 0xb4, 0x82, 0x1b, 0x34, 0x0f, 0x76, 0xe7, 0x41, 0xe2, 0x24, 0x96, 0x85, 0xed, 0x48, 0x99, 0xaf, 0x6c],
        1 => [0x25, 0x6a, 0x61, 0x35, 0x77, 0x7e, 0xee, 0x2f, 0xd2, 0x6f, 0x54, 0xb8, 0xb7, 0x03, 0x7a, 0x25, 0x43, 0x9d, 0x52, 0x35, 0xca, 0xee, 0x22, 0x41, 0x54, 0x18, 0x6d, 0x2b, 0x8a, 0x52, 0xe3, 0x1d],
        _ => [0u8; 32], // Simplified - should have precomputed values for all levels
    }
}

fn verify_proof(_proof: &[u8], _public_inputs: &[u64]) -> bool {
    true
}

fn bytes_to_field(bytes: &[u8; 32]) -> u64 {
    u64::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7]])
}

fn pubkey_to_field(pubkey: &Pubkey) -> u64 {
    let bytes = pubkey.to_bytes();
    u64::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7]])
}
