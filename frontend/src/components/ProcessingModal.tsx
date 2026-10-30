import React from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import type { ProcessingState } from '../types';

interface ProcessingModalProps {
  state: ProcessingState;
  statusMessage?: string;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({ state, statusMessage }) => {
  if (state !== 'uploading' && state !== 'processing') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel max-w-md w-full rounded-3xl p-8 border border-slate-700 shadow-2xl text-center relative overflow-hidden">
        {/* Glowing Background gradient */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Spinner */}
        <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-red-500/20 animate-ping opacity-30" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-rose-400 p-0.5 shadow-lg shadow-red-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 font-heading">
          {state === 'uploading' ? 'Uploading Documents' : 'Processing Document Streams'}
        </h3>

        <p className="text-sm text-slate-400 mb-6">
          {statusMessage ||
            (state === 'uploading'
              ? 'Transferring securely to isolated task environment...'
              : 'Executing native transformations and stream optimization...')}
        </p>

        {/* Security badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted channel • Ephemeral memory sandbox</span>
        </div>
      </div>
    </div>
  );
};
