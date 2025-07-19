import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ExternalLink, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  isConnected: boolean;
  stats: {
    itemsRedeemed: number;
    itemsAvailable: number;
    remainingSupply: number;
    progressPercentage: number;
    currentPrice: number;
  } | null;
}

const HeroSection: React.FC<HeroSectionProps> = ({ isConnected, stats }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 to-transparent" />
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute top-20 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <Sparkles className="w-4 h-4 text-yellow-400 mr-2" />
                  <span className="text-sm text-white font-medium">Premium NFT Collection</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                  Mint Your
                  <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    NFT Collection
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 max-w-lg mx-auto lg:mx-0">
                  Join an exclusive community of collectors. Each NFT is uniquely generated and stored on the Solana blockchain.
                </p>
              </div>

              {/* Quick Stats */}
              {stats && (
                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                  <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="text-2xl font-bold text-white">{stats.currentPrice}</div>
                    <div className="text-sm text-gray-400">SOL</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="text-2xl font-bold text-white">{stats.remainingSupply.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Left</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="text-2xl font-bold text-white">{stats.progressPercentage.toFixed(0)}%</div>
                    <div className="text-sm text-gray-400">Sold</div>
                  </div>
                </div>
              )}

              {/* Wallet Connection */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <WalletMultiButton className="!bg-gradient-to-r !from-blue-500 !to-purple-600 hover:!from-blue-600 hover:!to-purple-700 !border-0 !rounded-xl !px-8 !py-4 !font-semibold !text-white !transition-all !duration-200 !shadow-lg hover:!shadow-xl" />
                
                {isConnected && (
                  <a
                    href={`https://explorer.solana.com/address/${process.env.CANDY_MACHINE_ID}?cluster=mainnet-beta`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white hover:bg-white/20 transition-colors"
                  >
                    View on Explorer
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                )}
              </div>
            </div>

            {/* Right Column - NFT Preview */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-xl opacity-30 scale-110" />
                
                {/* NFT Card */}
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <div className="w-80 h-80 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center border border-white/10">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white mb-2">NFT Preview</div>
                        <div className="text-gray-400">Unique Digital Collectible</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <div className="text-lg font-semibold text-white mb-1">Premium Collection</div>
                    <div className="text-gray-400">Solana Blockchain</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;