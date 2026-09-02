import React, { useState } from 'react';
import { Copy, Check, Building2, Info } from 'lucide-react';
import type { BankTransferConfig } from '@/services/PaymentService';

interface BankTransferDetailsProps {
  config: BankTransferConfig;
  orderNumber?: string;
}

export const BankTransferDetails: React.FC<BankTransferDetailsProps> = ({ config, orderNumber }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(config.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-luxury-black border border-luxury-gold/30 p-5 rounded space-y-4">
      <div className="flex items-center gap-2.5 text-luxury-gold text-xs uppercase tracking-luxury-wide font-medium">
        <Building2 className="h-4 w-4" />
        <span>Our Bank Account Details</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-luxury-card/60 p-4 border border-luxury-border rounded">
        <div>
          <span className="text-[10px] uppercase text-luxury-muted tracking-wider block mb-0.5">Bank Name</span>
          <span className="text-white font-medium">{config.bankName}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase text-luxury-muted tracking-wider block mb-0.5">Account Name</span>
          <span className="text-white font-medium">{config.accountName}</span>
        </div>
        <div className="sm:col-span-2 flex items-center justify-between pt-2 border-t border-luxury-border">
          <div>
            <span className="text-[10px] uppercase text-luxury-muted tracking-wider block mb-0.5">Account Number (NGN)</span>
            <span className="text-lg font-mono text-luxury-gold font-bold tracking-wider">{config.accountNumber}</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-luxury-gold/50 hover:border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 text-xs transition-colors rounded cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Number'}</span>
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2 text-[11px] text-luxury-muted bg-luxury-gold/5 p-3 border border-luxury-gold/20 rounded leading-relaxed">
        <Info className="h-4 w-4 text-luxury-gold shrink-0 mt-0.5" />
        <div>
          <p>{config.instructions}</p>
          {orderNumber && (
            <p className="mt-1 font-medium text-white">
              Transfer Reference: <span className="text-luxury-gold font-mono">{orderNumber}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

