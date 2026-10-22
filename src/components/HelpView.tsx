import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  DollarSign,
  AlertCircle,
  Sparkles,
  Scale,
} from 'lucide-react';

interface GuideItem {
  id: string;
  title: string;
  summary: string;
  content: React.ReactNode;
}

export const HelpView: React.FC = () => {
  const [openIds, setOpenIds] = useState<string[]>(['materials', 'margin', 'worked-example']);

  const toggle = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const guides: GuideItem[] = [
    {
      id: 'materials',
      title: 'Materials & Bulk Purchases',
      summary: 'Accurately convert purchase pack sizes into individual unit costs and apply a waste allowance.',
      content: (
        <div className="space-y-2 text-xs text-[#2d3e51] leading-relaxed">
          <p>
            Divide the pack purchase price by the pack quantity to find your cost per purchase unit, then convert to compatible measurement units (e.g. grams to kilograms, millilitres to litres).
          </p>
          <div className="p-3 bg-[#f8fafc] border border-[#dbe1e6] rounded-xl font-mono text-[11px]">
            Example: A 1,000 g bag of wax costing £6.95 has a base cost of £0.00695 per gram.
            Using 150 g with 5% waste uses 157.5 g effective = <strong>£1.09 per candle</strong>.
          </div>
          <p>
            <strong>Waste Allowance:</strong> Always account for trimming, spillages, test cuts and offcuts. A 5% to 10% allowance ensures you don&apos;t absorb hidden material losses.
          </p>
        </div>
      ),
    },
    {
      id: 'labour',
      title: 'Maker Labour & Presentation Packaging',
      summary: 'Pay yourself a real wage and capture full presentation and shipping prep time.',
      content: (
        <div className="space-y-2 text-xs text-[#2d3e51] leading-relaxed">
          <p>
            Your time is a genuine production expense. Multiply your hourly rate by total making minutes divided by 60.
          </p>
          <p>
            Include setup, personalisation, finishing, polishing, quality control and dispatch boxing. If you don&apos;t price in your labour, you are working as a hobbyist rather than running a viable craft business.
          </p>
          <p>
            <strong>Packaging:</strong> Ensure postal outer boxes, tissue paper, warning labels, care cards and ribbon are counted under either Materials or Packaging, never omitted and never double-counted.
          </p>
        </div>
      ),
    },
    {
      id: 'overheads',
      title: 'Allocated Overheads & Underpricing Hazards',
      summary: 'Keep machinery, studio rent, power and tool wear covered across product batches.',
      content: (
        <div className="space-y-2 text-xs text-[#2d3e51] leading-relaxed">
          <p>
            Overheads include workshop electricity (e.g. kilns, sewing machines, heat presses), machine depreciation, software subscriptions (Etsy SEO tools, Adobe suite, accounting software), studio rent and small expendable consumables.
          </p>
          <p>
            Never assign an entire £100 monthly bill to a single product. Instead, allocate overheads realistically over your estimated monthly production volume (e.g. £100 shared across 200 items = £0.50/item).
          </p>
        </div>
      ),
    },
    {
      id: 'marketplace',
      title: 'Marketplace Fees (Etsy UK, Shopify, eBay, PayPal)',
      summary: 'Understand transaction cuts, listing fees and postage fee inclusions.',
      content: (
        <div className="space-y-2 text-xs text-[#2d3e51] leading-relaxed">
          <p>
            Platform presets in this calculator are editable estimates to assist your pricing decisions:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Etsy UK:</strong> 6.5% transaction fee on total price + customer postage, ~20p (£0.16 + VAT) listing fee, plus payment processing fees.</li>
            <li><strong>Shopify:</strong> Online card processing (~1.5%–2.0% + 25p–30p) plus your monthly subscription.</li>
            <li><strong>eBay UK:</strong> Category final value fee (often 12.8% + 30p order fee).</li>
            <li><strong>In-Person Craft Fairs:</strong> Split the table pitch fee (e.g. £40) across expected sales on the day.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'margin',
      title: 'Profit Margin vs Markup: The Critical Distinction',
      summary: 'Avoid the #1 mathematical trap that leads handmade makers to underprice.',
      content: (
        <div className="space-y-2 text-xs text-[#2d3e51] leading-relaxed">
          <p>
            Many makers confuse <strong>Markup</strong> and <strong>Profit Margin</strong>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#f8fafc] border border-[#dbe1e6] rounded-xl">
            <div>
              <strong className="block text-[#2d3e51] text-sm">Profit Margin</strong>
              <div className="font-mono text-xs mt-1">Margin = Profit ÷ Selling Price</div>
              <p className="mt-1 text-[11px] text-[#5d6d7d]">
                Shows the percentage of revenue you keep after all costs. A 50% margin means 50p out of every £1.00 is profit.
              </p>
            </div>
            <div>
              <strong className="block text-[#2d3e51] text-sm">Markup</strong>
              <div className="font-mono text-xs mt-1">Markup = Profit ÷ Production Cost</div>
              <p className="mt-1 text-[11px] text-[#5d6d7d]">
                Shows how much you added onto your base cost. A 100% markup on a £10 cost produces a £20 price (which is a 50% margin).
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'vat',
      title: 'UK VAT & Wholesale Trade Pricing',
      summary: 'Handling retail VAT inclusive pricing and calculating profitable stockist terms.',
      content: (
        <div className="space-y-2 text-xs text-[#2d3e51] leading-relaxed">
          <p>
            <strong>UK VAT:</strong> If your annual turnover exceeds the UK VAT registration threshold (£90,000 as of 2024/2026), your retail prices to UK consumers include standard 20% VAT. £12.00 inclusive of 20% VAT equals £10.00 net sales revenue and £2.00 output VAT remitted to HMRC.
          </p>
          <p>
            <strong>Wholesale Orders:</strong> Boutiques and stockists typically request a 40% to 50% discount off standard RRP. Always test your wholesale orders in the Bulk Estimator to confirm batch savings cover trade margins.
          </p>
        </div>
      ),
    },
    {
      id: 'worked-example',
      title: 'Worked Example: Artisan Candle Breakdown',
      summary: 'Step-by-step numbers demonstrating a profitable UK craft calculation.',
      content: (
        <div className="p-4 bg-[#edf2f5] border border-[#dbe1e6] rounded-xl space-y-2 text-xs text-[#2d3e51]">
          <p className="font-bold text-sm text-[#34495d]">
            Production Recipe for 180ml Amber Jar Candle:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Materials: £1.09 (Soy wax) + £0.09 (Wick) + £0.70 (Fragrance oil) + £0.76 (Jar & lid) = <strong>£2.64</strong></li>
            <li>Maker Labour: 18 minutes @ £14/hour = <strong>£4.20</strong></li>
            <li>Packaging: Box, CLP warning sticker, tissue & ribbon = <strong>£1.10</strong></li>
            <li>Allocated Overhead: Studio power, insurance & depreciation = <strong>£0.50</strong></li>
            <li><strong>Total Base Production Cost = £8.44</strong></li>
          </ul>
          <p className="pt-2 border-t border-[#dbe1e6]">
            At a retail selling price of <strong>£16.00</strong> on Etsy UK with £3.95 charged postage (costing £3.35 actual postage):
            Estimated Marketplace Fees = <strong>£1.50</strong>.
            Net take-home profit = <strong>£6.32 per candle</strong> (31.7% profit margin).
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="pb-4 border-b border-[#dbe1e6]">
        <h2 className="header-title text-[18px] font-bold text-[#1e293b]">
          Craft Pricing Guides & UK Maker Economics
        </h2>
        <p className="header-subtitle text-[12px] font-normal text-[#5d6d7d] mt-1">
          Practical reference notes, mathematical formulas and advice for handmade businesses in the United Kingdom.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {guides.map((item) => {
          const isOpen = openIds.includes(item.id);
          return (
            <div
              key={item.id}
              className="bg-[#ffffff] border border-[#dbe1e6] rounded-2xl p-5 shadow-xs transition-shadow"
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="w-full flex items-center justify-between gap-3 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#edf2f5] text-[#2d3e51] flex items-center justify-center shrink-0 group-hover:bg-[#2d3e51] group-hover:text-white transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif-brand text-base font-bold text-[#2d3e51] group-hover:text-[#2d3e51] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#5d6d7d] mt-0.5">{item.summary}</p>
                  </div>
                </div>

                <div className="p-1 rounded-lg text-[#5d6d7d] group-hover:text-[#2d3e51] transition">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-[#dbe1e6] animate-in fade-in duration-150">
                  {item.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
