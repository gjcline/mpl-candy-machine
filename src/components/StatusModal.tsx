import React from 'react';
import { CheckCircle, AlertCircle, Loader2, X, ExternalLink } from 'lucide-react';

interface StatusModalProps {
  status: {
    type: 'success' | 'error' | 'loading' | null;
    message: string;
    txSignature?: string;
  };
  onClose: () => void;
}

const StatusModal: React.FC<StatusModalProps> = ({ status, onClose }) => {
  if (!status.type) return null;

  const getIcon = () => {
    switch (status.type) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-16 h-16 text-red-400" />;
      case 'loading':
        return <Loader2 className="w-16 h-16 text-blue-400 animate-spin" />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (status.type) {
      case 'success':
        return 'Mint Successful!';
      case 'error':
        return 'Mint Failed';
      case 'loading':
        return 'Minting in Progress';
      default:
        return '';
    }
  };

  const getBgColor = () => {
    switch (status.type) {
      case 'success':
        return 'from-green-900/50 to-emerald-900/50';
      case 'error':
        return 'from-red-900/50 to-pink-900/50';
      case 'loading':
        return 'from-blue-900/50 to-indigo-900/50';
      default:
        return 'from-gray-900/50 to-gray-800/50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-gradient-to-br ${getBgColor()} border border-white/20 rounded-2xl p-8 max-w-md w-full mx-auto backdrop-blur-sm shadow-2xl`}>
        {/* Close Button */}
        {status.type !== 'loading' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Content */}
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            {getIcon()}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white">
            {getTitle()}
          </h3>

          {/* Message */}
          <p className="text-gray-300 leading-relaxed">
            {status.message}
          </p>

          {/* Transaction Link */}
          {status.type === 'success' && status.txSignature && status.txSignature !== 'multiple-transactions' && (
            <a
              href={`https://explorer.solana.com/tx/${status.txSignature}?cluster=mainnet-beta`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white hover:bg-white/20 transition-colors"
            >
              View Transaction
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          )}

          {/* Multiple transactions note */}
          {status.type === 'success' && status.txSignature === 'multiple-transactions' && (
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm text-gray-300">
                Multiple NFTs were minted in separate transactions. Check your wallet for the new NFTs!
              </p>
            </div>
          )}

          {/* Close Button for Success/Error */}
          {status.type !== 'loading' && (
            <button
              onClick={onClose}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusModal;