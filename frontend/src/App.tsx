import { useMemo, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
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
          <div className="min-h-screen bg-[#000403]">
            {/* Top Navigation Bar */}
            <nav className="border-b border-[#94febf]/10 bg-[#000403]">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-2">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="#94febf" opacity="0.8"/>
                        <path d="M3 7V17L12 22L21 17V7" stroke="#94febf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 12V22" stroke="#94febf" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span className="text-[#94febf] text-xl font-bold">tornado</span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <a href="#" className="text-[#94febf]/60 hover:text-[#94f9ba] transition-colors">Voting*</a>
                      <a href="#" className="text-[#94febf]/60 hover:text-[#94f9ba] transition-colors">Compliance</a>
                      <a href="#" className="text-[#94febf]/60 hover:text-[#94f9ba] transition-colors">Docs</a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="px-3 py-1 bg-[#181818] border border-[#94febf]/20 text-[#94f9ba] rounded text-sm">
                      Solana
                    </button>
                    <button className="p-2 bg-[#181818] border border-[#94febf]/20 text-[#94f9ba] rounded">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6m0 6v6m-6-7h6m6 0h-6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </nav>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <TornadoMixer onDenominationChange={setSelectedDenomination} />
                  </div>
                  <div>
                    <Statistics denomination={selectedDenomination} />
                  </div>
                </div>

                <footer className="mt-16 border-t border-[#94febf]/10 pt-8">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 text-[#94febf]/60">
                      <span>Donations address: <span className="text-[#5cf6a4] font-mono">0x84ef...0390</span></span>
                      <span className="text-[#94febf]/40">|</span>
                      <span>Tornado Cash version: <span className="text-[#5cf6a4]">5bc4b44</span></span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <a href="https://github.com/tornadocash" className="text-[#94febf]/60 hover:text-[#3bf0a1] transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                      </a>
                      <a href="https://twitter.com/tornadocash" className="text-[#94febf]/60 hover:text-[#3bf0a1] transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </footer>
              </div>
            </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
