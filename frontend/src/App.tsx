import { useMemo } from 'react';
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
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
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
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
            <div className="container mx-auto px-4 py-8">
              <header className="text-center mb-12">
                <div className="flex items-center justify-center mb-4">
                  <Shield className="h-12 w-12 text-purple-400 mr-3" />
                  <h1 className="text-4xl font-bold text-white">Solana Tornado Cash</h1>
                </div>
                <p className="text-xl text-gray-300 mb-6">
                  Privacy solution for Solana - Non-custodial private transactions
                </p>
                <div className="flex justify-center space-x-4">
                  <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
                  <WalletDisconnectButton className="!bg-gray-600 hover:!bg-gray-700" />
                </div>
              </header>

              <div className="max-w-4xl mx-auto">
                <Alert className="mb-8 border-yellow-500 bg-yellow-500/10">
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-yellow-200">
                    This is a demonstration implementation. Use only on devnet with test funds.
                  </AlertDescription>
                </Alert>

                <TornadoMixer />

                <div className="mt-12 grid md:grid-cols-2 gap-8">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-purple-400" />
                        How It Works
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-300 space-y-3">
                      <div className="flex items-start space-x-3">
                        <ArrowDownCircle className="h-5 w-5 text-green-400 mt-0.5" />
                        <div>
                          <p className="font-semibold">1. Deposit</p>
                          <p className="text-sm">Send SOL with a secret commitment to the mixer</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-purple-400 mt-0.5" />
                        <div>
                          <p className="font-semibold">2. Mix</p>
                          <p className="text-sm">Your deposit joins others in a privacy pool</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <ArrowUpCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-semibold">3. Withdraw</p>
                          <p className="text-sm">Use your secret to withdraw to any address</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Privacy Features</CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-300 space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>zkSNARK proof verification</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Merkle tree commitment scheme</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Relayer support for anonymity</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Non-custodial design</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <footer className="mt-12 text-center text-gray-400">
                  <p>Built with ❤️ for Solana privacy</p>
                  <div className="flex justify-center space-x-4 mt-2">
                    <a href="https://github.com/tornadocash" className="flex items-center hover:text-purple-400">
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
