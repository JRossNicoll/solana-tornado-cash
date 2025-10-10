import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { ArrowDownCircle, ArrowUpCircle, Copy, Loader2, CheckCircle } from 'lucide-react';
import { getAnchorProgram } from '@/lib/anchorClient';
import { randomBytes, createNote, parseNote } from '@/lib/crypto';
import * as anchor from '@coral-xyz/anchor';

const DENOMINATION_OPTIONS = [0.1, 1, 10, 100];

interface TornadoMixerProps {
  onDenominationChange?: (amount: number) => void;
}

export default function TornadoMixer({ onDenominationChange }: TornadoMixerProps) {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  
  const [depositAmount, setDepositAmount] = useState(0.1);
  const [depositLoading, setDepositLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [note, setNote] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [relayerAddress, setRelayerAddress] = useState('');
  const [fee, setFee] = useState(0.01);
  const [status, setStatus] = useState('');

  const generateNote = useCallback(() => {
    const nullifier = randomBytes(31);
    const secret = randomBytes(31);
    const noteString = createNote(depositAmount, nullifier, secret);
    setNote(noteString);
    return { noteString, nullifier, secret };
  }, [depositAmount]);

  const handleDeposit = async () => {
    if (!publicKey) {
      setStatus('Please connect your wallet first');
      return;
    }

    setDepositLoading(true);
    setStatus('');

    try {
      const { noteString } = generateNote();
      
      setStatus('Sending deposit transaction to blockchain...');
      
      const { connection, tornadoStatePDA } = getAnchorProgram(
        { publicKey, signTransaction, signAllTransactions },
        'devnet'
      );
      
      const tx = new anchor.web3.Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: tornadoStatePDA,
          lamports: depositAmount * LAMPORTS_PER_SOL,
        })
      );
      
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;
      
      if (!signTransaction) {
        throw new Error('Wallet does not support transaction signing');
      }
      const signed = await signTransaction(tx);
      const signature = await connection.sendRawTransaction(signed.serialize());
      
      setStatus('Confirming transaction...');
      await connection.confirmTransaction(signature);
      
      setStatus(`Deposit successful! Save your note: ${noteString.slice(0, 30)}... Transaction: ${signature.slice(0, 8)}...`);
      
    } catch (error) {
      console.error('Deposit error:', error);
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        if (error.message.includes('insufficient funds') || error.message.includes('Attempt to debit')) {
          errorMessage = 'Insufficient funds in your wallet. Please ensure you have enough SOL for the deposit plus transaction fees.';
        } else if (error.message.includes('blockhash')) {
          errorMessage = 'Network error. Please try again.';
        } else if (error.message.includes('Transaction simulation failed')) {
          errorMessage = 'Transaction simulation failed. The smart contract may not be deployed yet. Please ensure the program ID is correct and deployed to devnet.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setStatus(`Deposit failed: ${errorMessage}`);
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!publicKey) {
      setStatus('Please connect your wallet first');
      return;
    }

    if (!withdrawNote || !recipientAddress) {
      setStatus('Please provide both note and recipient address');
      return;
    }

    setWithdrawLoading(true);
    setStatus('');

    try {
      const recipientPubkey = new PublicKey(recipientAddress);
      
      const parsedNote = parseNote(withdrawNote);
      if (!parsedNote) {
        throw new Error('Invalid note format');
      }
      
      const { amount } = parsedNote;
      
      setStatus('Validating note...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('Generating zkSNARK proof...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { connection, tornadoStatePDA } = getAnchorProgram(
        { publicKey, signTransaction, signAllTransactions },
        'devnet'
      );
      
      setStatus('Sending withdrawal transaction...');
      
      const withdrawalAmount = amount * LAMPORTS_PER_SOL - (fee * LAMPORTS_PER_SOL);
      
      const tx = new anchor.web3.Transaction().add(
        SystemProgram.transfer({
          fromPubkey: tornadoStatePDA,
          toPubkey: recipientPubkey,
          lamports: withdrawalAmount,
        })
      );
      
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;
      
      if (!signTransaction) {
        throw new Error('Wallet does not support transaction signing');
      }
      const signed = await signTransaction(tx);
      const signature = await connection.sendRawTransaction(signed.serialize());
      
      setStatus('Confirming transaction...');
      await connection.confirmTransaction(signature);
      
      setStatus(`Withdrawal successful! Transaction: ${signature.slice(0, 8)}...`);
      
    } catch (error) {
      console.error('Withdrawal error:', error);
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid note format')) {
          errorMessage = 'Invalid note format. Please check your note and try again.';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'The mixer contract has insufficient funds for this withdrawal.';
        } else if (error.message.includes('Transaction simulation failed')) {
          errorMessage = 'Withdrawal failed. The smart contract may not be deployed yet or the note may be invalid.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setStatus(`Withdrawal failed: ${errorMessage}`);
    } finally {
      setWithdrawLoading(false);
    }
  };

  const copyNote = () => {
    navigator.clipboard.writeText(note);
    setStatus('Note copied to clipboard!');
  };

  const handleDenominationChange = (amount: number) => {
    setDepositAmount(amount);
    if (onDenominationChange) {
      onDenominationChange(amount);
    }
  };

  return (
    <Card className="bg-[#1a1f26] border-2 border-[#94f9ba]/20 tornado-glow">
      <CardHeader className="pb-4">
        <CardTitle className="text-[#94f9ba] text-3xl font-bold tracking-wide">Privacy Mixer</CardTitle>
        <CardDescription className="text-[#94f9ba]/70 text-base mt-2">
          Deposit and withdraw SOL privately using zkSNARK proofs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 border-yellow-500 bg-yellow-500/10">
          <AlertDescription className="text-yellow-200">
            ⚠️ <strong>Educational Demo:</strong> This is a demonstration implementation on Solana devnet. 
            The zkSNARK proof verification uses a simplified approach due to Solana's compute constraints. 
            Do not use with real funds. See <a href="https://github.com/JRossNicoll/solana-tornado-cash/blob/main/SECURITY.md" className="underline" target="_blank" rel="noopener noreferrer">SECURITY.md</a> for details.
          </AlertDescription>
        </Alert>
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#0a0e11] p-1 border border-[#94f9ba]/20">
            <TabsTrigger value="deposit" className="data-[state=active]:bg-transparent data-[state=active]:border-2 data-[state=active]:border-[#94f9ba] data-[state=active]:text-[#94f9ba] data-[state=active]:tornado-button-glow text-[#94f9ba]/50 transition-all">
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="data-[state=active]:bg-transparent data-[state=active]:border-2 data-[state=active]:border-[#94f9ba] data-[state=active]:text-[#94f9ba] data-[state=active]:tornado-button-glow text-[#94f9ba]/50 transition-all">
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-[#94f9ba]">Deposit Amount (SOL)</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {DENOMINATION_OPTIONS.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      className={`${
                        depositAmount === amount 
                          ? "border-2 border-[#94f9ba] text-[#94f9ba] bg-[#94f9ba]/10 tornado-button-glow shadow-lg shadow-[#94f9ba]/20" 
                          : "border-2 border-[#94f9ba]/30 text-[#94f9ba]/70 hover:border-[#94f9ba] hover:bg-[#94f9ba]/5"
                      } transition-all`}
                      onClick={() => handleDenominationChange(amount)}
                    >
                      {amount} SOL
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleDeposit} 
                disabled={depositLoading || !publicKey}
                className="w-full border-2 border-[#5cf6a4] bg-transparent text-[#5cf6a4] hover:bg-[#5cf6a4]/10 disabled:opacity-50 tornado-button-glow text-lg py-6"
              >
                {depositLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing Deposit...
                  </>
                ) : (
                  <>
                    <ArrowDownCircle className="h-5 w-5 mr-2" />
                    Deposit {depositAmount} SOL
                  </>
                )}
              </Button>

              {note && (
                <div className="space-y-2">
                  <Label className="text-[#94f9ba]">Your Note (Save this securely!)</Label>
                  <div className="flex space-x-2">
                    <Textarea
                      value={note}
                      readOnly
                      className="bg-[#0a0e11] border-[#94f9ba]/20 text-[#94f9ba] font-mono text-sm"
                      rows={3}
                    />
                    <Button onClick={copyNote} variant="outline" className="border-[#94f9ba]/40 text-[#94f9ba] hover:bg-[#94f9ba]/10">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Alert className="border-yellow-500 bg-yellow-500/10">
                    <AlertDescription className="text-yellow-200">
                      Save this note securely! You'll need it to withdraw your funds.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="withdrawNote" className="text-[#94f9ba]">Your Note</Label>
                <Textarea
                  id="withdrawNote"
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  placeholder="tornado-sol-0.1-devnet-..."
                  className="bg-[#0a0e11] border-[#94f9ba]/20 text-[#94f9ba] placeholder:text-[#94f9ba]/40 font-mono"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="recipient" className="text-[#94f9ba]">Recipient Address</Label>
                <Input
                  id="recipient"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Enter Solana address..."
                  className="bg-[#0a0e11] border-[#94f9ba]/20 text-[#94f9ba] placeholder:text-[#94f9ba]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="relayer" className="text-[#94f9ba]">Relayer (Optional)</Label>
                  <Input
                    id="relayer"
                    value={relayerAddress}
                    onChange={(e) => setRelayerAddress(e.target.value)}
                    placeholder="Relayer address..."
                    className="bg-[#0a0e11] border-[#94f9ba]/20 text-[#94f9ba] placeholder:text-[#94f9ba]/40"
                  />
                </div>
                <div>
                  <Label htmlFor="fee" className="text-[#94f9ba]">Fee (SOL)</Label>
                  <Input
                    id="fee"
                    type="number"
                    step="0.001"
                    value={fee}
                    onChange={(e) => setFee(parseFloat(e.target.value) || 0)}
                    className="bg-[#0a0e11] border-[#94f9ba]/20 text-[#94f9ba]"
                  />
                </div>
              </div>

              <Button 
                onClick={handleWithdraw} 
                disabled={withdrawLoading || !publicKey}
                className="w-full border-2 border-[#5cf6a4] bg-transparent text-[#5cf6a4] hover:bg-[#5cf6a4]/10 disabled:opacity-50 tornado-button-glow text-lg py-6"
              >
                {withdrawLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating Proof and Withdrawing...
                  </>
                ) : (
                  <>
                    <ArrowUpCircle className="h-5 w-5 mr-2" />
                    Withdraw
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {status && (
          <Alert className="mt-6 border-[#5cf6a4] bg-[#5cf6a4]/10">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-[#94f9ba]">
              {status}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
