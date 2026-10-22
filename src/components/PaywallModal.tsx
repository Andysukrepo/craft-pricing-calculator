import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  ShieldCheck,
  ExternalLink,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { DEFAULT_PAYHIP_URL } from '../utils/license';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivate: (key: string) => boolean;
  payhipUrl?: string;
  featureTriggered?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  onActivate,
  payhipUrl = DEFAULT_PAYHIP_URL,
  featureTriggered,
}) => {
  const [inputKey, setInputKey] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmed = inputKey.trim();
    if (!trimmed) {
      setErrorMsg('Please enter your license key.');
      return;
    }

    const success = onActivate(trimmed);
    if (success) {
      setSuccessMsg('PRO License activated successfully! Enjoy unlimited crafting features.');
      setTimeout(() => {
        onClose();
        setInputKey('');
        setSuccessMsg(null);
      }, 1200);
    } else {
      setErrorMsg('Invalid license key format. Please check the key from your Payhip receipt or enter "PRO" to test.');
    }
  };

  const handleQuickTest = () => {
    setInputKey('PRO');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#dbe1e6] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
      >
        {/* Top Header Banner */}
        <div className="bg-[#2d3e51] text-white p-6 pb-7 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider mb-2.5 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>This Man Makes • PRO Membership</span>
          </div>

          <h2 id="paywall-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Unlock Unlimited Craft Pricing
          </h2>

          <p className="text-xs sm:text-sm text-slate-200 mt-1.5 leading-relaxed">
            {featureTriggered ? (
              <span className="font-semibold text-amber-200">
                {featureTriggered}
              </span>
            ) : (
              'Take your handmade craft business to the next level with full workspace features.'
            )}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Benefits Grid */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5d6d7d]">
              Everything included in PRO
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#2d3e51]">
              <li className="flex items-start gap-2.5">
                <div className="p-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>
                  <strong>Unlimited saved products & variations</strong> (Free tier limited to 2)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="p-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>
                  <strong>Unlimited materials library</strong> with supplier price tracking (Free tier limited to 5)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="p-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>
                  <strong>Full CSV data exports</strong> for spreadsheet accounting & tax bookkeeping
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="p-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>
                  <strong>Complete Profit Simulator</strong> & seasonal wholesale pricing models
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="p-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>
                  <strong>Lifetime access</strong> — one-time purchase, zero recurring subscriptions
                </span>
              </li>
            </ul>
          </div>

          {/* Payhip Purchase CTA */}
          <div className="bg-[#f8fafc] border border-[#dbe1e6] rounded-2xl p-4 sm:p-5 text-center space-y-3">
            <a
              href={payhipUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#0072ce] hover:bg-[#005ea6] active:scale-95 text-white text-sm font-bold shadow-sm hover:shadow transition"
            >
              <span className="text-sm leading-none" role="img" aria-label="star">⭐</span>
              <span>Unlock PRO on Payhip</span>
              <ExternalLink className="w-4 h-4 ml-0.5" />
            </a>
            <p className="text-[11px] text-[#5d6d7d] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Instant license key delivery to your email after checkout.</span>
            </p>
          </div>

          {/* Key Activation Form */}
          <div className="pt-2 border-t border-[#dbe1e6]">
            <form onSubmit={handleActivate} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="license-key-input"
                  className="block text-xs font-bold text-[#2d3e51] flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#2d3e51]" />
                  <span>Already bought? Activate your key</span>
                </label>
                <button
                  type="button"
                  onClick={handleQuickTest}
                  className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 underline"
                >
                  Fill test key (PRO)
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  id="license-key-input"
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Paste your Payhip key (e.g. PRO or XXXX-XXXX)"
                  className="flex-1 text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 text-[#2d3e51] uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#34495d] hover:bg-[#2d3e51] active:scale-98 text-white text-xs font-bold transition shadow-xs"
                >
                  Activate
                </button>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
