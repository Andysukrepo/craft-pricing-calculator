import React, { useState } from 'react';
import {
  TrendingUp,
  Percent,
  Sliders,
  DollarSign,
  ArrowRight,
  Info,
} from 'lucide-react';
import { SavedProduct } from '../types/calculator';
import { formatMoney, formatPct, calculatePriceResult, calculateTargetPrice } from '../utils/calculator';
import { Sparkles, Lock } from 'lucide-react';

interface SimulatorViewProps {
  currentProduct?: SavedProduct | null;
  isPro?: boolean;
  onOpenPaywall?: (feature?: string) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  currentProduct,
  isPro = false,
  onOpenPaywall,
}) => {
  const [customPrice, setCustomPrice] = useState<number>(currentProduct?.selling_price ? currentProduct.selling_price * 1.15 : 22.0);
  const [customQty, setCustomQty] = useState<number>(30);
  const [customDiscount, setCustomDiscount] = useState<number>(15);

  const prodCost = currentProduct?.production_cost || 7.5;
  const currPrice = currentProduct?.selling_price || 16.0;
  const targetMargin = (currentProduct?.pricing?.targetMargin || 30) / 100;

  const baseParams = {
    productionCost: prodCost,
    actualPostage: currentProduct?.postage?.actualPaid || 2.85,
    extraPostalPackaging: currentProduct?.postage?.extraPackaging || 0.35,
    fulfilment: currentProduct?.postage?.otherFulfilment || 0,
    recoverableInputVat: currentProduct?.vat?.recoverableInputVat || 0,
    chargedPostage: currentProduct?.postage?.freeCustomerPostage ? 0 : currentProduct?.postage?.chargedToCustomer || 3.5,
    freePostage: Boolean(currentProduct?.postage?.freeCustomerPostage),
    vatRegistered: Boolean(currentProduct?.vat?.vatRegistered),
    vatRate: (currentProduct?.vat?.vatRate || 20) / 100,
    vatInclusive: Boolean(currentProduct?.vat?.vatInclusive ?? true),
    feeEnabled: Boolean(currentProduct?.fees?.feeEnabled ?? true),
    feePostage: Boolean(currentProduct?.fees?.feesApplyToPostage ?? true),
    feeValues: currentProduct?.fees?.feeValues || [6.5, 0.2, 0, 0, 0, 0, 0],
    orderCount: currentProduct?.fees?.itemsPerOrder || 1,
  };

  const breakevenPrice = calculateTargetPrice(0, baseParams);
  const recommendedPrice = calculateTargetPrice(targetMargin, baseParams);

  const scenarios: { name: string; price: number; description: string }[] = [
    { name: 'Break-even', price: breakevenPrice, description: 'Zero profit, covers all entered costs and fees' },
    { name: 'Lower (-10%)', price: currPrice * 0.9, description: 'Promotional or clearance pricing' },
    { name: 'Current Selling Price', price: currPrice, description: 'Your currently set retail price' },
    { name: 'Recommended Target Price', price: Math.ceil(recommendedPrice * 100) / 100, description: `Achieves your target ${(targetMargin * 100).toFixed(0)}% profit margin` },
    { name: 'Premium (+20%)', price: currPrice * 1.2, description: 'Luxury or gift-season pricing' },
    { name: 'Custom Simulation Price', price: customPrice, description: 'Your custom experimental price point' },
  ];

  const salesVolumes = [10, 25, 50, 100, customQty];

  const discounts = [5, 10, 15, 20, customDiscount];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="pb-4 border-b border-[#dbe1e6]">
        <h2 className="header-title text-[18px] font-bold text-[#1e293b]">
          Profit Simulator &amp; Sales Scenarios
        </h2>
        <p className="header-subtitle text-[12px] font-normal text-[#5d6d7d] mt-1">
          Explore how varying retail prices, promotional discounts and sales volumes impact your take-home craft earnings.
          {currentProduct && (
            <span className="font-semibold text-[#2d3e51] ml-1">
              (Simulating: {currentProduct.name})
            </span>
          )}
        </p>
      </div>

      {/* PRO Demo Banner */}
      {!isPro && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-sm font-bold text-amber-950">
                  Simulator Preview Mode
                </strong>
                <span className="text-[10px] font-extrabold uppercase tracking-wide bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                  Free Tier
                </span>
              </div>
              <p className="text-xs text-amber-900/90 mt-0.5">
                Unlock PRO to model unlimited products simultaneously, export scenario projections to CSV, and save custom wholesale structures.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenPaywall?.('Unlock full Profit Simulator & unlimited scenarios with PRO')}
            className="px-5 py-2 rounded-full bg-[#0072ce] hover:bg-[#005ea6] active:scale-95 text-white text-xs sm:text-sm font-bold transition shadow-sm hover:shadow flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto shrink-0"
          >
            <span className="text-sm leading-none" role="img" aria-label="star">⭐</span>
            <span>Unlock PRO Access</span>
          </button>
        </div>
      )}

      {/* Control Panel */}
      <div className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-5 sm:p-6 shadow-xs">
        <h3 className="font-serif-brand text-lg font-bold text-[#2d3e51] mb-3 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#2d3e51]" />
          <span>Interactive Simulation Variables</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Custom Scenario Price (£)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={customPrice}
              onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Custom Sales Volume Target (Units)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={customQty}
              onChange={(e) => setCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d3e51] mb-1.5">
              Custom Promotional Discount (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              value={customDiscount}
              onChange={(e) => setCustomDiscount(parseFloat(e.target.value) || 0)}
              className="w-full text-base sm:text-sm bg-white border border-[#dbe1e6] rounded-xl px-3.5 py-2.5 text-[#2d3e51] focus:outline-none focus:ring-2 focus:ring-[#2d3e51]"
            />
          </div>
        </div>
      </div>

      {/* Scenarios Table */}
      <div className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="font-serif-brand text-lg font-bold text-[#2d3e51] mb-1">
          Price Point Profit Projections
        </h3>
        <p className="text-xs text-[#5d6d7d] mb-4">
          Estimated net profit generated at different batch and monthly unit volumes.
        </p>

        <div className="overflow-x-auto border border-[#dbe1e6] rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#dbe1e6] text-[#5d6d7d]">
                <th className="py-3 px-4 font-bold">Scenario</th>
                <th className="py-3 px-4 font-bold">Item Price</th>
                <th className="py-3 px-4 font-bold">Profit / Item</th>
                <th className="py-3 px-4 font-bold">Margin</th>
                {salesVolumes.map((vol, i) => (
                  <th key={vol} className="py-3 px-4 font-bold text-right">
                    {i === 4 ? `Custom (${vol})` : `${vol} sales`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenarios.map((sc, idx) => {
                const res = calculatePriceResult(sc.price, baseParams);
                return (
                  <tr
                    key={sc.name}
                    className={`border-b border-[#dbe1e6] hover:bg-slate-50 transition-colors ${
                      idx % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#f8fafc]'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-[#2d3e51]">
                      {sc.name}
                      <span className="block text-[10px] text-[#5d6d7d] font-normal">
                        {sc.description}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#2d3e51]">
                      {formatMoney(sc.price)}
                    </td>
                    <td
                      className={`py-3 px-4 font-bold ${
                        res.profit >= 0 ? 'text-[#15803d]' : 'text-red-600'
                      }`}
                    >
                      {formatMoney(res.profit)}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#2d3e51]">
                      {formatPct(res.margin)}
                    </td>
                    {salesVolumes.map((vol) => (
                      <td
                        key={vol}
                        className={`py-3 px-4 font-bold text-right ${
                          res.profit >= 0 ? 'text-[#2d3e51]' : 'text-red-600'
                        }`}
                      >
                        {formatMoney(res.profit * vol)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discount Simulator */}
      <div className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="font-serif-brand text-lg font-bold text-[#2d3e51] mb-1">
          Discount & Flash-Sale Impact
        </h3>
        <p className="text-xs text-[#5d6d7d] mb-4">
          See how seasonal discounts affect platform fees and your true bottom-line profit.
        </p>

        <div className="overflow-x-auto border border-[#dbe1e6] rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#dbe1e6] text-[#5d6d7d]">
                <th className="py-3 px-4 font-bold">Discount</th>
                <th className="py-3 px-4 font-bold">Discounted Price</th>
                <th className="py-3 px-4 font-bold">Marketplace Fees</th>
                <th className="py-3 px-4 font-bold">Remaining Profit / Item</th>
                <th className="py-3 px-4 font-bold">Effective Margin</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((disc, idx) => {
                const discountedPrice = currPrice * (1 - disc / 100);
                const res = calculatePriceResult(discountedPrice, baseParams);
                return (
                  <tr
                    key={disc + '-' + idx}
                    className={`border-b border-[#dbe1e6] hover:bg-slate-50 transition-colors ${
                      idx % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#f8fafc]'
                    }`}
                  >
                    <th className="py-3 px-4 font-bold text-[#2d3e51]">
                      {idx === 4 ? `Custom: ${disc}%` : `${disc}% Off`}
                    </th>
                    <td className="py-3 px-4 font-semibold text-[#2d3e51]">
                      {formatMoney(discountedPrice)}
                    </td>
                    <td className="py-3 px-4 text-[#5d6d7d]">{formatMoney(res.fees)}</td>
                    <td
                      className={`py-3 px-4 font-bold ${
                        res.profit >= 0 ? 'text-[#15803d]' : 'text-red-600'
                      }`}
                    >
                      {formatMoney(res.profit)}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#2d3e51]">
                      {formatPct(res.margin)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
