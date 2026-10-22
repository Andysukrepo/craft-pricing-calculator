import {
  UnitType,
  PlatformPreset,
  MaterialItem,
  PackagingItem,
  LabourDetails,
  OverheadDetails,
  PostageDetails,
  SellingFeeDetails,
  VatDetails,
  PricingDetails,
  CalculationResult,
  AppSettings
} from '../types/calculator';

export const UNITS: UnitType[] = [
  'each',
  'grams',
  'kilograms',
  'millilitres',
  'litres',
  'metres',
  'centimetres',
  'sheets',
  'packs',
  'rolls',
  'other',
];

export const CATEGORIES = [
  'Handmade jewellery',
  'Candles and wax melts',
  'Resin crafts',
  'Personalised gifts',
  'Printed products',
  'T-shirts and clothing',
  'Mugs and drinkware',
  'Paper crafts and stationery',
  'Crochet and knitting',
  'Woodworking',
  'Home décor',
  'Digital downloads',
  'Other',
];

export const TASK_NAMES = [
  'Making',
  'Setup',
  'Personalisation',
  'Finishing',
  'Quality control',
  'Dispatch preparation',
];

export const PLATFORM_LABELS: Record<PlatformPreset, string> = {
  'custom-selling-platform': 'Custom selling platform',
  'etsy-uk': 'Etsy UK',
  'shopify': 'Shopify',
  'ebay-uk': 'eBay UK',
  'paypal': 'PayPal',
  'other-payment-processor': 'Other payment processor',
  'in-person-craft-fair': 'In-person craft fair',
  'own-website': 'Own website',
};

export const FEE_KEYS: [string, string][] = [
  ['fee-percent', 'Percentage fee (%)'],
  ['fee-order', 'Fixed per order (£)'],
  ['fee-item', 'Fixed per item (£)'],
  ['fee-listing', 'Listing / transaction per item (£)'],
  ['fee-ad-percent', 'Advertising (%)'],
  ['fee-ad-fixed', 'Advertising fixed per sale (£)'],
  ['fee-extra', 'Additional per item (£)'],
];

export const FEE_PRESETS: Record<PlatformPreset, number[]> = {
  'custom-selling-platform': [0, 0, 0, 0, 0, 0, 0],
  'etsy-uk': [6.5, 0.2, 0, 0, 0, 0, 0],
  'shopify': [2, 0.3, 0, 0, 0, 0, 0],
  'ebay-uk': [12.8, 0.3, 0, 0, 0, 0, 0],
  'paypal': [2.9, 0.3, 0, 0, 0, 0, 0],
  'other-payment-processor': [2.5, 0.3, 0, 0, 0, 0, 0],
  'in-person-craft-fair': [0, 0, 0, 0, 0, 0, 0],
  'own-website': [0, 0, 0, 0, 0, 0, 0],
};

export const DEFAULT_SETTINGS: AppSettings = {
  rate: 12,
  margin: 30,
  waste: 5,
  platform: 'etsy-uk',
  postage: 2.85,
  packaging: 0.75,
  vat: false,
  vatRate: 20,
  qty: 10,
  feePct: 6.5,
  feeFixed: 0.2,
};

const UNIT_INFO: Record<UnitType, [string, number]> = {
  each: ['each', 1],
  grams: ['mass', 1],
  kilograms: ['mass', 1000],
  millilitres: ['volume', 1],
  litres: ['volume', 1000],
  metres: ['length', 100],
  centimetres: ['length', 1],
  sheets: ['sheets', 1],
  packs: ['packs', 1],
  rolls: ['rolls', 1],
  other: ['other', 1],
};

