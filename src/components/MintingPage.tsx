import React, { useState, useEffect, useMemo } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-web3js-adapters';
import { 
  fetchCandyMachine, 
  mplCandyMachine,
  mintV2,
  CandyMachine as UmiCandyMachine,
} from '@metaplex-foundation/mpl-candy-machine';
import { setComputeUnitLimit } from '@metaplex-foundation/mpl-toolbox';
import { transactionBuilder, generateSigner, publicKey } from '@metaplex-foundation/umi';
import { Loader2, Zap, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import HeroSection from './HeroSection';
import MintPanel from './MintPanel';
import StatusModal from './StatusModal';

const CANDY_MACHINE_ID = '3shPjsUctq2NmwLoswMidg46XX2SMFcaearGshYLtKYw';

interface MintStatus {
  type: 'success' | 'error' | 'loading' | null;
  message: string;
  txSignature?: string;
}

const MintingPage: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [candyMachine, setCandyMachine] = useState<UmiCandyMachine | null>(null);
  const [loading, setLoading] = useState(false);
  const [mintQuantity, setMintQuantity] = useState(10);
  const [mintStatus, setMintStatus] = useState<MintStatus>({ type: null, message: '' });
  const [userBalance, setUserBalance] = useState(0);

  const umi = useMemo(() => {
    const umi = createUmi(connection.rpcEndpoint).use(mplCandyMachine());
    
    if (wallet.publicKey) {
      umi.use(walletAdapterIdentity(wallet));
    }
    
    return umi;
  }, [connection, wallet]);

  // Calculate current mint price based on items redeemed
  const currentMintPrice = useMemo(() => {
    if (!candyMachine) return 0.005;
    
    const itemsRedeemed = Number(candyMachine.itemsRedeemed);
    return itemsRedeemed < 100000 ? 0.005 : 0.01;
  }, [candyMachine]);

  // Fetch candy machine data
  const fetchCandyMachineData = async () => {
    try {
      setLoading(true);
      const candyMachineData = await fetchCandyMachine(
        umi,
        publicKey(CANDY_MACHINE_ID)
      );
      setCandyMachine(candyMachineData);
    } catch (error) {
      console.error('Error fetching candy machine:', error);
      setMintStatus({
        type: 'error',
        message: 'Failed to load candy machine data'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user SOL balance
  const fetchUserBalance = async () => {
    if (wallet.publicKey) {
      try {
        const balance = await connection.getBalance(wallet.publicKey);
        setUserBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    }
  };

  useEffect(() => {
    fetchCandyMachineData();
  }, [umi]);

  useEffect(() => {
    if (wallet.connected) {
      fetchUserBalance();
    }
  }, [wallet.connected, wallet.publicKey, connection]);

  const handleMint = async () => {
    if (!wallet.connected || !candyMachine) {
      setMintStatus({
        type: 'error',
        message: 'Please connect your wallet first'
      });
      return;
    }

    if (mintQuantity < 10) {
      setMintStatus({
        type: 'error',
        message: 'Minimum mint quantity is 10 NFTs'
      });
      return;
    }

    const totalCost = currentMintPrice * mintQuantity;
    if (userBalance < totalCost) {
      setMintStatus({
        type: 'error',
        message: `Insufficient SOL balance. Need ${totalCost} SOL, have ${userBalance.toFixed(4)} SOL`
      });
      return;
    }

    try {
      setMintStatus({ type: 'loading', message: `Minting ${mintQuantity} NFTs...` });

      const mintPromises = [];
      
      for (let i = 0; i < mintQuantity; i++) {
        const nftMint = generateSigner(umi);
        
        const mintTx = transactionBuilder()
          .add(setComputeUnitLimit(umi, { units: 800_000 }))
          .add(
            mintV2(umi, {
              candyMachine: publicKey(CANDY_MACHINE_ID),
              nftMint,
              collectionMint: candyMachine.collectionMint,
              collectionUpdateAuthority: candyMachine.authority,
            })
          );

        mintPromises.push(mintTx.sendAndConfirm(umi));
      }

      const results = await Promise.allSettled(mintPromises);
      const successful = results.filter(result => result.status === 'fulfilled');
      const failed = results.filter(result => result.status === 'rejected');

      if (successful.length > 0) {
        setMintStatus({
          type: 'success',
          message: `Successfully minted ${successful.length} NFT${successful.length > 1 ? 's' : ''}!${failed.length > 0 ? ` ${failed.length} failed.` : ''}`,
          txSignature: successful.length > 0 ? 'multiple-transactions' : undefined
        });
        
        // Refresh candy machine data and user balance
        fetchCandyMachineData();
        fetchUserBalance();
      } else {
        setMintStatus({
          type: 'error',
          message: 'All mint transactions failed. Please try again.'
        });
      }
    } catch (error: any) {
      console.error('Mint error:', error);
      setMintStatus({
        type: 'error',
        message: error.message || 'Minting failed. Please try again.'
      });
    }
  };

  const candyMachineStats = useMemo(() => {
    if (!candyMachine) return null;

    const itemsRedeemed = Number(candyMachine.itemsRedeemed);
    const itemsAvailable = Number(candyMachine.itemsAvailable);
    const remainingSupply = itemsAvailable - itemsRedeemed;
    const progressPercentage = (itemsRedeemed / itemsAvailable) * 100;

    return {
      itemsRedeemed,
      itemsAvailable,
      remainingSupply,
      progressPercentage,
      currentPrice: currentMintPrice,
    };
  }, [candyMachine, currentMintPrice]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <HeroSection 
        isConnected={wallet.connected}
        stats={candyMachineStats}
      />

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column - Info */}
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Collection Stats</h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                </div>
              ) : candyMachineStats ? (
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Zap className="w-5 h-5 text-yellow-400 mr-2" />
                      <span className="text-sm text-gray-300">Current Price</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {candyMachineStats.currentPrice} SOL
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-sm text-gray-300">Minted</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {candyMachineStats.itemsRedeemed.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="w-5 h-5 text-blue-400 mr-2" />
                      <span className="text-sm text-gray-300">Remaining</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {candyMachineStats.remainingSupply.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-sm text-gray-300">Progress</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {candyMachineStats.progressPercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-red-400">
                  Failed to load collection data
                </div>
              )}

              {/* Progress Bar */}
              {candyMachineStats && (
                <div className="mt-6">
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(candyMachineStats.progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Tiers */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Pricing Tiers</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">First 100,000 NFTs</span>
                  <span className="text-green-400 font-semibold">0.005 SOL</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Next 150,000 NFTs</span>
                  <span className="text-yellow-400 font-semibold">0.01 SOL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Mint Panel */}
          <div className="lg:sticky lg:top-8">
            <MintPanel
              isConnected={wallet.connected}
              mintQuantity={mintQuantity}
              setMintQuantity={setMintQuantity}
              currentPrice={currentMintPrice}
              userBalance={userBalance}
              onMint={handleMint}
              loading={mintStatus.type === 'loading'}
              candyMachineLoaded={!!candyMachine}
            />
          </div>
        </div>
      </div>

      {/* Status Modal */}
      <StatusModal 
        status={mintStatus}
        onClose={() => setMintStatus({ type: null, message: '' })}
      />
    </div>
  );
};

export default MintingPage;