import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
  tip: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-product-details',
    title: '1. Product Specifications',
    description: 'Name your make, pick a craft category, and set your batch quantity. The calculator will figure out both your single-item and full batch production costs.',
    tip: '💡 Tip: Always batch similar tasks together to save time.',
  },
  {
    targetId: 'tour-materials',
    title: '2. Raw Materials & Waste Allowance',
    description: 'Enter your bulk purchase pack quantity and the exact portion used per finished item. Add a waste allowance (5%–10%) to account for offcuts, trims, and spills.',
    tip: '💡 Tip: Click "Save to Library" on any material row so you can instantly reuse its unit cost in future products!',
  },
  {
    targetId: 'tour-labour',
    title: '3. Maker Labour & Wages',
    description: 'Pay yourself a real wage. Enter your target hourly rate (£/hr) and your making minutes. You can enter a single total time or break it down into making, finishing, and dispatch.',
    tip: '💡 Tip: Unpaid maker time is the #1 reason handmade businesses struggle to grow.',
  },
  {
    targetId: 'tour-fees',
    title: '4. Marketplace Fees & Presets',
    description: 'Pick a preset like Etsy UK, Shopify, or In-person craft fair. The calculator splits fixed order fees across items and applies percentage fees to item price plus customer postage.',
    tip: '💡 Tip: You can customize any individual fee percentage or fixed fee to match your specific shop setup.',
  },
  {
    targetId: 'tour-pricing',
    title: '5. Pricing Strategy & Margins',
    description: 'Choose whether you want to test your own selling price, or let the calculator reverse-engineer the required price based on your target profit margin (e.g. 30% or 50%).',
    tip: '💡 Tip: Margin is profit ÷ revenue. A £5 cost sold for £10 gives a 50% margin and a 100% markup.',
  },
  {
    targetId: 'tour-breakdown',
    title: '6. Live Breakdown & Export',
    description: 'Review your estimated profit per item, batch earnings, and break-even points. If your price drops below costs, an alert warns you immediately. You can export a CSV or print a cost sheet.',
    tip: '💡 Tip: Click "Save Product" at the top to save this calculation to "My Products" anytime.',
  },
];

interface InteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const InteractiveTour: React.FC<InteractiveTourProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const step = TOUR_STEPS[currentStepIndex];

  // Scroll to target element whenever step changes
  useEffect(() => {
    if (!isOpen) return;

    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-[#2d3e51]', 'ring-offset-4', 'transition-all', 'duration-300');

      return () => {
        el.classList.remove('ring-4', 'ring-[#2d3e51]', 'ring-offset-4');
      };
    }
  }, [currentStepIndex, isOpen, step.targetId]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <>
      {/* Dimmed background overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      {/* Floating Tour Modal Card (Anchored bottom on mobile, bottom-right on desktop) */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 bg-[#ffffff] border-2 border-[#2d3e51] rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#dbe1e6]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#2d3e51] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2d3e51]">
                Interactive Tour
              </span>
              <span className="text-xs text-[#5d6d7d] font-semibold ml-2">
                Step {currentStepIndex + 1} of {TOUR_STEPS.length}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
            aria-label="Close tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Content */}
        <div className="mt-3.5 space-y-2.5">
          <h4 className="font-serif-brand font-bold text-base text-[#2d3e51]">
            {step.title}
          </h4>
          <p className="text-xs text-[#2d3e51] leading-relaxed">
            {step.description}
          </p>

          <div className="bg-[#edf2f5] border border-[#dbe1e6] rounded-xl p-2.5 text-[11px] font-medium text-[#2d3e51]">
            {step.tip}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-4 pt-3 border-t border-[#dbe1e6] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[#5d6d7d] hover:text-[#2d3e51] transition"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl border border-[#dbe1e6] hover:bg-zinc-100 text-xs font-bold text-[#2d3e51] transition flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl bg-[#2d3e51] hover:bg-[#34495d] active:bg-[#1f2d3d] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
              {currentStepIndex === TOUR_STEPS.length - 1 ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
