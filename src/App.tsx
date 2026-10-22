import React, { useState, useEffect } from 'react';
import {
  Navigation,
  NavSection,
} from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { CalculatorView } from './components/CalculatorView';
import { LibraryView } from './components/LibraryView';
import { ProductsView } from './components/ProductsView';
import { SimulatorView } from './components/SimulatorView';
import { HelpView } from './components/HelpView';
import { SettingsView } from './components/SettingsView';
import {
  SavedProduct,
  LibraryMaterial,
  AppSettings,
  UnitType,
} from './types/calculator';
import { InteractiveTour } from './components/InteractiveTour';
import { PaywallModal } from './components/PaywallModal';
import {
  getStoredProducts,
  saveStoredProducts,
  getStoredLibrary,
  saveStoredLibrary,
  getStoredSettings,
  saveStoredSettings,
} from './utils/storage';
import {
  getStoredLicense,
  saveLicense,
  removeLicense,
  savePayhipUrl,
  checkUrlForLicense,
  DEFAULT_PAYHIP_URL,
  isTrialKey,
} from './utils/license';
import {
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [currentSection, setCurrentSection] = useState<NavSection>('calculator');
  const [products, setProducts] = useState<SavedProduct[]>([]);
  const [library, setLibrary] = useState<LibraryMaterial[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [editingProduct, setEditingProduct] = useState<SavedProduct | null>(null);
  const [tourOpen, setTourOpen] = useState<boolean>(false);

  // License & Paywall State
  const initialLicense = getStoredLicense();
  const [isPro, setIsPro] = useState<boolean>(initialLicense.isPro);
  const [licenseKey, setLicenseKey] = useState<string>(initialLicense.licenseKey);
  const [payhipUrl, setPayhipUrl] = useState<string>(initialLicense.payhipUrl || DEFAULT_PAYHIP_URL);
  const [paywallOpen, setPaywallOpen] = useState<boolean>(false);
  const [paywallTriggerFeature, setPaywallTriggerFeature] = useState<string | undefined>();

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // Initialize storage & check URL query params for ?license= or ?key=
  useEffect(() => {
    const loadedProds = getStoredProducts();
    const loadedLib = getStoredLibrary();
    const loadedSettings = getStoredSettings();
    setProducts(loadedProds);
    setLibrary(loadedLib);
    setSettings(loadedSettings);
    if (loadedProds.length > 0) {
      setEditingProduct(loadedProds[0]);
    }

    // Auto-activate license if present in URL
    const urlCheck = checkUrlForLicense();
    if (urlCheck.activated) {
      setIsPro(true);
      if (urlCheck.key) setLicenseKey(urlCheck.key);
      if (urlCheck.isTrial) {
        notify('⏳ 3-Day Tester Trial activated! All PRO features are unlocked for 72 hours.', 'success');
      } else {
        notify('🎉 Welcome to PRO! Your Payhip license key has been verified and activated.', 'success');
      }
    }
  }, []);

  const notify = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Product actions
  const handleSaveProduct = (productData: Omit<SavedProduct, '__backendId' | 'updated_at'>) => {
    const now = new Date().toISOString();
    let updatedProducts: SavedProduct[];

    if (editingProduct && editingProduct.__backendId) {
      // Update existing
      const updated: SavedProduct = {
        ...productData,
        __backendId: editingProduct.__backendId,
        updated_at: now,
      };
      updatedProducts = products.map((p) =>
        p.__backendId === editingProduct.__backendId ? updated : p
      );
      setEditingProduct(updated);
      notify(`“${updated.name}” updated successfully!`, 'success');
    } else {
      // Create new
      const newProduct: SavedProduct = {
        ...productData,
        __backendId: 'prod-' + Date.now(),
        updated_at: now,
      };
      updatedProducts = [newProduct, ...products];
      setEditingProduct(newProduct);
      notify(`“${newProduct.name}” saved to My Products!`, 'success');
    }

    setProducts(updatedProducts);
    saveStoredProducts(updatedProducts);
  };

  const handleOpenProduct = (product: SavedProduct) => {
    setEditingProduct(product);
    setCurrentSection('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    notify(`Loaded “${product.name}” into calculator.`, 'success');
  };

  const handleDuplicateProduct = (product: SavedProduct) => {
    const duplicated: SavedProduct = {
      ...product,
      name: `${product.name} (Copy)`,
      __backendId: 'prod-' + Date.now(),
      updated_at: new Date().toISOString(),
    };
    const updatedProducts = [duplicated, ...products];
    setProducts(updatedProducts);
    saveStoredProducts(updatedProducts);
    setEditingProduct(duplicated);
    setCurrentSection('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    notify(`Created copy of “${product.name}”. Original is unchanged.`, 'success');
  };

  const handleDeleteProduct = (backendId: string) => {
    const target = products.find((p) => p.__backendId === backendId);
    const updatedProducts = products.filter((p) => p.__backendId !== backendId);
    setProducts(updatedProducts);
    saveStoredProducts(updatedProducts);
    if (editingProduct?.__backendId === backendId) {
      setEditingProduct(updatedProducts[0] || null);
    }
    notify(`Product “${target?.name || ''}” deleted.`, 'warning');
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setCurrentSection('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    notify('Ready for a new craft calculation.', 'success');
  };

  // Library actions
  const handleAddLibraryMaterial = (item: Omit<LibraryMaterial, '__backendId' | 'updated_at'>) => {
    const newItem: LibraryMaterial = {
      ...item,
      __backendId: 'lib-' + Date.now(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newItem, ...library];
    setLibrary(updated);
    saveStoredLibrary(updated);
    notify(`Added “${newItem.name}” to Materials Library.`, 'success');
  };

  const handleUpdateLibraryMaterial = (
    backendId: string,
    item: Omit<LibraryMaterial, '__backendId' | 'updated_at'>
  ) => {
    const updated = library.map((m) =>
      m.__backendId === backendId
        ? { ...item, __backendId: backendId, updated_at: new Date().toISOString() }
        : m
    );
    setLibrary(updated);
    saveStoredLibrary(updated);
    notify(`Library material “${item.name}” updated.`, 'success');
  };

  const handleDeleteLibraryMaterial = (backendId: string) => {
    const target = library.find((m) => m.__backendId === backendId);
    const updated = library.filter((m) => m.__backendId !== backendId);
    setLibrary(updated);
    saveStoredLibrary(updated);
    notify(`“${target?.name || 'Material'}” removed from library. Existing products remain unchanged.`, 'warning');
  };

  const handleUseLibraryInProduct = (material: LibraryMaterial) => {
    // If not in calculator, switch to it with the material prepended
    if (editingProduct) {
      const newMat = {
        id: 'm-' + Date.now(),
        name: material.name,
        supplier: material.supplier,
        pack: material.pack,
        unit: material.unit,
        price: material.price,
        used: 1,
        usedUnit: material.unit,
        waste: settings.waste,
        link: material.__backendId,
      };
      setEditingProduct({
        ...editingProduct,
        materials: [...(editingProduct.materials || []), newMat],
      });
    }
    setCurrentSection('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    notify(`Added “${material.name}” to active calculation. Enter quantity used.`, 'success');
  };

  // Save from row into library
  const handleSaveToLibraryFromCalculator = (item: {
    name: string;
    supplier: string;
    pack: number;
    unit: UnitType;
    price: number;
  }) => {
    handleAddLibraryMaterial({
      name: item.name,
      supplier: item.supplier,
      pack: item.pack,
      unit: item.unit,
      price: item.price,
      notes: 'Added from calculator product recipe',
    });
  };

  // Settings actions
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const handleResetSettings = () => {
    const def = getStoredSettings();
    setSettings(def);
    notify('Settings reset to defaults.', 'warning');
  };

  // JSON Data transfer
  const handleExportJSON = () => {
    const payload = {
      format: 'this-man-makes-craft-calc-v2',
      exported_at: new Date().toISOString(),
      products,
      library,
      settings,
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `this-man-makes-craft-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify('All products and materials exported to JSON.', 'success');
  };

  const handleImportJSON = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        saveStoredProducts(data.products);
        if (data.products.length > 0) setEditingProduct(data.products[0]);
      }
      if (data.library && Array.isArray(data.library)) {
        setLibrary(data.library);
        saveStoredLibrary(data.library);
      }
      if (data.settings && typeof data.settings === 'object') {
        setSettings(data.settings);
        saveStoredSettings(data.settings);
      }
      notify(`Successfully imported data from ${file.name}!`, 'success');
    } catch (err) {
      console.error(err);
      notify('Invalid JSON file format. Could not import records.', 'error');
    }
  };

  const handleOpenPaywall = (featureReason?: string) => {
    setPaywallTriggerFeature(featureReason);
    setPaywallOpen(true);
  };

  const handleActivateLicense = (key: string): boolean => {
    const success = saveLicense(key);
    if (success) {
      setIsPro(true);
      setLicenseKey(key.trim().toUpperCase());
      const isTrial = isTrialKey(key);
      if (isTrial) {
        notify('⏳ 3-Day Tester Trial activated! All PRO features unlocked for 72 hours.', 'success');
      } else {
        notify('Payhip PRO license activated! All features unlocked.', 'success');
      }
      return true;
    }
    return false;
  };

  const handleDeactivateLicense = () => {
    removeLicense();
    setIsPro(false);
    setLicenseKey('');
    notify('License deactivated. Free tier limits are now active.', 'warning');
  };

  const handleUpdatePayhipUrl = (newUrl: string) => {
    savePayhipUrl(newUrl);
    setPayhipUrl(newUrl);
    notify('Payhip checkout URL saved.', 'success');
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#2d3e51] flex flex-col lg:flex-row antialiased selection:bg-[#2d3e51] selection:text-white">
      {/* SIDEBAR & MOBILE NAVIGATION */}
      <Navigation
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        onNewCalculation={handleNewProduct}
        isPro={isPro}
        onOpenPaywall={() => handleOpenPaywall()}
      />

      {/* MAIN WORKSPACE CONTENT */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Global Toast Notification */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 max-w-sm w-full px-4 animate-in fade-in slide-in-from-top-3 duration-200">
            <div
              className={`p-3.5 rounded-2xl shadow-lg border flex items-center justify-between gap-3 text-xs font-semibold ${
                toast.type === 'success'
                  ? 'bg-[#e5f1e9] border-[#dbe1e6] text-[#235c43]'
                  : toast.type === 'warning'
                  ? 'bg-[#fff1df] border-[#ead2a9] text-[#714318]'
                  : 'bg-[#fbe9e6] border-[#edbeb8] text-[#902e29]'
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2d3e51]" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="p-1 rounded-md opacity-70 hover:opacity-100 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {/* Header Title Section */}
          <header className="mb-6 pb-5 border-b border-[#dbe1e6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold tracking-widest uppercase text-[#2d3e51]">
                  MADE FOR UK CRAFTERS
                </span>
                <span className="text-zinc-400">•</span>
                <span className="text-[11px] text-[#5d6d7d] font-medium">
                  This Man Makes
                </span>
              </div>
              <h1 className="header-title text-[18px] font-bold text-[#1e293b] mt-1.5 tracking-tight">
                Craft Cost &amp; Profit Calculator
              </h1>
              <p className="header-subtitle text-[12px] font-normal text-[#5d6d7d] mt-1">
                Know your true material and labour costs. Price your handmade makes with confidence. Protect your profit margins.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {isPro ? (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>PRO Member</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenPaywall('Unlock unlimited products, materials, exports and simulator')}
                  className="px-4 py-2 rounded-full bg-[#0072ce] hover:bg-[#005ea6] text-white active:scale-95 text-xs sm:text-sm font-bold transition shadow-sm hover:shadow-md flex items-center gap-1.5 shrink-0"
                  title="Unlock PRO Unlimited Access"
                >
                  <span className="text-sm leading-none" role="img" aria-label="star">⭐</span>
                  <span>Unlock PRO</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setCurrentSection('calculator');
                  setTourOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl border border-[#a9b7b9]/50 bg-[#edf2f5] hover:bg-emerald-100 text-[#34495d] active:scale-98 text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                title="Start a 60-second interactive guided walkthrough"
              >
                <Sparkles className="w-4 h-4 text-[#2d3e51]" />
                <span>60s Interactive Tour</span>
              </button>
            </div>
          </header>

          {/* ACTIVE SECTION VIEWS */}
          {currentSection === 'dashboard' && (
            <DashboardView
              products={products}
              onOpenProduct={handleOpenProduct}
              onDuplicateProduct={handleDuplicateProduct}
              onDeleteProduct={handleDeleteProduct}
              onNewProduct={handleNewProduct}
            />
          )}

          {currentSection === 'calculator' && (
            <CalculatorView
              initialProduct={editingProduct}
              onSaveProduct={handleSaveProduct}
              onSaveToLibrary={handleSaveToLibraryFromCalculator}
              onOpenLibrary={() => setCurrentSection('library')}
              onNewProduct={handleNewProduct}
              onStartTour={() => setTourOpen(true)}
              defaultRate={settings.rate}
              defaultMargin={settings.margin}
              defaultWaste={settings.waste}
              defaultPlatform={settings.platform}
              defaultPostage={settings.postage}
              defaultPackaging={settings.packaging}
              isPro={isPro}
              onOpenPaywall={handleOpenPaywall}
              savedProductCount={products.length}
            />
          )}

          {currentSection === 'library' && (
            <LibraryView
              library={library}
              onAddMaterial={handleAddLibraryMaterial}
              onUpdateMaterial={handleUpdateLibraryMaterial}
              onDeleteMaterial={handleDeleteLibraryMaterial}
              onUseInProduct={handleUseLibraryInProduct}
              isPro={isPro}
              onOpenPaywall={handleOpenPaywall}
            />
          )}

          {currentSection === 'products' && (
            <ProductsView
              products={products}
              onOpenProduct={handleOpenProduct}
              onDuplicateProduct={handleDuplicateProduct}
              onDeleteProduct={handleDeleteProduct}
              onNewProduct={handleNewProduct}
              isPro={isPro}
              onOpenPaywall={handleOpenPaywall}
            />
          )}

          {currentSection === 'simulator' && (
            <SimulatorView
              currentProduct={editingProduct}
              isPro={isPro}
              onOpenPaywall={handleOpenPaywall}
            />
          )}

          {currentSection === 'help' && <HelpView />}

          {currentSection === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onResetSettings={handleResetSettings}
              onExportJSON={handleExportJSON}
              onImportJSON={handleImportJSON}
              isPro={isPro}
              licenseKey={licenseKey}
              payhipUrl={payhipUrl}
              onActivateLicense={handleActivateLicense}
              onDeactivateLicense={handleDeactivateLicense}
              onUpdatePayhipUrl={handleUpdatePayhipUrl}
              onOpenPaywall={() => handleOpenPaywall()}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="p-6 border-t border-[#dbe1e6] text-center text-xs text-[#5d6d7d] no-print">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-1">
            <span>Craft Cost &amp; Profit Calculator UK</span>
            <span>•</span>
            <span>This Man Makes</span>
            <span>•</span>
            <span>All estimates in GBP (£)</span>
          </div>
          <p className="text-[11px] opacity-75">
            Pricing calculator models material usage, labour, packaging, marketplace fees, and VAT estimates. Always verify current marketplace fees and official HMRC regulations.
          </p>
        </footer>
      </div>

      {/* 60-Second Interactive Tour Modal */}
      <InteractiveTour
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
        onComplete={() => {
          setTourOpen(false);
          notify("Tour completed! You're ready to price your makes with confidence.", 'success');
        }}
      />

      {/* Payhip PRO Paywall Modal */}
      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onActivate={handleActivateLicense}
        payhipUrl={payhipUrl}
        featureTriggered={paywallTriggerFeature}
      />
    </div>
  );
}
