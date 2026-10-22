import React, { useState } from 'react';
import {
  Search,
  Download,
  Printer,
  FolderOpen,
  Copy,
  Trash2,
  PlusCircle,
  ChevronDown,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { SavedProduct } from '../types/calculator';
import { formatMoney, formatPct } from '../utils/calculator';
import { FREE_LIMITS } from '../utils/license';
import { Sparkles, Lock } from 'lucide-react';

interface ProductsViewProps {
  products: SavedProduct[];
  onOpenProduct: (product: SavedProduct) => void;
  onDuplicateProduct: (product: SavedProduct) => void;
  onDeleteProduct: (backendId: string) => void;
  onNewProduct: () => void;
  isPro?: boolean;
  onOpenPaywall?: (feature?: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onOpenProduct,
  onDuplicateProduct,
  onDeleteProduct,
  onNewProduct,
  isPro = false,
  onOpenPaywall,
}) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'price' | 'profit' | 'margin'>('name');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((p) => p.__backendId));
    }
  };

  const handleNewProductClick = () => {
    if (!isPro && products.length >= FREE_LIMITS.maxProducts) {
      onOpenPaywall?.(
        `Free plan is limited to ${FREE_LIMITS.maxProducts} saved products. Upgrade to PRO for unlimited product calculations.`
      );
      return;
    }
    onNewProduct();
  };

  const handleDuplicateClick = (product: SavedProduct) => {
    if (!isPro && products.length >= FREE_LIMITS.maxProducts) {
      onOpenPaywall?.(
        `Duplicating a product exceeds the Free plan limit of ${FREE_LIMITS.maxProducts} products. Upgrade to PRO for unlimited products.`
      );
      return;
    }
    onDuplicateProduct(product);
  };

  const handleExportCSV = () => {
    if (!isPro) {
      onOpenPaywall?.('CSV product catalog export is a PRO feature. Upgrade to export your data anytime.');
      return;
    }

    const rows = [
      ['Product Name', 'Category', 'SKU', 'Production Cost (£)', 'Selling Price (£)', 'Fees (£)', 'Profit Per Item (£)', 'Profit Margin (%)', 'Batch Qty', 'Batch Profit (£)', 'Updated'],
      ...products.map((p) => [
        p.name,
        p.category,
        p.sku,
        p.production_cost.toFixed(2),
        p.selling_price.toFixed(2),
        p.total_fees.toFixed(2),
        p.profit_per_item.toFixed(2),
        (p.profit_margin * 100).toFixed(1) + '%',
        String(p.batch_quantity),
        (p.profit_per_item * (p.batch_quantity || 1)).toFixed(2),
        p.updated_at,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'my-craft-products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort
  const filtered = products.filter((p) =>
    `${p.name} ${p.category} ${p.sku} ${p.description}`.toLowerCase().includes(search.toLowerCase())
  );

  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'cost':
        return (b.production_cost || 0) - (a.production_cost || 0);
      case 'price':
        return (b.selling_price || 0) - (a.selling_price || 0);
      case 'profit':
        return (b.profit_per_item || 0) - (a.profit_per_item || 0);
      case 'margin':
        return (b.profit_margin || 0) - (a.profit_margin || 0);
      default:
        return 0;
    }
  });

  const comparedProducts = products.filter((p) => selectedIds.includes(p.__backendId));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#dbe1e6]">
        <div>
          <h2 className="header-title text-[18px] font-bold text-[#1e293b]">
            My Saved Products
          </h2>
          <p className="header-subtitle text-[12px] font-normal text-[#5d6d7d] mt-1">
            Browse, manage and compare all your craft product recipes, pricing targets and estimated profits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNewProductClick}
            className="px-4 py-2.5 rounded-xl bg-[#2d3e51] hover:bg-[#34495d] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Product</span>
          </button>
        </div>
      </div>

      {/* Free Plan Limit Notice */}
      {!isPro && products.length >= FREE_LIMITS.maxProducts && (
        <div className="bg-[#fff1df] border border-[#ead2a9] text-[#714318] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-200/60 text-amber-900 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <strong className="font-bold text-amber-950 block">
                Free Plan Limit Reached ({products.length} of {FREE_LIMITS.maxProducts} products)
              </strong>
              <span className="text-[11px] text-amber-900">
                You have reached the free tier limit. Upgrade to PRO to save unlimited craft recipes, variations, and batch calculations.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onOpenPaywall?.(
                `Free plan is limited to ${FREE_LIMITS.maxProducts} saved products. Upgrade to PRO for unlimited products.`
              )
            }
            className="px-4 py-2 rounded-full bg-[#0072ce] hover:bg-[#005ea6] text-white font-bold text-xs shadow-sm hover:shadow transition active:scale-95 flex items-center gap-1.5 self-start sm:self-auto shrink-0"
          >
            <span className="text-xs leading-none" role="img" aria-label="star">⭐</span>
            <span>Unlock PRO</span>
          </button>
        </div>
      )}

      {/* Toolbar: Search and Sort Dropdown (Tested for mobile) */}
      <div className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-[#5d6d7d] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, category, SKU..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#dbe1e6] rounded-xl text-base sm:text-xs text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>

          {/* Sort Dropdown with reliable onChange handler on mobile */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'cost' | 'price' | 'profit' | 'margin')}
              className="w-full appearance-none bg-white border border-[#dbe1e6] rounded-xl px-4 py-2.5 pr-9 text-base sm:text-xs font-semibold text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            >
              <option value="name">Sort by: Name (A-Z)</option>
              <option value="profit">Sort by: Profit / Item (Highest)</option>
              <option value="margin">Sort by: Margin % (Highest)</option>
              <option value="price">Sort by: Selling Price (Highest)</option>
              <option value="cost">Sort by: Production Cost (Highest)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          </div>
        </div>

        {/* Action Bar for comparison and CSV */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-[#dbe1e6] text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs font-semibold text-[#2d3e51] hover:underline"
            >
              {selectedIds.length === filtered.length && filtered.length > 0
                ? 'Deselect All'
                : 'Select All'}
            </button>
            <span className="text-[#5d6d7d]">
              ({selectedIds.length} selected for comparison)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowComparison(!showComparison)}
              disabled={selectedIds.length === 0}
              className="px-3 py-1.5 rounded-lg border border-[#dbe1e6] bg-white hover:border-[#2d3e51] disabled:opacity-40 text-xs font-bold text-[#2d3e51] transition shadow-xs flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-[#2d3e51]" />
              <span>{showComparison ? 'Hide Comparison' : 'Compare Selected'}</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition shadow-xs flex items-center gap-1.5 ${
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
          </div>
        </div>

        {/* Products Table */}
        <div className="mt-3 overflow-x-auto border border-[#dbe1e6] rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#dbe1e6] text-[#5d6d7d]">
                <th className="py-3 px-3 w-8">
                  <span className="sr-only">Select</span>
                </th>
                <th className="py-3 px-4 font-bold">Product Name</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Cost / Item</th>
                <th className="py-3 px-4 font-bold">Price</th>
                <th className="py-3 px-4 font-bold">Profit</th>
                <th className="py-3 px-4 font-bold">Margin</th>
                <th className="py-3 px-4 font-bold">Updated</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-[#5d6d7d]">
                    No saved products match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((p, idx) => {
                  const isSelected = selectedIds.includes(p.__backendId);
                  return (
                    <tr
                      key={p.__backendId}
                      className={`border-b border-[#dbe1e6] hover:bg-slate-50 transition-colors ${
                        isSelected ? 'bg-[#edf2f5]' : idx % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#f8fafc]'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(p.__backendId)}
                          className="w-4 h-4 rounded text-[#2d3e51] focus:ring-[#2d3e51]"
                        />
                      </td>
                      <td className="py-3 px-4 font-bold text-[#2d3e51]">
                        {p.name}
                        {p.sku && (
                          <span className="block text-[10px] text-[#5d6d7d] font-normal">
                            SKU: {p.sku}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#5d6d7d]">{p.category}</td>
                      <td className="py-3 px-4 font-semibold text-[#2d3e51]">
                        {formatMoney(p.production_cost)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#2d3e51]">
                        {formatMoney(p.selling_price)}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#34495d]">
                        {formatMoney(p.profit_per_item)}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#2d3e51]">
                        {formatPct(p.profit_margin)}
                      </td>
                      <td className="py-3 px-4 text-[#5d6d7d]">
                        {new Date(p.updated_at).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenProduct(p)}
                            className="px-2.5 py-1 rounded-lg border border-[#dbe1e6] bg-white hover:border-[#2d3e51] hover:text-[#2d3e51] text-[11px] font-semibold text-[#2d3e51] transition shadow-xs flex items-center gap-1"
                            title="Open and edit product in calculator"
                          >
                            <FolderOpen className="w-3 h-3 text-[#2d3e51]" />
                            <span>Open</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateClick(p)}
                            className="p-1 rounded-lg border border-[#dbe1e6] bg-white hover:border-[#2d3e51] text-[#2d3e51] transition shadow-xs"
                            title="Duplicate product"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(p.__backendId)}
                            className="p-1 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 transition shadow-xs"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Drawer / Section */}
      {showComparison && comparedProducts.length > 0 && (
        <div className="bg-[#ffffff] border border-[#2d3e51] rounded-2xl p-5 sm:p-6 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-serif-brand text-lg font-bold text-[#2d3e51] flex items-center gap-2">
                <span>Product Comparison Matrix</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#edf2f5] text-[#2d3e51] font-bold">
                  {comparedProducts.length} items
                </span>
              </h3>
              <p className="text-xs text-[#5d6d7d]">
                Side-by-side comparison of costs, margins, and batch economics.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl border border-[#dbe1e6] bg-white hover:border-[#2d3e51] text-[#2d3e51] text-xs font-bold shadow-xs flex items-center gap-1.5 transition no-print"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Comparison</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-[#dbe1e6] rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#dbe1e6] text-[#5d6d7d]">
                  <th className="py-3 px-4 font-bold">Metric</th>
                  {comparedProducts.map((p) => (
                    <th key={p.__backendId} className="py-3 px-4 font-bold text-[#2d3e51]">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Category', (p: SavedProduct) => p.category],
                  ['Production Cost / Item', (p: SavedProduct) => formatMoney(p.production_cost)],
                  ['Selling Price', (p: SavedProduct) => formatMoney(p.selling_price)],
                  ['Selling Fees', (p: SavedProduct) => formatMoney(p.total_fees)],
                  ['Estimated Profit / Item', (p: SavedProduct) => formatMoney(p.profit_per_item)],
                  ['Profit Margin', (p: SavedProduct) => formatPct(p.profit_margin)],
                  ['Markup on Cost', (p: SavedProduct) => formatPct(p.markup)],
                  ['Batch Quantity', (p: SavedProduct) => String(p.batch_quantity)],
                  ['Batch Profit', (p: SavedProduct) => formatMoney(p.profit_per_item * (p.batch_quantity || 1))],
                ].map(([label, getter], idx) => (
                  <tr
                    key={String(label)}
                    className={`border-b border-[#dbe1e6] ${
                      idx % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#f8fafc]'
                    }`}
                  >
                    <th className="py-2.5 px-4 font-semibold text-[#5d6d7d]">{label as string}</th>
                    {comparedProducts.map((p) => (
                      <td key={p.__backendId} className="py-2.5 px-4 font-bold text-[#2d3e51]">
                        {(getter as (p: SavedProduct) => string)(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