export function formatMoney(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatPct(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return (n * 100).toFixed(1) + '%';
}

export function calculateMaterialCost(item: MaterialItem): { unitCost: number; itemCost: number; error?: string } {
  const pack = Number(item.pack);
  const price = Number(item.price);
  const used = Number(item.used);
  const waste = Number(item.waste || 0);

  if (!Number.isFinite(pack) || pack <= 0 || !Number.isFinite(price) || price < 0 || !Number.isFinite(used) || used < 0) {
    return { unitCost: 0, itemCost: 0, error: 'Invalid pack qty or price' };
  }

  const uA = UNIT_INFO[item.unit] || ['other', 1];
  const uB = UNIT_INFO[item.usedUnit] || ['other', 1];

  if (uA[0] !== uB[0]) {
    return {
      unitCost: price / pack,
      itemCost: 0,
      error: `Incompatible units: ${item.unit} and ${item.usedUnit}`,
    };
  }

  const unitCost = price / pack;
  const convertedRatio = uB[1] / uA[1];
  const itemCost = unitCost * used * (1 + waste / 100) * convertedRatio;

  return { unitCost, itemCost };
}

export function calculatePackagingCost(item: PackagingItem): { itemCost: number; unitCost: number } {
  const pack = Number(item.pack);
  const price = Number(item.price);
  const used = Number(item.used);

  if (!Number.isFinite(pack) || pack <= 0 || !Number.isFinite(price) || price < 0 || !Number.isFinite(used) || used < 0) {
    return { itemCost: 0, unitCost: 0 };
  }

  const unitCost = price / pack;
  const itemCost = unitCost * used;
  return { itemCost, unitCost };
}

export function calculatePriceResult(
  price: number,
  params: {
    productionCost: number;
    actualPostage: number;
    extraPostalPackaging: number;
    fulfilment: number;
    recoverableInputVat: number;
    chargedPostage: number;
    freePostage: boolean;
    vatRegistered: boolean;
    vatRate: number; // 0.20
    vatInclusive: boolean;
    feeEnabled: boolean;
    feePostage: boolean;
    feeValues: number[];
    orderCount: number;
  }
) {
  const postageIncome = params.freePostage ? 0 : params.chargedPostage;
  const gross = price + postageIncome;

  const netItem = params.vatRegistered && params.vatInclusive
    ? price / (1 + params.vatRate)
    : price;

  const outputVAT = params.vatRegistered && params.vatInclusive
    ? price - netItem
    : params.vatRegistered
      ? price * params.vatRate
      : 0;

  const feeBase = price + (params.feePostage ? postageIncome : 0);
  const pctFeeRate = ((params.feeValues[0] || 0) + (params.feeValues[4] || 0)) / 100;
  const fixedPerItemFees = (params.feeValues[2] || 0) + (params.feeValues[3] || 0) + (params.feeValues[5] || 0) + (params.feeValues[6] || 0);
  const fixedOrderShare = (params.feeValues[1] || 0) / Math.max(1, params.orderCount);

  const fees = params.feeEnabled
    ? (feeBase * pctFeeRate) + fixedOrderShare + fixedPerItemFees
    : 0;

  const revenue = netItem + postageIncome;
  const totalCost = params.productionCost + params.actualPostage + params.extraPostalPackaging + params.fulfilment - params.recoverableInputVat + fees;
  const profit = revenue - totalCost;

  return {
    price,
    gross,
    netItem,
    outputVAT,
    postageIncome,
    fees,
    revenue,
    totalCost,
    profit,
    margin: revenue > 0 ? profit / revenue : null,
    markup: totalCost > 0 ? profit / totalCost : null,
  };
}

export function calculateTargetPrice(
  margin: number, // 0.30
  params: {
    productionCost: number;
    actualPostage: number;
    extraPostalPackaging: number;
    fulfilment: number;
    recoverableInputVat: number;
    chargedPostage: number;
    freePostage: boolean;
    vatRegistered: boolean;
    vatRate: number;
    vatInclusive: boolean;
    feeEnabled: boolean;
    feePostage: boolean;
    feeValues: number[];
    orderCount: number;
  }
): number {
  const netFactor = params.vatRegistered && params.vatInclusive ? 1 / (1 + params.vatRate) : 1;
  const pctFeeRate = params.feeEnabled ? ((params.feeValues[0] || 0) + (params.feeValues[4] || 0)) / 100 : 0;
  const postageIncome = params.freePostage ? 0 : params.chargedPostage;

  const fixedPerItemFees = (params.feeValues[2] || 0) + (params.feeValues[3] || 0) + (params.feeValues[5] || 0) + (params.feeValues[6] || 0);
  const fixedOrderShare = (params.feeValues[1] || 0) / Math.max(1, params.orderCount);
  const fixedPostageFee = params.feePostage ? postageIncome * pctFeeRate : 0;

  const totalFixedCosts = params.productionCost + params.actualPostage + params.extraPostalPackaging + params.fulfilment - params.recoverableInputVat - postageIncome + (params.feeEnabled ? fixedOrderShare + fixedPerItemFees + fixedPostageFee : 0);

  const denominator = netFactor - pctFeeRate - margin * netFactor;
  if (denominator <= 0) {
    return 0;
  }
  return Math.max(0, totalFixedCosts / denominator);
}

export function calculateMarkupPrice(
  markup: number, // 0.50
  params: {
    productionCost: number;
    actualPostage: number;
    extraPostalPackaging: number;
    fulfilment: number;
    recoverableInputVat: number;
    chargedPostage: number;
    freePostage: boolean;
    vatRegistered: boolean;
    vatRate: number;
    vatInclusive: boolean;
    feeEnabled: boolean;
    feePostage: boolean;
    feeValues: number[];
    orderCount: number;
  }
): number {
  const baseCosts = params.productionCost + params.actualPostage + params.extraPostalPackaging + params.fulfilment - params.recoverableInputVat;
  const netFactor = params.vatRegistered && params.vatInclusive ? 1 / (1 + params.vatRate) : 1;
  const pctFeeRate = params.feeEnabled ? ((params.feeValues[0] || 0) + (params.feeValues[4] || 0)) / 100 : 0;
  const postageIncome = params.freePostage ? 0 : params.chargedPostage;

  const fixedPerItemFees = (params.feeValues[2] || 0) + (params.feeValues[3] || 0) + (params.feeValues[5] || 0) + (params.feeValues[6] || 0);
  const fixedOrderShare = (params.feeValues[1] || 0) / Math.max(1, params.orderCount);
  const fixedPostageFee = params.feePostage ? postageIncome * pctFeeRate : 0;
  const fixedFees = params.feeEnabled ? fixedOrderShare + fixedPerItemFees + fixedPostageFee : 0;

  const denom = netFactor - pctFeeRate;
  if (denom <= 0) return 0;

  return Math.max(0, (baseCosts * (1 + markup) + fixedFees - postageIncome) / denom);
}

export function performFullCalculation(
  batchQuantity: number,
  materials: MaterialItem[],
  packaging: PackagingItem[],
  labour: LabourDetails,
  overheads: OverheadDetails,
  postage: PostageDetails,
  fees: SellingFeeDetails,
  vat: VatDetails,
  pricing: PricingDetails
): CalculationResult {
  const warnings: string[] = [];

  // Materials cost
  let materialsCost = 0;
  materials.forEach((m) => {
    const res = calculateMaterialCost(m);
    if (res.error) warnings.push(res.error);
    materialsCost += res.itemCost;
  });

  // Packaging cost
  let packagingCost = 0;
  packaging.forEach((p) => {
    packagingCost += calculatePackagingCost(p).itemCost;
  });

  // Check duplicate material and packaging names
  const matNames = materials.map((m) => m.name.trim().toLowerCase()).filter(Boolean);
  const packNames = packaging.map((p) => p.name.trim().toLowerCase()).filter(Boolean);
  if (matNames.some((n) => packNames.includes(n))) {
    warnings.push('A packaging item also appears in Materials. Check for double-counting.');
  }

  // Labour cost
  const totalMinutes = labour.useSingleTime
    ? Number(labour.totalMinutes || 0)
    : labour.taskMinutes.reduce((sum, val) => sum + (Number(val) || 0), 0);
  const labourCost = (Number(labour.rate || 0) * totalMinutes) / 60;

  // Overheads
  const overheadCost = overheads.excludeOverhead
    ? 0
    : Number(overheads.fixedPerItem || 0) +
      Number(overheads.totalToAllocate || 0) / Math.max(1, Number(overheads.allocationQuantity || 1));

  if (overheads.excludeOverhead) {
    warnings.push('Overheads are excluded; estimated profitability may be overstated.');
  }

  const productionCost = materialsCost + labourCost + packagingCost + overheadCost;
  const batchProductionCost = productionCost * Math.max(1, Number(batchQuantity || 1));

  if (productionCost === 0) {
    warnings.push('No production costs entered yet. Check that assumptions are complete.');
  }

  const vatRateDecimal = Number(vat.vatRate || 20) / 100;
  const targetMarginDecimal = Number(pricing.targetMargin || 30) / 100;
  const targetMarkupDecimal = Number(pricing.targetMarkup || 50) / 100;

  const calculationParams = {
    productionCost,
    actualPostage: Number(postage.actualPaid || 0),
    extraPostalPackaging: Number(postage.extraPackaging || 0),
    fulfilment: Number(postage.otherFulfilment || 0),
    recoverableInputVat: Number(vat.recoverableInputVat || 0),
    chargedPostage: Number(postage.chargedToCustomer || 0),
    freePostage: Boolean(postage.freeCustomerPostage),
    vatRegistered: Boolean(vat.vatRegistered),
    vatRate: vatRateDecimal,
    vatInclusive: Boolean(vat.vatInclusive),
    feeEnabled: Boolean(fees.feeEnabled),
    feePostage: Boolean(fees.feesApplyToPostage),
    feeValues: fees.feeValues,
    orderCount: Math.max(1, Number(fees.itemsPerOrder || 1)),
  };

  const recommendedPrice = calculateTargetPrice(targetMarginDecimal, calculationParams);
  const breakevenBeforeFees = productionCost;
  const breakevenAfterFees = calculateTargetPrice(0, calculationParams);

  let activeSellingPrice = Number(pricing.sellingPrice || 0);
  if (pricing.mode === 'margin') {
    activeSellingPrice = recommendedPrice;
  } else if (pricing.mode === 'markup') {
    activeSellingPrice = calculateMarkupPrice(targetMarkupDecimal, calculationParams);
  }

  const mainResult = calculatePriceResult(activeSellingPrice, calculationParams);

  if (activeSellingPrice < breakevenAfterFees - 0.005) {
    warnings.push('You may be making a loss at this price. Estimated costs exceed revenue.');
  } else if (mainResult.margin !== null && mainResult.margin < targetMarginDecimal - 0.0001) {
    warnings.push('This price covers costs, but does not meet your target profit margin.');
  }

  // Discounted scenario
  const discountRate = Number(pricing.discount || 0) / 100;
  const discountedSellingPrice = activeSellingPrice * (1 - discountRate);
  const discountedResult = calculatePriceResult(discountedSellingPrice, calculationParams);

  // Fee breakdown by category
  const pctFeeRate = ((fees.feeValues[0] || 0) + (fees.feeValues[4] || 0)) / 100;
  const postageIncome = postage.freeCustomerPostage ? 0 : Number(postage.chargedToCustomer || 0);
  const feeBase = activeSellingPrice + (fees.feesApplyToPostage ? postageIncome : 0);
  const orderCount = Math.max(1, Number(fees.itemsPerOrder || 1));

  const feeBreakdown = {
    percentage: fees.feeEnabled ? feeBase * (Number(fees.feeValues[0] || 0) / 100) * orderCount : 0,
    orderFixed: fees.feeEnabled ? Number(fees.feeValues[1] || 0) : 0,
    itemFixed: fees.feeEnabled ? Number(fees.feeValues[2] || 0) * orderCount : 0,
    listing: fees.feeEnabled ? Number(fees.feeValues[3] || 0) * orderCount : 0,
    advertising: fees.feeEnabled ? (activeSellingPrice * (Number(fees.feeValues[4] || 0) / 100) + Number(fees.feeValues[5] || 0)) * orderCount : 0,
    additional: fees.feeEnabled ? Number(fees.feeValues[6] || 0) * orderCount : 0,
  };

  return {
    materialsCost,
    labourCost,
    packagingCost,
    overheadCost,
    productionCost,
    batchProductionCost,
    sellerPostage: Number(postage.actualPaid || 0),
    extraPostalPackaging: Number(postage.extraPackaging || 0),
    fulfilmentCost: Number(postage.otherFulfilment || 0),
    recoverableInputVat: Number(vat.recoverableInputVat || 0),
    sellingPrice: activeSellingPrice,
    customerPostageIncome: mainResult.postageIncome,
    outputVAT: mainResult.outputVAT,
    netItemRevenue: mainResult.netItem,
    netSalesRevenue: mainResult.revenue,
    fees: mainResult.fees,
    totalCostPerSale: mainResult.totalCost,
    profit: mainResult.profit,
    margin: mainResult.margin,
    markup: mainResult.markup,
    recommendedPrice,
    breakevenBeforeFees,
    breakevenAfterFees,
    discountedPrice: discountedResult.price,
    discountedFees: discountedResult.fees,
    discountedProfit: discountedResult.profit,
    feeBreakdown,
    warnings,
  };
}
