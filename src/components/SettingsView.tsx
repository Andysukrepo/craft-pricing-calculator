import React, { useState } from 'react';
import {
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Settings as SettingsIcon,
  Sparkles,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { AppSettings, PlatformPreset } from '../types/calculator';
import { PLATFORM_LABELS, DEFAULT_SETTINGS } from '../utils/calculator';
import { maskLicenseKey, DEFAULT_PAYHIP_URL } from '../utils/license';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetSettings: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  isPro?: boolean;
  licenseKey?: string;
  payhipUrl?: string;
  onActivateLicense?: (key: string) => boolean;
  onDeactivateLicense?: () => void;
  onUpdatePayhipUrl?: (url: string) => void;
  onOpenPaywall?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetSettings,
  onExportJSON,
  onImportJSON,
  isPro = false,
  licenseKey = '',
  payhipUrl = DEFAULT_PAYHIP_URL,
  onActivateLicense,
  onDeactivateLicense,
  onUpdatePayhipUrl,
  onOpenPaywall,
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [keyMessage, setKeyMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState(payhipUrl);
  const [urlSaved, setUrlSaved] = useState(false);
  const [form, setForm] = useState<AppSettings>({ ...settings });
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleResetClick = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 5000);
      return;
    }
    setForm({ ...DEFAULT_SETTINGS });
    onResetSettings();
    setConfirmReset(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
      e.target.value = '';
    }
  };

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyMessage(null);
    if (!keyInput.trim()) {
      setKeyMessage({ text: 'Please enter a license key.', error: true });
      return;
    }
    if (onActivateLicense) {
      const ok = onActivateLicense(keyInput.trim());
      if (ok) {
        setKeyMessage({ text: 'License successfully activated! All PRO features unlocked.', error: false });
        setKeyInput('');
      } else {
        setKeyMessage({ text: 'Invalid license key format. Please verify your key or enter "PRO" to test.', error: true });
      }
    }
  };

  const handleDeactivate = () => {
    if (onDeactivateLicense) {
      onDeactivateLicense();
      setKeyMessage({ text: 'License deactivated. Free tier limits now apply.', error: false });
    }
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdatePayhipUrl) {
      onUpdatePayhipUrl(customUrlInput.trim() || DEFAULT_PAYHIP_URL);
      setUrlSaved(true);
      setTimeout(() => setUrlSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="pb-4 border-b border-[#dbe1e6]">
        <h2 className="header-title text-[18px] font-bold text-[#1e293b]">
          Workspace &amp; Membership Settings
        </h2>
        <p className="header-subtitle text-[12px] font-normal text-[#5d6d7d] mt-1">
          Manage your Payhip PRO license, financial calculation defaults, and catalog backups.
        </p>
      </div>

      {savedNotice && (
        <div className="bg-[#e5f1e9] border border-[#dbe1e6] text-[#235c43] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings successfully saved and applied to future calculations.</span>
        </div>
      )}

      {/* Payhip PRO Membership & License Card */}
      <div className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#dbe1e6]">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isPro ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-brand text-lg font-bold text-[#2d3e51]">
                  Payhip PRO Membership
                </h3>
                {isPro ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                    Active
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200">
                    Free Plan
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5d6d7d] mt-0.5">
                {isPro
                  ? 'Your workspace has full, unrestricted access to unlimited products, library items, CSV exports, and simulator.'
                  : 'Free tier is limited to 2 saved products and 5 materials. Upgrade to PRO for unlimited access.'}
              </p>
            </div>
          </div>

          {!isPro && (
            <div className="flex items-center gap-2">
              <a
                href={payhipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0072ce] hover:bg-[#005ea6] text-white text-xs font-bold shadow-sm hover:shadow transition active:scale-95"
              >
                <span className="text-xs leading-none" role="img" aria-label="star">⭐</span>
                <span>Unlock PRO</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
              {onOpenPaywall && (
                <button
                  type="button"
                  onClick={onOpenPaywall}
                  className="px-3.5 py-2.5 rounded-xl border border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition shadow-xs"
                >
                  View Benefits
                </button>
              )}
            </div>
          )}
        </div>

        {/* License Details & Activation Form */}
        <div className="mt-4 pt-1 space-y-4">
          {isPro ? (
            <div className="bg-[#f8fafc] border border-[#dbe1e6] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs text-[#5d6d7d] font-medium">Active License Key</div>
                <div className="font-mono text-sm font-bold text-[#2d3e51]">
                  {maskLicenseKey(licenseKey) || 'PRO-ACTIVATED'}
                </div>
                <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified for This Man Makes craft ecosystem</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDeactivate}
                className="self-start sm:self-center px-3.5 py-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-700 text-xs font-bold transition shadow-2xs"
              >
                Deactivate License
              </button>
            </div>
          ) : (
            <form onSubmit={handleKeySubmit} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#2d3e51] flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#2d3e51]" />
                  <span>Activate PRO License Key</span>
                </label>
                <button
                  type="button"
                  onClick={() => setKeyInput('PRO')}
                  className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 underline"
                >
                  Fill test key (PRO)
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Paste Payhip key (e.g. XXXX-XXXX or enter PRO)"
                  className="flex-1 text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 text-[#2d3e51] uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2d3e51] hover:bg-[#1e293b] active:scale-98 text-white text-xs font-bold transition shadow-xs whitespace-nowrap"
                >
                  Activate License
                </button>
              </div>

              <p className="text-[11px] text-[#5d6d7d]">
                Purchased via Payhip? Your key was sent in your purchase receipt email and displayed on the checkout download page.
              </p>
            </form>
          )}

          {keyMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                keyMessage.error
                  ? 'bg-[#fbe9e6] border border-[#edbeb8] text-[#902e29]'
                  : 'bg-[#e5f1e9] border border-[#dbe1e6] text-[#235c43]'
              }`}
            >
              {keyMessage.error ? (
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              )}
              <span>{keyMessage.text}</span>
            </div>
          )}

          {/* Payhip Checkout URL Setting (for custom links/testing) */}
          <div className="pt-3 border-t border-[#dbe1e6]">
            <form onSubmit={handleSaveUrl} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-[#5d6d7d] mb-1">
                  Payhip Product Purchase URL
                </label>
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://thismanmakes.co.uk/ or https://payhip.com/b/..."
                  className="w-full text-xs bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl border border-[#dbe1e6] bg-white hover:border-[#2d3e51] text-[#2d3e51] text-xs font-bold shadow-2xs transition"
              >
                Update Link
              </button>
            </form>
            {urlSaved && (
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                Payhip checkout URL updated.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="font-serif-brand text-lg font-bold text-[#2d3e51] mb-4 flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-[#2d3e51]" />
          <span>Workshop & Financial Defaults</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Default Hourly Maker Rate (£)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={form.rate}
              onChange={(e) => setForm({ ...form, rate: parseFloat(e.target.value) || 0 })}
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Target Profit Margin (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              value={form.margin}
              onChange={(e) => setForm({ ...form, margin: parseFloat(e.target.value) || 0 })}
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Default Material Waste Allowance (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              value={form.waste}
              onChange={(e) => setForm({ ...form, waste: parseFloat(e.target.value) || 0 })}
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>

          {/* Preferred Platform Preset Dropdown with responsive onChange */}
          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Preferred Marketplace / Platform Preset
            </label>
            <div className="relative">
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value as PlatformPreset })}
                className="w-full appearance-none text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 pr-9 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
              >
                {Object.entries(PLATFORM_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Default Actual Postage (£)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={form.postage}
              onChange={(e) => setForm({ ...form, postage: parseFloat(e.target.value) || 0 })}
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Default Packaging Cost / Item (£)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={form.packaging}
              onChange={(e) => setForm({ ...form, packaging: parseFloat(e.target.value) || 0 })}
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Default Simulation Quantity
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={form.qty}
              onChange={(e) => setForm({ ...form, qty: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Default Platform % Fee (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              value={form.feePct}
              onChange={(e) => setForm({ ...form, feePct: parseFloat(e.target.value) || 0 })}
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Default Fixed Fee / Order (£)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={form.feeFixed}
              onChange={(e) => setForm({ ...form, feeFixed: parseFloat(e.target.value) || 0 })}
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-[#2d3e51] cursor-pointer">
              <input
                type="checkbox"
                checked={form.vat}
                onChange={(e) => setForm({ ...form, vat: e.target.checked })}
                className="w-4 h-4 rounded text-[#2d3e51] focus:ring-[#2d3e51]"
              />
              <span>VAT Registered by default</span>
            </label>

            {form.vat && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-[#2d3e51]">Default VAT %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={form.vatRate}
                  onChange={(e) => setForm({ ...form, vatRate: parseFloat(e.target.value) || 20 })}
                  className="w-20 text-xs bg-white border border-[#dbe1e6] rounded-lg px-2 py-1 text-[#2d3e51]"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-[#dbe1e6]">
          <button
            type="button"
            onClick={handleResetClick}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              confirmReset
                ? 'border-red-500 bg-red-50 text-red-600 animate-pulse'
                : 'border-[#dbe1e6] bg-white hover:border-red-400 text-[#2d3e51]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{confirmReset ? 'Click again to confirm Reset' : 'Reset to Defaults'}</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#2d3e51] hover:bg-[#34495d] active:bg-[#1f2d3d] text-white text-xs font-bold transition shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Backup & Data Transfer */}
      <div className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="font-serif-brand text-lg font-bold text-[#2d3e51] mb-1">
          Backup & Data Transfer
        </h3>
        <p className="text-xs text-[#5d6d7d] mb-4">
          Export your complete products catalog and library as a single JSON file, or restore previously exported data.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onExportJSON}
            className="px-4 py-2.5 rounded-xl bg-[#2d3e51] hover:bg-[#34495d] active:bg-[#1f2d3d] text-white text-xs font-bold transition shadow-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Export Products (JSON)</span>
          </button>

          <label className="px-4 py-2.5 rounded-xl border border-[#dbe1e6] bg-white hover:border-[#2d3e51] text-xs font-bold text-[#2d3e51] transition shadow-xs flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-[#2d3e51]" />
            <span>Import Data (JSON)</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileInput}
              className="sr-only"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
