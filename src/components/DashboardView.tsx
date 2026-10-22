import React from 'react';
import {
  PlusCircle,
  TrendingUp,
  ShoppingBag,
  PoundSterling,
  Sparkles,
  ArrowRight,
  FolderOpen,
  Copy,
  Trash2,
} from 'lucide-react';
import { SavedProduct } from '../types/calculator';
import { formatMoney, formatPct } from '../utils/calculator';

interface DashboardViewProps {
  products: SavedProduct[];
  onOpenProduct: (product: SavedProduct) => void;
  onDuplicateProduct: (product: SavedProduct) => void;
  onDeleteProduct: (backendId: string) => void;
  onNewProduct: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  onOpenProduct,
  onDuplicateProduct,
  onDeleteProduct,
  onNewProduct,
}) => {
  const count = products.length;

  const avgCost = count > 0 ? products.reduce((acc, p) => acc + (p.production_cost || 0), 0) / count : 0;
  const avgPrice = count > 0 ? products.reduce((acc, p) => acc + (p.selling_price || 0), 0) / count : 0;
  const avgProfit = count > 0 ? products.reduce((acc, p) => acc + (p.profit_per_item || 0), 0) / count : 0;
  const avgMargin = count > 0 ? products.reduce((acc, p) => acc + (p.profit_margin || 0), 0) / count : 0;

  const sortedByProfit = [...products].sort((a, b) => (b.profit_per_item || 0) - (a.profit_per_item || 0));
  const mostProfitable = sortedByProfit[0];

  const recentProducts = [...products].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#dbe1e6]">
        <div>
          <h2 className="header-title text-[18px] font-bold text-[#1e293b]">
            Dashboard
          </h2>
          <p className="header-subtitle text-[12px] font-normal text-[#5d6d7d] mt-1">
            Overview of your UK craft product catalog, production cost estimates and profit margins.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewProduct}
          className="px-4 py-2.5 rounded-xl bg-[#2d3e51] hover:bg-[#34495d] active:bg-[#1f2d3d] text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Calculate New Product</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-[#5d6d7d] font-medium flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5 text-[#2d3e51]" />
            Saved Products
          </span>
          <strong className="block text-2xl font-bold text-[#2d3e51] mt-2">
            {count}
          </strong>
        </div>

        <div className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-[#5d6d7d] font-medium flex items-center gap-1">
            <PoundSterling className="w-3.5 h-3.5 text-[#2d3e51]" />
            Avg Production Cost
          </span>
          <strong className="block text-2xl font-bold text-[#2d3e51] mt-2">
            {formatMoney(avgCost)}
          </strong>
        </div>

        <div className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-[#5d6d7d] font-medium flex items-center gap-1">
            <PoundSterling className="w-3.5 h-3.5 text-[#2d3e51]" />
            Avg Selling Price
          </span>
          <strong className="block text-2xl font-bold text-[#2d3e51] mt-2">
            {formatMoney(avgPrice)}
          </strong>
        </div>

        <div className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-[#5d6d7d] font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#2d3e51]" />
            Avg Profit / Item
          </span>
          <strong className="block text-2xl font-bold text-[#15803d] mt-2">{formatMoney(avgProfit)}
          </strong>
        </div>

        <div className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-[#5d6d7d] font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#2d3e51]" />
            Avg Profit Margin
          </span>
          <strong className="block text-2xl font-bold text-[#2d3e51] mt-2">
            {formatPct(avgMargin)}
          </strong>
        </div>

        <div className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-[#5d6d7d] font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#db9b47]" />
            Top Earner / Item
          </span>
          <strong className="block text-sm font-bold text-[#2d3e51] mt-2 truncate" title={mostProfitable ? mostProfitable.name : 'None'}>
            {mostProfitable ? mostProfitable.name : '—'}
          </strong>
          <span className="text-[11px] text-[#15803d] font-bold block mt-0.5">
            {mostProfitable ? formatMoney(mostProfitable.profit_per_item) + ' profit' : '—'}
          </span>
        </div>
      </div>

      {/* Main Content Card: Recent Estimates */}
      <div className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-serif-brand text-lg font-bold text-[#2d3e51]">
              Recent Saved Product Calculations
            </h3>
            <p className="text-xs text-[#5d6d7d]">
              Estimated per-item costs, selling prices and net margins.
            </p>
          </div>
        </div>

        {recentProducts.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-[#dbe1e6] rounded-2xl p-6">
            <ShoppingBag className="w-10 h-10 text-[#2d3e51] mx-auto mb-3 opacity-60" />
            <h4 className="font-bold text-[#2d3e51] text-base mb-1">
              Start with your first craft make
            </h4>
            <p className="text-xs text-[#5d6d7d] max-w-md mx-auto mb-4">
              Enter your raw materials, making time, packaging, postage and marketplace fees to calculate true profitability.
            </p>
            <button
              type="button"
              onClick={onNewProduct}
              className="px-5 py-2.5 rounded-xl bg-[#2d3e51] hover:bg-[#34495d] text-white text-xs font-bold transition shadow-sm inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Calculate Your First Product</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#dbe1e6] rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#dbe1e6] text-[#5d6d7d]">
                  <th className="py-3 px-4 font-bold">Product Name</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Production / Item</th>
                  <th className="py-3 px-4 font-bold">Selling Price</th>
                  <th className="py-3 px-4 font-bold">Est. Profit</th>
                  <th className="py-3 px-4 font-bold">Margin</th>
                  <th className="py-3 px-4 font-bold">Updated</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((p, idx) => (
                  <tr
                    key={p.__backendId}
                    className={`border-b border-[#dbe1e6] hover:bg-slate-50 transition-colors ${
                      idx % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#f8fafc]'
                    }`}
                  >
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
                          title="Open product in calculator"
                        >
                          <FolderOpen className="w-3 h-3 text-[#2d3e51]" />
                          <span>Open</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateProduct(p)}
                          className="p-1 rounded-lg border border-[#dbe1e6] bg-white hover:border-[#2d3e51] text-[#2d3e51] transition shadow-xs"
                          title="Duplicate calculation"
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
