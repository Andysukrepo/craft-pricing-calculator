import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  BookmarkPlus,
  ArrowRight,
  Printer,
  Download,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import {
  MaterialItem,
  PackagingItem,
  ProductDetails,
  LabourDetails,
  OverheadDetails,
  PostageDetails,
  SellingFeeDetails,
  VatDetails,
  PricingDetails,
  BulkDetails,
  SavedProduct,
  PlatformPreset,
  UnitType,
  PricingMode,
} from '../types/calculator';
import {
  UNITS,
  CATEGORIES,
  TASK_NAMES,
  PLATFORM_LABELS,
  FEE_PRESETS,
  FEE_KEYS,
  formatMoney,
  formatPct,
  calculateMaterialCost,
  calculatePackagingCost,
  performFullCalculation,
  calculatePriceResult,
  calculateTargetPrice,
} from '../utils/calculator';
import { FREE_LIMITS } from '../utils/license';

interface CalculatorViewProps {
  initialProduct?: SavedProduct | null;
  onSaveProduct: (productData: Omit<SavedProduct, '__backendId' | 'updated_at'>) => void;
  onSaveToLibrary: (item: { name: string; supplier: string; pack: number; unit: UnitType; price: number }) => void;
  onOpenLibrary: () => void;
  onNewProduct: () => void;
  onStartTour?: () => void;
  defaultRate: number;
  defaultMargin: number;
  defaultWaste: number;
  defaultPlatform: PlatformPreset;
  defaultPostage: number;
  defaultPackaging: number;
  isPro?: boolean;
  onOpenPaywall?: (feature?: string) => void;
  savedProductCount?: number;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  initialProduct,
  onSaveProduct,
  onSaveToLibrary,
  onOpenLibrary,
  onNewProduct,
  onStartTour,
  defaultRate,
  defaultMargin,
  defaultWaste,
  defaultPlatform,
  defaultPostage,
  defaultPackaging,
  isPro = false,
  onOpenPaywall,
  savedProductCount = 0,
}) => {
  // Product Details
  const [productDetails, setProductDetails] = useState<ProductDetails>({
    name: initialProduct?.name || '',
    category: initialProduct?.category || CATEGORIES[0],
    customCategory: initialProduct?.customCategory || '',
    sku: initialProduct?.sku || '',
    batch: initialProduct?.batch_quantity || 1,
    description: initialProduct?.description || '',
    notes: initialProduct?.notes || '',
  });

  // Materials
  const [materials, setMaterials] = useState<MaterialItem[]>(
    initialProduct?.materials && initialProduct.materials.length > 0
      ? initialProduct.materials
      : [
          {
            id: 'm-init',
            name: 'Primary Craft Material',
            supplier: 'UK Supplier Ltd',
            pack: 500,
            unit: 'grams',
            price: 8.5,
            used: 120,
            usedUnit: 'grams',
            waste: defaultWaste,
          },
        ]
  );

  // Packaging
  const [packaging, setPackaging] = useState<PackagingItem[]>(
    initialProduct?.packaging && initialProduct.packaging.length > 0
      ? initialProduct.packaging
      : [
          {
            id: 'p-init',
            name: 'Mailing Box & Tissue Wrap',
            pack: 25,
            price: 15.0,
            used: 1,
          },
        ]
  );

  // Labour
  const [labour, setLabour] = useState<LabourDetails>(
    initialProduct?.labour || {
      rate: defaultRate,
      useSingleTime: false,
      totalMinutes: 20,
      taskMinutes: [15, 2, 0, 2, 1, 0],
    }
  );

  // Overheads
  const [overheads, setOverheads] = useState<OverheadDetails>(
    initialProduct?.overheads || {
      fixedPerItem: 0.5,
      totalToAllocate: 50,
      allocationQuantity: 100,
      excludeOverhead: false,
    }
  );

  // Postage
  const [postage, setPostage] = useState<PostageDetails>(
    initialProduct?.postage || {
      actualPaid: defaultPostage,
      extraPackaging: 0.25,
      otherFulfilment: 0,
      chargedToCustomer: defaultPostage + 0.5,
      freeCustomerPostage: false,
    }
  );

  // Selling Fees
  const [fees, setFees] = useState<SellingFeeDetails>(
    initialProduct?.fees || {
      platform: defaultPlatform,
      itemsPerOrder: 1,
      feeEnabled: true,
      feesApplyToPostage: true,
      feeValues: [...(FEE_PRESETS[defaultPlatform] || FEE_PRESETS['custom-selling-platform'])],
    }
  );

  // VAT
  const [vat, setVat] = useState<VatDetails>(
    initialProduct?.vat || {
      vatRegistered: false,
      vatRate: 20,
      vatInclusive: true,
      recoverableInputVat: 0,
    }
  );

  // Pricing
  const [pricing, setPricing] = useState<PricingDetails>(
    initialProduct?.pricing || {
      mode: 'price',
      sellingPrice: initialProduct?.selling_price || 18.0,
      targetMargin: defaultMargin,
      targetMarkup: 50,
      discount: 0,
    }
  );

  // Bulk / Wholesale
  const [bulk, setBulk] = useState<BulkDetails>(
    initialProduct?.bulk || {
      orderQuantity: 10,
      discount: 20,
      wholesaleTargetMargin: 25,
      extraPackagingPerItem: 0.2,
      minutesSavedPerItem: 3,
    }
  );

  // Sync state if initialProduct prop updates
  useEffect(() => {
    if (initialProduct) {
      setProductDetails({
        name: initialProduct.name,
        category: initialProduct.category,
        customCategory: initialProduct.customCategory || '',
        sku: initialProduct.sku || '',
        batch: initialProduct.batch_quantity || 1,
        description: initialProduct.description || '',
        notes: initialProduct.notes || '',
      });
      setMaterials(initialProduct.materials || []);
      setPackaging(initialProduct.packaging || []);
      setLabour(initialProduct.labour);
      setOverheads(initialProduct.overheads);
      setPostage(initialProduct.postage);
      setFees(initialProduct.fees);
      setVat(initialProduct.vat);
      setPricing(initialProduct.pricing);
      setBulk(initialProduct.bulk);
    }
  }, [initialProduct]);

  // Perform live calculations
  const calc = performFullCalculation(
    productDetails.batch,
    materials,
    packaging,
    labour,
    overheads,
    postage,
    fees,
    vat,
    pricing
  );

  // Handlers for Material Rows
  const handleAddMaterial = () => {
    const newId = 'm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setMaterials((prev) => [
      ...prev,
      {
        id: newId,
        name: '',
        supplier: '',
        pack: 1,
        unit: 'each',
        price: 0,
        used: 1,
        usedUnit: 'each',
        waste: defaultWaste,
      },
    ]);
  };

  const handleDuplicateMaterial = (item: MaterialItem) => {
    const newId = 'm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setMaterials((prev) => [...prev, { ...item, id: newId, name: `${item.name} (Copy)` }]);
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpdateMaterial = <K extends keyof MaterialItem>(id: string, key: K, val: MaterialItem[K]) => {
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        return { ...m, [key]: val };
      })
    );
  };

  // Handlers for Packaging Rows
  const handleAddPackaging = () => {
    const newId = 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setPackaging((prev) => [
      ...prev,
      {
        id: newId,
        name: '',
        pack: 1,
        price: 0,
        used: 1,
      },
    ]);
  };

  const handleDuplicatePackaging = (item: PackagingItem) => {
    const newId = 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setPackaging((prev) => [...prev, { ...item, id: newId, name: `${item.name} (Copy)` }]);
  };

  const handleRemovePackaging = (id: string) => {
    setPackaging((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdatePackaging = <K extends keyof PackagingItem>(id: string, key: K, val: PackagingItem[K]) => {
    setPackaging((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return { ...p, [key]: val };
      })
    );
  };

  // Platform Presets (Guaranteed change handler for mobile devices)
  const handlePlatformChange = (preset: PlatformPreset) => {
    if (preset === 'custom-selling-platform') {
      setFees((prev) => ({ ...prev, platform: preset }));
    } else {
      const presetValues = FEE_PRESETS[preset] ? [...FEE_PRESETS[preset]] : [0, 0, 0, 0, 0, 0, 0];
      setFees((prev) => ({
        ...prev,
        platform: preset,
        feeValues: presetValues,
      }));
    }
  };

  const handleFeeValueChange = (index: number, val: number) => {
    setFees((prev) => {
      const updated = [...prev.feeValues];
      updated[index] = Math.max(0, val);
      return { ...prev, feeValues: updated };
    });
  };

  // Save Product
  const handleSave = () => {
    if (!productDetails.name.trim()) {
      alert('Please enter a product name before saving.');
      return;
    }

    const isNewProduct = !initialProduct || !initialProduct.__backendId;
    if (isNewProduct && !isPro && savedProductCount >= FREE_LIMITS.maxProducts) {
      onOpenPaywall?.(
        `Free plan is limited to ${FREE_LIMITS.maxProducts} saved products. Upgrade to PRO to save unlimited craft recipes and product pricing.`
      );
      return;
    }

    onSaveProduct({
      name: productDetails.name.trim(),
      category: productDetails.customCategory ? productDetails.customCategory.trim() : productDetails.category,
      customCategory: productDetails.customCategory,
      sku: productDetails.sku,
      batch_quantity: productDetails.batch,
      description: productDetails.description,
      notes: productDetails.notes,
      materials,
      packaging,
      labour,
      overheads,
      postage,
      fees,
      vat,
      pricing: {
        ...pricing,
        sellingPrice: calc.sellingPrice,
      },
      bulk,
      production_cost: calc.productionCost,
      selling_price: calc.sellingPrice,
      total_fees: calc.fees,
      profit_per_item: calc.profit,
      profit_margin: calc.margin || 0,
      markup: calc.markup || 0,
    });
  };

  // CSV Export for breakdown
  const handleExportCSV = () => {
    if (!isPro) {
      onOpenPaywall?.('CSV cost breakdown export is a PRO feature. Upgrade to export your data anytime.');
      return;
    }

    const rows = [
      ['Product Name', productDetails.name || 'Untitled'],
      ['Calculation Date', new Date().toISOString()],
      ['Batch Quantity', String(productDetails.batch)],
      ['---', '---'],
      ['Item Selling Price (£)', calc.sellingPrice.toFixed(2)],
      ['Customer Postage Income (£)', calc.customerPostageIncome.toFixed(2)],
      ['Net Sales Revenue (£)', calc.netSalesRevenue.toFixed(2)],
      ['---', '---'],
      ['Materials Cost / Item (£)', calc.materialsCost.toFixed(2)],
      ['Labour Cost / Item (£)', calc.labourCost.toFixed(2)],
      ['Packaging Cost / Item (£)', calc.packagingCost.toFixed(2)],
      ['Overhead Cost / Item (£)', calc.overheadCost.toFixed(2)],
      ['Production Cost / Item (£)', calc.productionCost.toFixed(2)],
      ['Production Cost / Batch (£)', calc.batchProductionCost.toFixed(2)],
      ['---', '---'],
      ['Seller Actual Postage (£)', calc.sellerPostage.toFixed(2)],
      ['Extra Postal Packaging (£)', calc.extraPostalPackaging.toFixed(2)],
      ['Fulfilment Cost (£)', calc.fulfilmentCost.toFixed(2)],
      ['Selling Fees (£)', calc.fees.toFixed(2)],
      ['Recoverable Input VAT (£)', calc.recoverableInputVat.toFixed(2)],
      ['Total Cost Per Sale (£)', calc.totalCostPerSale.toFixed(2)],
      ['---', '---'],
      ['Estimated Profit Per Item (£)', calc.profit.toFixed(2)],
      ['Profit Margin (%)', calc.margin ? (calc.margin * 100).toFixed(1) + '%' : '0%'],
      ['Markup on Cost (%)', calc.markup ? (calc.markup * 100).toFixed(1) + '%' : '0%'],
      ['Recommended Target Price (£)', (Math.ceil(calc.recommendedPrice * 100) / 100).toFixed(2)],
      ['Break-even Price (£)', (Math.ceil(calc.breakevenAfterFees * 100) / 100).toFixed(2)],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${productDetails.name || 'product'}-cost-breakdown.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk calculation
  const bulkSavingMins = Math.min(Number(bulk.minutesSavedPerItem || 0), labour.totalMinutes || 20);
  const bulkLaborSaving = (labour.rate * bulkSavingMins) / 60;
  const bulkProductionItem = Math.max(0, calc.productionCost + Number(bulk.extraPackagingPerItem || 0) - bulkLaborSaving);
  const bulkPrice = calc.sellingPrice * (1 - Number(bulk.discount || 0) / 100);
  const bulkResult = calculatePriceResult(bulkPrice, {
    productionCost: bulkProductionItem,
    actualPostage: Number(postage.actualPaid || 0),
    extraPostalPackaging: Number(postage.extraPackaging || 0),
    fulfilment: Number(postage.otherFulfilment || 0),
    recoverableInputVat: Number(vat.recoverableInputVat || 0),
    chargedPostage: Number(postage.chargedToCustomer || 0),
    freePostage: Boolean(postage.freeCustomerPostage),
    vatRegistered: Boolean(vat.vatRegistered),
    vatRate: Number(vat.vatRate || 20) / 100,
    vatInclusive: Boolean(vat.vatInclusive),
    feeEnabled: Boolean(fees.feeEnabled),
    feePostage: Boolean(fees.feesApplyToPostage),
    feeValues: fees.feeValues,
    orderCount: Math.max(1, Number(fees.itemsPerOrder || 1)),
  });

  const bulkMinPrice = calculateTargetPrice(Number(bulk.wholesaleTargetMargin || 25) / 100, {
    productionCost: bulkProductionItem,
    actualPostage: Number(postage.actualPaid || 0),
    extraPostalPackaging: Number(postage.extraPackaging || 0),
    fulfilment: Number(postage.otherFulfilment || 0),
    recoverableInputVat: Number(vat.recoverableInputVat || 0),
    chargedPostage: Number(postage.chargedToCustomer || 0),
    freePostage: Boolean(postage.freeCustomerPostage),
    vatRegistered: Boolean(vat.vatRegistered),
    vatRate: Number(vat.vatRate || 20) / 100,
    vatInclusive: Boolean(vat.vatInclusive),
    feeEnabled: Boolean(fees.feeEnabled),
    feePostage: Boolean(fees.feesApplyToPostage),
    feeValues: fees.feeValues,
    orderCount: Math.max(1, Number(fees.itemsPerOrder || 1)),
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#dbe1e6]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="header-title text-[18px] font-bold text-[#1e293b]">
              {productDetails.name ? productDetails.name : 'Product Cost & Profit Calculator'}
            </h2>
            {initialProduct && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                Editing
              </span>
            )}
          </div>
          <p className="header-subtitle text-[12px] font-normal text-[#5d6d7d] mt-1">
            All amounts in GBP (£). Live calculation updates instantly as you adjust values.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onStartTour && (
            <button
              type="button"
              onClick={onStartTour}
              className="px-3.5 py-2.5 rounded-xl border-2 border-[#a9b7b9]/50 bg-[#edf2f5] hover:bg-emerald-100/70 text-[#34495d] active:scale-98 text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              title="Start guided interactive tour"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Quick Tour</span>
            </button>
          )}
          <button
            type="button"
            onClick={onNewProduct}
            className="px-3.5 py-2.5 rounded-xl border border-[#dbe1e6] bg-[#ffffff] hover:border-[#2d3e51] hover:text-[#2d3e51] active:scale-98 text-xs font-bold transition text-[#2d3e51] shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Calculation</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#2d3e51] hover:bg-[#34495d] active:bg-[#1f2d3d] active:scale-98 text-xs font-bold text-white transition shadow-sm flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Product</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Product Details */}
      <section id="tour-product-details" className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="font-serif-brand text-lg font-bold text-[#2d3e51] mb-4 flex items-center gap-2">
          <span>1. Product Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={productDetails.name}
              onChange={(e) => setProductDetails({ ...productDetails, name: e.target.value })}
              placeholder="e.g. Hand-poured Botanical Soy Candle"
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>

          {/* Category Dropdown - Explicit mobile test */}
          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Craft Category
            </label>
            <div className="relative">
              <select
                value={productDetails.category}
                onChange={(e) => setProductDetails({ ...productDetails, category: e.target.value })}
                className="w-full appearance-none text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 pr-9 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Custom Category (Optional)
            </label>
            <input
              type="text"
              value={productDetails.customCategory}
              onChange={(e) => setProductDetails({ ...productDetails, customCategory: e.target.value })}
              placeholder="e.g. Needle Felting"
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              SKU / Product Code
            </label>
            <input
              type="text"
              value={productDetails.sku}
              onChange={(e) => setProductDetails({ ...productDetails, sku: e.target.value })}
              placeholder="e.g. CND-LAV-01"
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Batch Quantity Made
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={productDetails.batch}
              onChange={(e) => setProductDetails({ ...productDetails, batch: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Product Description / Specifications
            </label>
            <input
              type="text"
              value={productDetails.description}
              onChange={(e) => setProductDetails({ ...productDetails, description: e.target.value })}
              placeholder="Key materials, dimensions, scent notes or finish"
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: Raw Materials */}
      <section id="tour-materials" className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="font-serif-brand text-lg font-bold text-[#2d3e51]">
              2. Raw Materials
            </h3>
            <p className="text-xs text-[#5d6d7d] mt-0.5">
              Enter your pack purchases and the exact portion used per finished item. Waste percentage covers offcuts, spills and trimming.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenLibrary}
              className="px-3 py-2 rounded-xl border border-[#dbe1e6] bg-white hover:border-[#2d3e51] hover:text-[#2d3e51] text-xs font-bold text-[#2d3e51] transition shadow-xs flex items-center gap-1.5"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-[#2d3e51]" />
              <span>Browse Library</span>
            </button>
            <button
              type="button"
              onClick={handleAddMaterial}
              className="px-3.5 py-2 rounded-xl bg-[#2d3e51] hover:bg-[#34495d] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Material</span>
            </button>
          </div>
        </div>

        {/* Dynamic Material Rows */}
        <div className="space-y-3 mt-4">
          {materials.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-[#dbe1e6] rounded-xl">
              <p className="text-sm text-[#5d6d7d]">No materials added yet.</p>
              <button
                type="button"
                onClick={handleAddMaterial}
                className="mt-2 text-xs font-bold text-[#2d3e51] hover:underline"
              >
                + Add your first material
              </button>
            </div>
          ) : (
            materials.map((m, idx) => {
              const costCalc = calculateMaterialCost(m);
              return (
                <div
                  key={m.id}
                  className="bg-[#f8fafc] border border-[#dbe1e6] rounded-xl p-4 transition-shadow hover:shadow-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    {/* Material Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[#2d3e51] mb-1">
                        Material Name #{idx + 1}
                      </label>
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => handleUpdateMaterial(m.id, 'name', e.target.value)}
                        placeholder="e.g. Soy Wax Flakes"
                        className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-lg px-2.5 py-2 text-[#2d3e51] focus:outline-none focus:ring-1 focus:ring-[#2d3e51]"
                      />
                    </div>

                    {/* Supplier */}
                    <div className="sm:col-span-1 md:col-span-2">
                      <label className="block text-[11px] font-bold text-[#2d3e51] mb-1">
                        Supplier / Source
                      </label>
                      <input
                        type="text"
                        value={m.supplier}
                        onChange={(e) => handleUpdateMaterial(m.id, 'supplier', e.target.value)}
                        placeholder="e.g. Candle Shack UK"
                        className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-lg px-2.5 py-2 text-[#2d3e51] focus:outline-none focus:ring-1 focus:ring-[#2d3e51]"
                      />
                    </div>

                    {/* Pack Quantity */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#2d3e51] mb-1">
                        Pack Qty
                      </label>
                      <input
                        type="number"
                        min="0.001"
                        step="any"
                        value={m.pack}
                        onChange={(e) => handleUpdateMaterial(m.id, 'pack', parseFloat(e.target.value) || 0)}
                        className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-lg px-2.5 py-2 text-[#2d3e51] focus:outline-none focus:ring-1 focus:ring-[#2d3e51]"
                      />
                    </div>

                    {/* Pack Unit Dropdown (Crucial mobile fix: onChange directly triggers state) */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#2d3e51] mb-1">
                        Pack Unit
                      </label>
                      <div className="relative">
                        <select
                          value={m.unit}
                          onChange={(e) => handleUpdateMaterial(m.id, 'unit', e.target.value as UnitType)}
                          className="w-full appearance-none text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-lg px-2.5 py-2 pr-7 text-[#2d3e51] focus:outline-none focus:ring-1 focus:ring-[#2d3e51]"
                        >
                          {UNITS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                      </div>
                    </div>

                    {/* Pack Price */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#2d3e51] mb-1">
                        Pack Price (£)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={m.price}
                        onChange={(e) => handleUpdateMaterial(m.id, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-lg px-2.5 py-2 text-[#2d3e51] focus:outline-none focus:ring-1 focus:ring-[#2d3e51]"
                      />
                    </div>

                    {/* Quantity Used Per Item */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#2d3e51] mb-1">
                        Qty Used / Item
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={m.used}
                        onChange={(e) => handleUpdateMaterial(m.id, 'used', parseFloat(e.target.value) || 0)}
                        className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-lg px-2.5 py-2 text-[#2d3e51] focus:outline-none focus:ring-1 focus:ring-[#2d3e51]"
                      />
                    </div>

                    {/* Used Unit Dropdown */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#2d3e51] mb-1">
                        Used Unit
                      </label>
                      <div className="relative">
                        <select
                          value={m.usedUnit}
                          onChange={(e) => handleUpdateMaterial(m.id, 'usedUnit', e.target.value as UnitType)}
                          className="w-full appearance-none text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-lg px-2.5 py-2 pr-7 text-[#2d3e51] focus:outline-none focus:ring-1 focus:ring-[#2d3e51]"
                        >
                          {UNITS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                      </div>
                    </div>

                    {/* Waste % */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#2d3e51] mb-1">
                        Waste (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        value={m.waste}
                        onChange={(e) => handleUpdateMaterial(m.id, 'waste', parseFloat(e.target.value) || 0)}
                        className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-lg px-2.5 py-2 text-[#2d3e51] focus:outline-none focus:ring-1 focus:ring-[#2d3e51]"
                      />
                    </div>
                  </div>

                  {/* Sub-row actions and computed cost */}
                  <div className="mt-3 pt-2.5 border-t border-[#e2e1d7] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#2d3e51]">
                        Cost / Item:{' '}
                        <span className="text-[#2d3e51] font-bold text-sm">
                          {formatMoney(costCalc.itemCost)}
                        </span>
                      </span>
                      <span className="text-[#5d6d7d]">
                        (Pack unit cost: {formatMoney(costCalc.unitCost)} / {m.unit})
                      </span>
                      {costCalc.error && (
                        <span className="text-red-600 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {costCalc.error}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          onSaveToLibrary({
                            name: m.name.trim() || 'Untitled Material',
                            supplier: m.supplier,
                            pack: m.pack,
                            unit: m.unit,
                            price: m.price,
                          })
                        }
                        className="px-2.5 py-1 rounded-lg border border-[#dbe1e6] bg-white hover:bg-[#edf2f5] hover:text-[#2d3e51] active:bg-emerald-100 text-[11px] font-semibold text-[#2d3e51] transition"
                        title="Save this material to your reusable library"
                      >
                        Save to Library
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateMaterial(m)}
                        className="p-1.5 rounded-lg border border-[#dbe1e6] bg-white hover:border-[#2d3e51] active:bg-zinc-100 text-[#2d3e51] transition"
                        title="Duplicate row"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(m.id)}
                        className="p-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 transition"
                        title="Remove row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Materials Subtotal */}
        <div className="mt-4 p-3 bg-[#edf2f5] rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#2d3e51]">
          <span>
            Total Materials Cost: <strong>{formatMoney(calc.materialsCost)}</strong> per item
          </span>
          <span>
            Batch ({productDetails.batch} items):{' '}
            <strong>{formatMoney(calc.materialsCost * productDetails.batch)}</strong>
          </span>
        </div>
      </section>

      {/* SECTION 3: Labour & Packaging */}
      <div id="tour-labour" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Labour */}
        <section className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-serif-brand text-lg font-bold text-[#2d3e51] mb-1">
              3. Maker Labour
            </h3>
            <p className="text-xs text-[#5d6d7d] mb-4">
              Your making and preparation time is a real production cost.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
                  Hourly Rate (£/hour)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={labour.rate}
                  onChange={(e) => setLabour({ ...labour, rate: parseFloat(e.target.value) || 0 })}
                  className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 text-xs font-bold text-[#2d3e51] cursor-pointer py-2">
                  <input
                    type="checkbox"
                    checked={labour.useSingleTime}
                    onChange={(e) => setLabour({ ...labour, useSingleTime: e.target.checked })}
                    className="w-4 h-4 rounded text-[#2d3e51] focus:ring-[#2d3e51]"
                  />
                  <span>Use one single total time</span>
                </label>
              </div>
            </div>

            {labour.useSingleTime ? (
              <div className="mb-4">
                <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
                  Total Minutes Per Finished Item
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={labour.totalMinutes}
                  onChange={(e) => setLabour({ ...labour, totalMinutes: parseFloat(e.target.value) || 0 })}
                  className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                {TASK_NAMES.map((task, i) => (
                  <div key={task}>
                    <label className="block text-[11px] font-bold text-[#2d3e51] mb-1 truncate" title={task}>
                      {task} (mins)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={labour.taskMinutes[i] ?? 0}
                      onChange={(e) => {
                        const next = [...labour.taskMinutes];
                        next[i] = parseFloat(e.target.value) || 0;
                        setLabour({ ...labour, taskMinutes: next });
                      }}
                      className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-lg px-2.5 py-2 text-[#2d3e51] focus:outline-none focus:ring-1 focus:ring-[#2d3e51]"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-[#edf2f5] rounded-xl flex items-center justify-between text-xs font-semibold text-[#2d3e51]">
            <span>
              Total Labour Time:{' '}
              <strong>
                {labour.useSingleTime
                  ? labour.totalMinutes
                  : labour.taskMinutes.reduce((a, b) => a + (Number(b) || 0), 0)}{' '}
                mins
              </strong>
            </span>
            <span>
              Labour Cost: <strong>{formatMoney(calc.labourCost)}</strong>
            </span>
          </div>
        </section>

        {/* Packaging */}
        <section className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-serif-brand text-lg font-bold text-[#2d3e51]">
                4. Packaging & Inserts
              </h3>
              <button
                type="button"
                onClick={handleAddPackaging}
                className="px-3 py-1.5 rounded-xl bg-[#2d3e51] hover:bg-[#34495d] text-white text-xs font-bold transition shadow-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
            <p className="text-xs text-[#5d6d7d] mb-3">
              Boxes, gift tissue, bubble wrap, stickers, care cards, tags and ribbon.
            </p>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {packaging.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-[#dbe1e6] rounded-xl text-xs text-[#5d6d7d]">
                  No packaging items. Click &apos;Add&apos; to specify presentation materials.
                </div>
              ) : (
                packaging.map((p, pIdx) => {
                  const pCost = calculatePackagingCost(p);
                  return (
                    <div
                      key={p.id}
                      className="bg-[#f8fafc] border border-[#dbe1e6] rounded-xl p-3 flex flex-col gap-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-[#2d3e51] mb-0.5">
                            Packaging Item #{pIdx + 1}
                          </label>
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => handleUpdatePackaging(p.id, 'name', e.target.value)}
                            placeholder="e.g. Rigid Box or Tissue"
                            className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-lg px-2.5 py-1.5 text-[#2d3e51]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#2d3e51] mb-0.5">
                            Pack Qty
                          </label>
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={p.pack}
                            onChange={(e) => handleUpdatePackaging(p.id, 'pack', parseFloat(e.target.value) || 1)}
                            className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-lg px-2 py-1.5 text-[#2d3e51]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#2d3e51] mb-0.5">
                            Pack Price (£)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={p.price}
                            onChange={(e) => handleUpdatePackaging(p.id, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-lg px-2 py-1.5 text-[#2d3e51]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#e2e8f0]">
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-semibold text-[#2d3e51]">
                            Qty Used:
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={p.used}
                            onChange={(e) => handleUpdatePackaging(p.id, 'used', parseFloat(e.target.value) || 0)}
                            className="w-16 text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-lg px-2 py-1 text-[#2d3e51]"
                          />
                          <span className="font-bold text-[#2d3e51]">
                            {formatMoney(pCost.itemCost)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDuplicatePackaging(p)}
                            className="p-1 rounded border border-[#dbe1e6] bg-white hover:border-[#2d3e51] text-[#2d3e51]"
                            title="Duplicate"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePackaging(p.id)}
                            className="p-1 rounded border border-red-200 bg-white hover:bg-red-50 text-red-600"
                            title="Remove"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-3 bg-[#edf2f5] rounded-xl flex items-center justify-between text-xs font-semibold text-[#2d3e51] mt-3">
            <span>Total Packaging Items: {packaging.length}</span>
            <span>
              Packaging Cost: <strong>{formatMoney(calc.packagingCost)}</strong>
            </span>
          </div>
        </section>
      </div>

      {/* SECTION 4: Overheads & Postage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overheads */}
        <section className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-5 sm:p-6 shadow-sm">
          <h3 className="font-serif-brand text-lg font-bold text-[#2d3e51] mb-1">
            5. Allocated Overheads
          </h3>
          <p className="text-xs text-[#5d6d7d] mb-4">
            Workshop electricity, kiln/machine depreciation, rent, software subscriptions and studio tools.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
                Fixed Cost / Item (£)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={overheads.fixedPerItem}
                onChange={(e) => setOverheads({ ...overheads, fixedPerItem: parseFloat(e.target.value) || 0 })}
                className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
                Total Overhead to Share (£)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={overheads.totalToAllocate}
                onChange={(e) => setOverheads({ ...overheads, totalToAllocate: parseFloat(e.target.value) || 0 })}
                className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
                Shared Over (Items)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={overheads.allocationQuantity}
                onChange={(e) => setOverheads({ ...overheads, allocationQuantity: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold text-[#2d3e51] cursor-pointer">
              <input
                type="checkbox"
                checked={overheads.excludeOverhead}
                onChange={(e) => setOverheads({ ...overheads, excludeOverhead: e.target.checked })}
                className="w-4 h-4 rounded text-[#2d3e51] focus:ring-[#2d3e51]"
              />
              <span>Exclude overheads from calculation</span>
            </label>

            <span className="text-xs font-bold text-[#2d3e51]">
              Overhead / Item: {formatMoney(calc.overheadCost)}
            </span>
          </div>
        </section>

        {/* Postage & Fulfilment */}
        <section className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-5 sm:p-6 shadow-sm">
          <h3 className="font-serif-brand text-lg font-bold text-[#2d3e51] mb-1">
            6. Postage & Fulfilment
          </h3>
          <p className="text-xs text-[#5d6d7d] mb-4">
            Actual postal carrier fees (e.g. Royal Mail Tracked 48) vs customer charged postage.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
                Actual Postage Paid / Item (£)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={postage.actualPaid}
                onChange={(e) => setPostage({ ...postage, actualPaid: parseFloat(e.target.value) || 0 })}
                className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
                Postage Charged to Customer (£)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                disabled={postage.freeCustomerPostage}
                value={postage.chargedToCustomer}
                onChange={(e) => setPostage({ ...postage, chargedToCustomer: parseFloat(e.target.value) || 0 })}
                className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51] disabled:bg-zinc-100 disabled:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
                Extra Postal Packaging (£)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={postage.extraPackaging}
                onChange={(e) => setPostage({ ...postage, extraPackaging: parseFloat(e.target.value) || 0 })}
                className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 text-xs font-bold text-[#2d3e51] cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={postage.freeCustomerPostage}
                  onChange={(e) => setPostage({ ...postage, freeCustomerPostage: e.target.checked })}
                  className="w-4 h-4 rounded text-[#2d3e51] focus:ring-[#2d3e51]"
                />
                <span>Free customer postage</span>
              </label>
            </div>
          </div>
        </section>
      </div>

      {/* SECTION 5: Selling Platform & Marketplace Fees (Enhanced with robust mobile dropdown selection) */}
      <section id="tour-fees" className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h3 className="font-serif-brand text-lg font-bold text-[#2d3e51] flex items-center gap-2">
            <span>7. Selling Fees & Marketplace Preset</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#edf2f5] text-emerald-800 font-bold border border-emerald-200">
              User-Configurable Estimates
            </span>
          </h3>
        </div>
        <p className="text-xs text-[#5d6d7d] mb-4">
          Select a preset to populate standard fees, or customize rates according to your specific shop agreement.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Selling Platform Dropdown (Tested & guaranteed on mobile touch) */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Selling Platform / Fee Preset
            </label>
            <div className="relative">
              <select
                value={fees.platform}
                onChange={(e) => handlePlatformChange(e.target.value as PlatformPreset)}
                className="w-full appearance-none text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-4 py-3 pr-10 text-[#2d3e51] font-medium focus:outline-none focus:ring-2 focus:ring-[#2d3e51] transition shadow-xs"
              >
                {Object.entries(PLATFORM_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Items Per Order
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={fees.itemsPerOrder}
              onChange={(e) => setFees({ ...fees, itemsPerOrder: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-3 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
            <span className="block text-[10px] text-[#5d6d7d] mt-1">
              Order-level fee split across {fees.itemsPerOrder} item(s)
            </span>
          </div>

          <div className="flex flex-col justify-center space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-[#2d3e51] cursor-pointer">
              <input
                type="checkbox"
                checked={fees.feeEnabled}
                onChange={(e) => setFees({ ...fees, feeEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-[#2d3e51] focus:ring-[#2d3e51]"
              />
              <span>Include Selling Fees</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-[#2d3e51] cursor-pointer">
              <input
                type="checkbox"
                checked={fees.feesApplyToPostage}
                onChange={(e) => setFees({ ...fees, feesApplyToPostage: e.target.checked })}
                className="w-4 h-4 rounded text-[#2d3e51] focus:ring-[#2d3e51]"
              />
              <span>Percentage applies to Price + Postage</span>
            </label>
          </div>
        </div>

        {/* Detailed Editable Fee Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 pt-3 border-t border-[#dbe1e6]">
          {FEE_KEYS.map(([key, label], idx) => (
            <div key={key}>
              <label className="block text-[11px] font-bold text-[#2d3e51] mb-1 truncate" title={label}>
                {label}
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={fees.feeValues[idx] ?? 0}
                onChange={(e) => handleFeeValueChange(idx, parseFloat(e.target.value) || 0)}
                className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-lg px-2.5 py-2 text-[#2d3e51] focus:outline-none focus:ring-1 focus:ring-[#2d3e51]"
              />
            </div>
          ))}
        </div>

        {/* Fee Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-4">
          <div className="bg-[#f8fafc] border border-[#dbe1e6] rounded-xl p-2.5 text-center">
            <span className="block text-[11px] text-[#5d6d7d]">Percentage Fee</span>
            <strong className="block text-sm font-bold text-[#2d3e51] mt-0.5">
              {formatMoney(calc.feeBreakdown.percentage)}
            </strong>
          </div>
          <div className="bg-[#f8fafc] border border-[#dbe1e6] rounded-xl p-2.5 text-center">
            <span className="block text-[11px] text-[#5d6d7d]">Order Fixed Fee</span>
            <strong className="block text-sm font-bold text-[#2d3e51] mt-0.5">
              {formatMoney(calc.feeBreakdown.orderFixed)}
            </strong>
          </div>
          <div className="bg-[#f8fafc] border border-[#dbe1e6] rounded-xl p-2.5 text-center">
            <span className="block text-[11px] text-[#5d6d7d]">Item Fixed Fee</span>
            <strong className="block text-sm font-bold text-[#2d3e51] mt-0.5">
              {formatMoney(calc.feeBreakdown.itemFixed)}
            </strong>
          </div>
          <div className="bg-[#f8fafc] border border-[#dbe1e6] rounded-xl p-2.5 text-center">
            <span className="block text-[11px] text-[#5d6d7d]">Listing / Transaction</span>
            <strong className="block text-sm font-bold text-[#2d3e51] mt-0.5">
              {formatMoney(calc.feeBreakdown.listing)}
            </strong>
          </div>
          <div className="bg-[#f8fafc] border border-[#dbe1e6] rounded-xl p-2.5 text-center">
            <span className="block text-[11px] text-[#5d6d7d]">Advertising</span>
            <strong className="block text-sm font-bold text-[#2d3e51] mt-0.5">
              {formatMoney(calc.feeBreakdown.advertising)}
            </strong>
          </div>
          <div className="bg-[#f8fafc] border border-[#dbe1e6] rounded-xl p-2.5 text-center">
            <span className="block text-[11px] text-[#5d6d7d]">Total Fees / Item</span>
            <strong className="block text-sm font-bold text-[#2d3e51] mt-0.5">
              {formatMoney(calc.fees)}
            </strong>
          </div>
        </div>
      </section>

      {/* SECTION 6: VAT (Optional UK Estimate) */}
      <section className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="font-serif-brand text-lg font-bold text-[#2d3e51] mb-1">
          8. VAT (Optional UK Estimate)
        </h3>
        <p className="text-xs text-[#5d6d7d] mb-4">
          Most small UK crafters operate below the VAT registration threshold. If registered, enter your settings.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-xs font-bold text-[#2d3e51] cursor-pointer">
              <input
                type="checkbox"
                checked={vat.vatRegistered}
                onChange={(e) => setVat({ ...vat, vatRegistered: e.target.checked })}
                className="w-4 h-4 rounded text-[#2d3e51] focus:ring-[#2d3e51]"
              />
              <span>VAT Registered</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              VAT Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              disabled={!vat.vatRegistered}
              value={vat.vatRate}
              onChange={(e) => setVat({ ...vat, vatRate: parseFloat(e.target.value) || 0 })}
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51] disabled:bg-zinc-100 disabled:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 text-xs font-bold text-[#2d3e51] cursor-pointer">
              <input
                type="checkbox"
                disabled={!vat.vatRegistered}
                checked={vat.vatInclusive}
                onChange={(e) => setVat({ ...vat, vatInclusive: e.target.checked })}
                className="w-4 h-4 rounded text-[#2d3e51] focus:ring-[#2d3e51] disabled:opacity-50"
              />
              <span>Entered Selling Price Includes VAT</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Recoverable Input VAT / Item (£)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              disabled={!vat.vatRegistered}
              value={vat.recoverableInputVat}
              onChange={(e) => setVat({ ...vat, recoverableInputVat: parseFloat(e.target.value) || 0 })}
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51] disabled:bg-zinc-100 disabled:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>
        </div>
      </section>

      {/* SECTION 7: Pricing & Target Strategy */}
      <section id="tour-pricing" className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="font-serif-brand text-lg font-bold text-[#2d3e51] mb-1">
          9. Pricing & Target Profit Strategy
        </h3>
        <p className="text-xs text-[#5d6d7d] mb-4">
          Choose whether to enter a target retail price directly, or let the calculator suggest the required price for your target profit margin or markup.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Pricing Mode Dropdown (Crucial mobile fix: onChange triggers immediate recalculation) */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Pricing Mode
            </label>
            <div className="relative">
              <select
                value={pricing.mode}
                onChange={(e) => setPricing({ ...pricing, mode: e.target.value as PricingMode })}
                className="w-full appearance-none text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-4 py-3 pr-10 text-[#2d3e51] font-medium focus:outline-none focus:ring-2 focus:ring-[#2d3e51] shadow-xs"
              >
                <option value="price">Enter my selling price</option>
                <option value="margin">Target profit margin (%)</option>
                <option value="markup">Target markup (%)</option>
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Item Selling Price (£)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              disabled={pricing.mode !== 'price'}
              value={pricing.mode === 'price' ? pricing.sellingPrice : Number(calc.sellingPrice.toFixed(2))}
              onChange={(e) => setPricing({ ...pricing, sellingPrice: parseFloat(e.target.value) || 0 })}
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-3 text-[#2d3e51] disabled:bg-[#edf2f5] disabled:text-[#34495d] disabled:font-bold focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Target Margin (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              value={pricing.targetMargin}
              onChange={(e) => setPricing({ ...pricing, targetMargin: parseFloat(e.target.value) || 0 })}
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-3 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Sale Discount (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              value={pricing.discount}
              onChange={(e) => setPricing({ ...pricing, discount: parseFloat(e.target.value) || 0 })}
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-3 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>
        </div>

        {/* Quick Margin Presets */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-[#dbe1e6]">
          <span className="text-xs font-bold text-[#5d6d7d] mr-1">Quick Target Margin Presets:</span>
          {[10, 20, 30, 40, 50, 60].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setPricing({ ...pricing, targetMargin: preset, mode: 'margin' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                pricing.targetMargin === preset && pricing.mode === 'margin'
                  ? 'bg-[#2d3e51] text-white shadow-xs'
                  : 'bg-[#f8fafc] border border-[#dbe1e6] hover:border-[#2d3e51] text-[#2d3e51]'
              }`}
            >
              {preset}% Target
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 8: Live Breakdown & Economics */}
      <section id="tour-breakdown" className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-serif-brand text-xl font-bold text-[#2d3e51] flex items-center gap-2">
              <span>Live Cost & Profit Breakdown</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#edf2f5] text-[#2d3e51] font-bold">
                GBP (£)
              </span>
            </h3>
            <p className="text-xs text-[#5d6d7d]">
              Estimated net earnings per item and batch based on entered assumptions.
            </p>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              type="button"
              onClick={handleExportCSV}
              className={`px-3 py-2 rounded-xl border text-xs font-bold shadow-xs flex items-center gap-1.5 transition ${
                isPro
                  ? 'border-[#dbe1e6] bg-white hover:border-[#2d3e51] text-[#2d3e51]'
                  : 'border-amber-300 bg-amber-50/60 hover:bg-amber-100/80 text-amber-950'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
              {!isPro && (
                <span className="text-[10px] font-extrabold text-amber-800 bg-amber-200/80 px-1 rounded">
                  PRO
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl border border-[#dbe1e6] bg-white hover:border-[#2d3e51] text-[#2d3e51] text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Cost Sheet</span>
            </button>
          </div>
        </div>

        {/* Warnings */}
        {calc.warnings.length > 0 && (
          <div className="space-y-2 mb-4">
            {calc.warnings.map((warn, i) => (
              <div
                key={i}
                className="bg-[#fff1df] border border-[#ead2a9] text-[#714318] px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-[#db9b47] shrink-0" />
                <span>{warn}</span>
              </div>
            ))}
          </div>
        )}

        {/* Key Hero Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-[#f8fafc] border border-[#dbe1e6] rounded-2xl p-4 text-center">
            <span className="block text-xs font-medium text-[#5d6d7d]">
              Estimated Profit / Item
            </span>
            <strong
              className={`block text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 ${
                calc.profit >= 0 ? 'text-[#15803d]' : 'text-red-600'
              }`}
            >
              {formatMoney(calc.profit)}
            </strong>
            <span className="text-[11px] text-[#5d6d7d] mt-1 block">
              At selling price {formatMoney(calc.sellingPrice)}
            </span>
          </div>

          <div className="bg-[#f8fafc] border border-[#dbe1e6] rounded-2xl p-4 text-center">
            <span className="block text-xs font-medium text-[#5d6d7d]">
              Profit Margin
            </span>
            <strong className="block text-2xl sm:text-3xl font-extrabold text-[#2d3e51] tracking-tight mt-1">
              {formatPct(calc.margin)}
            </strong>
            <span className="text-[11px] text-[#5d6d7d] mt-1 block">
              Target: {pricing.targetMargin}%
            </span>
          </div>

          <div className="bg-[#f8fafc] border border-[#dbe1e6] rounded-2xl p-4 text-center">
            <span className="block text-xs font-medium text-[#5d6d7d]">
              Batch Profit ({productDetails.batch} items)
            </span>
            <strong className="block text-2xl sm:text-3xl font-extrabold text-[#2d3e51] tracking-tight mt-1">
              {formatMoney(calc.profit * productDetails.batch)}
            </strong>
            <span className="text-[11px] text-[#5d6d7d] mt-1 block">
              Batch cost: {formatMoney(calc.batchProductionCost)}
            </span>
          </div>
        </div>

        {/* Detailed Financial Table */}
        <div className="overflow-x-auto border border-[#dbe1e6] rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <tbody>
              {[
                ['Materials Cost per Item', formatMoney(calc.materialsCost)],
                ['Maker Labour Cost', formatMoney(calc.labourCost)],
                ['Packaging & Inserts', formatMoney(calc.packagingCost)],
                ['Allocated Overhead', formatMoney(calc.overheadCost)],
                ['Total Production Cost per Finished Item', formatMoney(calc.productionCost)],
                ['Batch Production Cost (' + productDetails.batch + ' items)', formatMoney(calc.batchProductionCost)],
                ['Seller Actual Postage Paid', formatMoney(calc.sellerPostage)],
                ['Extra Postal Packaging & Mailer', formatMoney(calc.extraPostalPackaging)],
                ['Fulfilment & Handling', formatMoney(calc.fulfilmentCost)],
                ['Marketplace & Payment Fees', formatMoney(calc.fees)],
                ['Recoverable Input VAT (Deducted)', '-' + formatMoney(calc.recoverableInputVat)],
                ['Total Cost per Sale', formatMoney(calc.totalCostPerSale)],
                ['Retail Item Selling Price', formatMoney(calc.sellingPrice)],
                ['Customer Postage Income', formatMoney(calc.customerPostageIncome)],
                ['Output VAT (Remitted to HMRC)', formatMoney(calc.outputVAT)],
                ['Net Sales Revenue', formatMoney(calc.netSalesRevenue)],
                ['Net Estimated Profit per Item', formatMoney(calc.profit)],
              ].map(([label, val], idx) => (
                <tr
                  key={label}
                  className={`border-b border-[#dbe1e6] ${
                    idx % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#f8fafc]'
                  }`}
                >
                  <th className="py-2.5 px-4 font-semibold text-[#2d3e51]">{label}</th>
                  <td className="py-2.5 px-4 font-bold text-right text-[#2d3e51]">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Target Benchmark Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="bg-[#f8fafc] border border-[#dbe1e6] rounded-xl p-3 text-center">
            <span className="block text-[11px] text-[#5d6d7d]">Production Break-even</span>
            <strong className="block text-base font-bold text-[#2d3e51] mt-0.5">
              {formatMoney(calc.breakevenBeforeFees)}
            </strong>
          </div>

          <div className="bg-[#f8fafc] border border-[#dbe1e6] rounded-xl p-3 text-center">
            <span className="block text-[11px] text-[#5d6d7d]">Break-even After All Fees</span>
            <strong className="block text-base font-bold text-[#2d3e51] mt-0.5">
              {formatMoney(calc.breakevenAfterFees)}
            </strong>
          </div>

          <div className="bg-[#edf2f5] border border-[#dbe1e6] rounded-xl p-3 text-center">
            <span className="block text-[11px] text-[#2d3e51] font-semibold">
              Recommended {pricing.targetMargin}% Margin Price
            </span>
            <strong className="block text-base font-bold text-[#34495d] mt-0.5">
              {formatMoney(Math.ceil(calc.recommendedPrice * 100) / 100)}
            </strong>
          </div>
        </div>
      </section>

      {/* SECTION 9: Wholesale & Bulk Orders */}
      <section className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="font-serif-brand text-lg font-bold text-[#2d3e51] mb-1">
          10. Wholesale & Bulk Order Estimator
        </h3>
        <p className="text-xs text-[#5d6d7d] mb-4">
          Evaluate stockist trade orders and wholesale batches where maker time per item decreases.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Wholesale Order Qty
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={bulk.orderQuantity}
              onChange={(e) => setBulk({ ...bulk, orderQuantity: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Trade Discount (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              value={bulk.discount}
              onChange={(e) => setBulk({ ...bulk, discount: parseFloat(e.target.value) || 0 })}
              className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Wholesale Target Margin (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              value={bulk.wholesaleTargetMargin}
              onChange={(e) => setBulk({ ...bulk, wholesaleTargetMargin: parseFloat(e.target.value) || 0 })}
              className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Extra Bulk Pack / Item (£)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={bulk.extraPackagingPerItem}
              onChange={(e) => setBulk({ ...bulk, extraPackagingPerItem: parseFloat(e.target.value) || 0 })}
              className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Batch Minutes Saved / Item
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={bulk.minutesSavedPerItem}
              onChange={(e) => setBulk({ ...bulk, minutesSavedPerItem: parseFloat(e.target.value) || 0 })}
              className="w-full text-base sm:text-xs bg-white border border-[#dbe1e6] rounded-xl px-3 py-2 text-[#2d3e51]"
            />
          </div>
        </div>

        {/* Bulk results */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="bg-[#f8fafc] border border-[#dbe1e6] rounded-xl p-2.5 text-center">
            <span className="block text-[11px] text-[#5d6d7d]">Total Production Cost</span>
            <strong className="block text-xs font-bold text-[#2d3e51] mt-0.5">
              {formatMoney(bulkProductionItem * bulk.orderQuantity)}
            </strong>
          </div>
          <div className="bg-[#f8fafc] border border-[#dbe1e6] rounded-xl p-2.5 text-center">
            <span className="block text-[11px] text-[#5d6d7d]">Wholesale Revenue</span>
            <strong className="block text-xs font-bold text-[#2d3e51] mt-0.5">
              {formatMoney(bulkResult.revenue * bulk.orderQuantity)}
            </strong>
          </div>
          <div className="bg-[#f8fafc] border border-[#dbe1e6] rounded-xl p-2.5 text-center">
            <span className="block text-[11px] text-[#5d6d7d]">Order Profit</span>
            <strong className="block text-xs font-bold text-[#34495d] mt-0.5">
              {formatMoney(bulkResult.profit * bulk.orderQuantity)}
            </strong>
          </div>
          <div className="bg-[#f8fafc] border border-[#dbe1e6] rounded-xl p-2.5 text-center">
            <span className="block text-[11px] text-[#5d6d7d]">Wholesale Price / Item</span>
            <strong className="block text-xs font-bold text-[#2d3e51] mt-0.5">
              {formatMoney(bulkPrice)}
            </strong>
          </div>
          <div className="bg-[#f8fafc] border border-[#dbe1e6] rounded-xl p-2.5 text-center">
            <span className="block text-[11px] text-[#5d6d7d]">Wholesale Margin</span>
            <strong className="block text-xs font-bold text-[#2d3e51] mt-0.5">
              {formatPct(bulkResult.margin)}
            </strong>
          </div>
          <div className="bg-[#edf2f5] border border-[#dbe1e6] rounded-xl p-2.5 text-center">
            <span className="block text-[11px] text-[#2d3e51] font-semibold">Min Target Price</span>
            <strong className="block text-xs font-bold text-[#34495d] mt-0.5">
              {formatMoney(Math.ceil(bulkMinPrice * 100) / 100)}
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
};
