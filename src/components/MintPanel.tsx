import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Minus, Plus, Zap, Wallet, AlertTriangle, Loader2 } from 'lucide-react';

interface MintPanelProps {
  isConnected: boolean;
  mintQuantity: number;
  setMintQuantity: (quantity: number) => void;
  currentPrice: number;
  userBalance: number;
  onMint: () => void;
  loading: boolean;
  candyMachineLoaded: boolean;
}

const MintPanel: React.FC<MintPanelProps> = ({
  isConnected,
  mintQuantity,
  setMintQuantity,
  currentPrice,
  userBalance,
  onMint,
  loading,
  candyMachineLoaded,
}) => {
  const totalCost = mintQuantity * currentPrice;
  const hasInsufficientFunds = isConnected && userBalance < totalCost;
  const canMint = isConnected && candyMachineLoaded && !loading && mintQuantity >= 10 && !hasInsufficientFunds;

  const handleQuantityChange = (newQuantity: number) => {
    const clampedQuantity = Math.max(10, Math.min(100, newQuantity));
    setMintQuantity(clampedQuantity);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Mint NFTs</h2>
        <p className="text-gray-300">Minimum 10 NFTs per transaction</p>
      </div>

      {!isConnected ? (
        <div className="text-center space-y-6">
          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <Wallet className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <p className="text-gray-300 mb-4">Connect your wallet to start minting</p>
            <WalletMultiButton className="!bg-gradient-to-r !from-blue-500 !to-purple-600 hover:!from-blue-600 hover:!to-purple-700 !border-0 !rounded-xl !px-8 !py-4 !font-semibold !text-white !transition-all !duration-200 !shadow-lg hover:!shadow-xl !w-full" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* User Balance */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Your Balance</span>
              <span className="text-white font-semibold">{userBalance.toFixed(4)} SOL</span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-3">
            <label className="block text-white font-semibold">Quantity</label>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => handleQuantityChange(mintQuantity - 1)}
                disabled={mintQuantity <= 10}
                className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <div className="flex-1 max-w-32">
                <input
                  type="number"
                  value={mintQuantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 10)}
                  min="10"
                  max="100"
                  className="w-full px-4 py-3 text-center text-xl font-bold bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                />
              </div>
              
              <button
                onClick={() => handleQuantityChange(mintQuantity + 1)}
                disabled={mintQuantity >= 100}
                className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center text-sm text-gray-400">
              Min: 10 • Max: 100 per transaction
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Price per NFT</span>
              <span className="text-white font-semibold">{currentPrice} SOL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Quantity</span>
              <span className="text-white font-semibold">{mintQuantity}</span>
            </div>
            <div className="border-t border-white/10 pt-2">
              <div className="flex justify-between">
                <span className="text-white font-semibold">Total Cost</span>
                <span className="text-white font-bold text-lg">{totalCost.toFixed(3)} SOL</span>
              </div>
            </div>
          </div>

          {/* Warning for insufficient funds */}
          {hasInsufficientFunds && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-red-300 text-sm">
                  Insufficient SOL balance. Need {totalCost.toFixed(3)} SOL.
                </span>
              </div>
            </div>
          )}

          {/* Mint Button */}
          <button
            onClick={onMint}
            disabled={!canMint}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
              canMint
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Minting...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Mint {mintQuantity} NFTs</span>
              </>
            )}
          </button>

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-400 space-y-1">
            <p>Each NFT is a unique digital collectible</p>
            <p>Stored permanently on Solana blockchain</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MintPanel;