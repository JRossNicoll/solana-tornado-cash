import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { ArrowDownCircle, ArrowUpCircle, Copy, Loader2, CheckCircle } from 'lucide-react';

const DENOMINATION_OPTIONS = [0.1, 1, 10, 100];

interface TornadoMixerProps {
  onDenominationChange?: (amount: number) => void;
}

export default function TornadoMixer({ onDenominationChange }: TornadoMixerProps) {
  const { publicKey } = useWallet();
  
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
    const nullifier = Array.from(crypto.getRandomValues(new Uint8Array(31)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(31)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    
    const noteString = `tornado-sol-${depositAmount}-devnet-${nullifier}${secret}`;
    setNote(noteString);
    return noteString;
  }, [depositAmount]);

  const handleDeposit = async () => {
    if (!publicKey) {
      setStatus('Please connect your wallet first');
      return;
    }

    setDepositLoading(true);
    setStatus('');

    try {
      const generatedNote = generateNote();
      
      
      setStatus(`Deposit simulated successfully! Save your note: ${generatedNote}`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      setStatus(`Deposit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      new PublicKey(recipientAddress);
      
      
      setStatus('Withdrawal simulated successfully!');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      setStatus(`Withdrawal failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    <Card className="bg-[#1a1f26] border border-[#94f9ba]/20">
      <CardHeader>
        <CardTitle className="text-[#94f9ba] text-2xl">Privacy Mixer</CardTitle>
        <CardDescription className="text-[#94f9ba]/60">
          Deposit and withdraw SOL privately using zkSNARK proofs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#0a0e11]">
            <TabsTrigger value="deposit" className="data-[state=active]:bg-[#94f9ba] data-[state=active]:text-[#0a0e11] text-[#94f9ba]/60">
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="data-[state=active]:bg-[#94f9ba] data-[state=active]:text-[#0a0e11] text-[#94f9ba]/60">
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
                      variant={depositAmount === amount ? "default" : "outline"}
                      className={`${
                        depositAmount === amount 
                          ? "bg-[#94f9ba] text-[#0a0e11] hover:bg-[#5cf6a4]" 
                          : "border-[#94f9ba]/40 text-[#94f9ba] hover:bg-[#94f9ba]/10"
                      }`}
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
                className="w-full bg-[#5cf6a4] text-[#0a0e11] hover:bg-[#94f9ba] disabled:opacity-50"
              >
                {depositLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Deposit...
                  </>
                ) : (
                  <>
                    <ArrowDownCircle className="h-4 w-4 mr-2" />
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
                className="w-full bg-[#5cf6a4] text-[#0a0e11] hover:bg-[#94f9ba] disabled:opacity-50"
              >
                {withdrawLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Proof and Withdrawing...
                  </>
                ) : (
                  <>
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
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
