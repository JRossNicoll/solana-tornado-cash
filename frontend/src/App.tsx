import { useMemo, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ArrowDownCircle, ArrowUpCircle, ExternalLink } from 'lucide-react';
import TornadoMixer from './components/TornadoMixer';
import { Statistics } from './components/Statistics';
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const [selectedDenomination, setSelectedDenomination] = useState(0.1);
  
  const wallets = useMemo(
    () => [
      new UnsafeBurnerWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-[#0a0e11]">
            <div className="container mx-auto px-4 py-8">
              <header className="text-center mb-16">
                <div className="flex items-center justify-center mb-6">
                  <div className="mr-4">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="#94f9ba" opacity="0.8"/>
                      <path d="M3 7V17L12 22L21 17V7" stroke="#94f9ba" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 12V22" stroke="#94f9ba" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M7.5 9.5L12 12L16.5 9.5" stroke="#5cf6a4" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h1 className="text-6xl font-bold text-[#94f9ba] tracking-wide">tornado <span className="text-[#5cf6a4]">CASH</span></h1>
                </div>
                <p className="text-2xl text-[#94f9ba]/70 mb-8 font-light tracking-wide">
                  Privacy solution for Solana - Non-custodial private transactions
                </p>
                <div className="flex justify-center space-x-4">
                  <WalletMultiButton className="!bg-transparent !border-2 !border-[#94f9ba] !text-[#94f9ba] hover:!bg-[#94f9ba]/10 tornado-button-glow" />
                  <WalletDisconnectButton className="!bg-transparent !border-2 !border-[#94f9ba]/60 !text-[#94f9ba]/80 hover:!bg-[#94f9ba]/10 hover:!border-[#94f9ba]" />
                </div>
              </header>

              <div className="max-w-7xl mx-auto">
                <Alert className="mb-10 border-yellow-500 bg-yellow-500/10 py-4">
                  <Shield className="h-5 w-5" />
                  <AlertDescription className="text-yellow-200 text-base">
                    This is a demonstration implementation. Use only on devnet with test funds.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                  <div className="lg:col-span-2">
                    <TornadoMixer onDenominationChange={setSelectedDenomination} />
                  </div>
                  <div>
                    <Statistics denomination={selectedDenomination} />
                  </div>
                </div>

                <div className="mt-16 grid md:grid-cols-2 gap-8">
                  <Card className="bg-[#1a1f26] border-2 border-[#94f9ba]/20 tornado-glow">
                    <CardHeader>
                      <CardTitle className="text-[#94f9ba] text-xl flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-[#5cf6a4]" />
                        How It Works
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-[#94f9ba]/80 space-y-3">
                      <div className="flex items-start space-x-3">
                        <ArrowDownCircle className="h-5 w-5 text-[#5cf6a4] mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#94f9ba]">1. Deposit</p>
                          <p className="text-sm">Send SOL with a secret commitment to the mixer</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-[#5cf6a4] mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#94f9ba]">2. Mix</p>
                          <p className="text-sm">Your deposit joins others in a privacy pool</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <ArrowUpCircle className="h-5 w-5 text-[#5cf6a4] mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#94f9ba]">3. Withdraw</p>
                          <p className="text-sm">Use your secret to withdraw to any address</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1a1f26] border-2 border-[#94f9ba]/20 tornado-glow">
                    <CardHeader>
                      <CardTitle className="text-[#94f9ba] text-xl">Privacy Features</CardTitle>
                    </CardHeader>
                    <CardContent className="text-[#94f9ba]/80 space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-[#5cf6a4] rounded-full"></div>
                        <span>zkSNARK proof verification</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-[#5cf6a4] rounded-full"></div>
                        <span>Merkle tree commitment scheme</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-[#5cf6a4] rounded-full"></div>
                        <span>Relayer support for anonymity</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-[#5cf6a4] rounded-full"></div>
                        <span>Non-custodial design</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <footer className="mt-12 text-center text-[#94f9ba]/60">
                  <p>Built with ❤️ for Solana privacy</p>
                  <div className="flex justify-center space-x-4 mt-2">
                    <a href="https://github.com/tornadocash" className="flex items-center hover:text-[#5cf6a4]">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Original TornadoCash
                    </a>
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
