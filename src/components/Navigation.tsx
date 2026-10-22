import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calculator,
  Layers,
  ShoppingBag,
  TrendingUp,
  HelpCircle,
  Settings,
  ChevronDown,
  Menu,
  X,
  PlusCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export type NavSection =
  | 'dashboard'
  | 'calculator'
  | 'library'
  | 'products'
  | 'simulator'
  | 'help'
  | 'settings';

interface NavigationProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onNewCalculation: () => void;
  isPro?: boolean;
  onOpenPaywall?: () => void;
}

export const NAV_ITEMS: { id: NavSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calculator', label: 'Product Calculator', icon: Calculator },
  { id: 'library', label: 'Materials Library', icon: Layers },
  { id: 'products', label: 'My Products', icon: ShoppingBag },
  { id: 'simulator', label: 'Profit Simulator', icon: TrendingUp },
  { id: 'help', label: 'Help & Guides', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Navigation: React.FC<NavigationProps> = ({
  currentSection,
  onSelectSection,
  onNewCalculation,
  isPro = false,
  onOpenPaywall,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNavChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as NavSection;
    if (val) {
      onSelectSection(val);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleItemClick = (id: NavSection) => {
    onSelectSection(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* MOBILE HEADER & FIXED TOP BAR */}
      <div className="lg:hidden bg-[#2d3e51] text-white border-b border-[#3e546b] px-4 py-3 sticky top-0 z-40 shadow-md">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-[#a9b7b9] overflow-hidden bg-white shrink-0 shadow-xs">
              <img
                src="/tmm-logo.png"
                alt="This Man Makes Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <span className="font-header font-bold text-[18px] tracking-tight text-white block leading-tight">
                This Man Makes
              </span>
              <span className="font-header text-[12px] font-normal tracking-wide text-[#a9b7b9]">
                Craft Pricing Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {isPro ? (
              <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>PRO</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={onOpenPaywall}
                className="px-3.5 py-1.5 rounded-full bg-[#0072ce] hover:bg-[#005ea6] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
                title="Unlock PRO Unlimited Access"
              >
                <span className="text-xs leading-none" role="img" aria-label="star">⭐</span>
                <span>Unlock PRO</span>
              </button>
            )}
            <button
              type="button"
              onClick={onNewCalculation}
              className="px-2.5 py-1.5 rounded-lg bg-[#34495d] hover:bg-[#243342] text-white text-xs font-semibold flex items-center gap-1 shadow-xs border border-[#a9b7b9]/40 transition-colors"
              title="Start New Product Calculation"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#a9b7b9]" />
              <span>New</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-[#dbe1e6] hover:text-white hover:bg-[#3e546b] active:bg-[#34495d] transition-colors"
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE SELECT DROPDOWN */}
        <div className="relative">
          <label htmlFor="mobile-section-select" className="sr-only">
            Select Section
          </label>
          <div className="relative flex items-center">
            <select
              id="mobile-section-select"
              value={currentSection}
              onChange={handleMobileNavChange}
              className="w-full appearance-none bg-[#243342] text-white border border-[#3e546b] rounded-xl px-4 py-3 pr-10 text-base font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-[#a9b7b9] focus:border-transparent transition"
            >
              {NAV_ITEMS.map((item) => (
                <option key={item.id} value={item.id} className="bg-[#2d3e51] text-white py-1">
                  {item.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 text-[#a9b7b9]">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* MOBILE QUICK PILLS CAROUSEL */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 text-xs">
          {NAV_ITEMS.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full font-medium transition-all ${
                  isActive
                    ? 'bg-[#3e546b] text-white shadow-xs font-semibold ring-1 ring-[#a9b7b9]'
                    : 'bg-[#243342] text-[#dbe1e6] hover:text-white hover:bg-[#34495d]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* MOBILE SLIDE-DOWN DRAWER MENU */}
        {mobileMenuOpen && (
          <div className="mt-2 pt-2 border-t border-[#3e546b] space-y-1 pb-1 animate-in fade-in slide-in-from-top-2 duration-150">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition text-left ${
                    isActive
                      ? 'bg-[#3e546b] text-white font-semibold shadow-xs'
                      : 'text-[#dbe1e6] hover:bg-[#374c60] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#a9b7b9]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-none bg-[#2d3e51] text-[#f4f6f8] p-6 flex-col gap-2 min-h-screen sticky top-0 select-none shadow-xl border-r border-[#243342]">
        {/* Brand */}
        <div className="px-1 pt-1 pb-5 border-b border-[#3e546b]/70 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full border-1.5 border-[#a9b7b9] overflow-hidden bg-white shrink-0 shadow-sm">
            <img
              src="/tmm-logo.png"
              alt="This Man Makes Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <h1 className="font-header text-[18px] font-bold tracking-tight text-white leading-tight">
              This Man Makes
            </h1>
            <div className="font-header text-[12px] font-normal tracking-wide text-[#a9b7b9] mt-0.5">
              UK Craft Pricing
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 mt-4" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`flex items-center gap-3.5 w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#3e546b] text-white font-semibold shadow-md translate-x-1 ring-1 ring-white/10'
                    : 'text-[#dbe1e6] hover:bg-[#374c60] hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-[#a9b7b9]'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* PRO Membership Status Banner */}
        <div className="mt-3 px-1">
          {isPro ? (
            <div className="bg-[#243342] border border-emerald-500/40 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>PRO Active</span>
              </div>
              <span className="text-[10px] text-[#a9b7b9] uppercase tracking-wider font-semibold">Unlimited</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenPaywall}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#0072ce] hover:bg-[#005ea6] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition active:scale-95"
            >
              <span className="text-sm leading-none" role="img" aria-label="star">⭐</span>
              <span>Unlock PRO</span>
            </button>
          )}
        </div>

        {/* Quick Action Button */}
        <div className="mt-2 px-1">
          <button
            type="button"
            onClick={onNewCalculation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#34495d] hover:bg-[#243342] active:bg-[#1d2935] text-white font-semibold text-sm shadow-xs border border-[#a9b7b9]/30 transition"
          >
            <PlusCircle className="w-4 h-4 text-[#a9b7b9]" />
            <span>New Calculation</span>
          </button>
        </div>

        {/* Disclaimer Footer */}
        <div className="mt-auto pt-6 border-t border-[#3e546b]/60 text-xs text-[#a9b7b9] px-2 leading-relaxed">
          Estimates for craft pricing. Not guaranteed earnings or formal tax advice.
        </div>
      </aside>
    </>
  );
};
