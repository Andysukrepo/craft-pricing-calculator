export type UnitType = 
  | 'each' 
  | 'grams' 
  | 'kilograms' 
  | 'millilitres' 
  | 'litres' 
  | 'metres' 
  | 'centimetres' 
  | 'sheets' 
  | 'packs' 
  | 'rolls' 
  | 'other';

export type PricingMode = 'price' | 'margin' | 'markup';

export type PlatformPreset = 
  | 'custom-selling-platform' 
  | 'etsy-uk' 
  | 'shopify' 
  | 'ebay-uk' 
  | 'paypal' 
  | 'other-payment-processor' 
  | 'in-person-craft-fair' 
  | 'own-website';

export interface MaterialItem {
  id: string;
  name: string;
  supplier: string;
  pack: number;
  unit: UnitType;
  price: number;
  used: number;
  usedUnit: UnitType;
  waste: number;
  link?: string;
}

export interface PackagingItem {
  id: string;
  name: string;
  pack: number;
  price: number;
  used: number;
}

export interface ProductDetails {
  name: string;
  category: string;
  customCategory: string;
  sku: string;
  batch: number;
  description: string;
  notes: string;
}

export interface LabourDetails {
  rate: number;
  useSingleTime: boolean;
  totalMinutes: number;
  taskMinutes: number[]; // 6 tasks: Making, Setup, Personalisation, Finishing, Quality control, Dispatch preparation
}

export interface OverheadDetails {
  fixedPerItem: number;
  totalToAllocate: number;
  allocationQuantity: number;
  excludeOverhead: boolean;
}

export interface PostageDetails {
  actualPaid: number;
  extraPackaging: number;
  otherFulfilment: number;
  chargedToCustomer: number;
  freeCustomerPostage: boolean;
}

export interface SellingFeeDetails {
  platform: PlatformPreset;
  itemsPerOrder: number;
  feeEnabled: boolean;
  feesApplyToPostage: boolean;
  // 7 fee values: [percent, orderFixed, itemFixed, listingFee, adPercent, adFixed, additional]
  feeValues: number[];
}

export interface VatDetails {
  vatRegistered: boolean;
  vatRate: number; // e.g. 20
  vatInclusive: boolean;
  recoverableInputVat: number;
}

export interface PricingDetails {
  mode: PricingMode;
  sellingPrice: number;
  targetMargin: number; // e.g. 30 (%)
  targetMarkup: number; // e.g. 50 (%)
  discount: number; // e.g. 0 (%)
}

export interface BulkDetails {
  orderQuantity: number;
  discount: number;
  wholesaleTargetMargin: number;
  extraPackagingPerItem: number;
  minutesSavedPerItem: number;
}

export interface SavedProduct {
  __backendId: string;
  name: string;
  category: string;
  customCategory?: string;
  sku: string;
  batch_quantity: number;
  description: string;
  notes: string;
  materials: MaterialItem[];
  packaging: PackagingItem[];
  labour: LabourDetails;
  overheads: OverheadDetails;
  postage: PostageDetails;
  fees: SellingFeeDetails;
  vat: VatDetails;
  pricing: PricingDetails;
  bulk: BulkDetails;
  production_cost: number;
  selling_price: number;
  total_fees: number;
  profit_per_item: number;
  profit_margin: number;
  markup: number;
  updated_at: string;
}

export interface LibraryMaterial {
  __backendId: string;
  name: string;
  supplier: string;
  pack: number;
  unit: UnitType;
  price: number;
  notes: string;
  updated_at: string;
}

export interface AppSettings {
  rate: number;
  margin: number;
  waste: number;
  platform: PlatformPreset;
  postage: number;
  packaging: number;
  vat: boolean;
  vatRate: number;
  qty: number;
  feePct: number;
  feeFixed: number;
}

export interface CalculationResult {
  materialsCost: number;
  labourCost: number;
  packagingCost: number;
  overheadCost: number;
  productionCost: number;
  batchProductionCost: number;
  sellerPostage: number;
  extraPostalPackaging: number;
  fulfilmentCost: number;
  recoverableInputVat: number;
  sellingPrice: number;
  customerPostageIncome: number;
  outputVAT: number;
  netItemRevenue: number;
  netSalesRevenue: number;
  fees: number;
  totalCostPerSale: number;
  profit: number;
  margin: number | null;
  markup: number | null;
  recommendedPrice: number;
  breakevenBeforeFees: number;
  breakevenAfterFees: number;
  discountedPrice: number;
  discountedFees: number;
  discountedProfit: number;
  feeBreakdown: {
    percentage: number;
    orderFixed: number;
    itemFixed: number;
    listing: number;
    advertising: number;
    additional: number;
  };
  warnings: string[];
}
