import { SavedProduct, LibraryMaterial, AppSettings } from '../types/calculator';
import { DEFAULT_SETTINGS } from './calculator';

const STORAGE_KEY_PRODUCTS = 'this_man_makes_products';
const STORAGE_KEY_LIBRARY = 'this_man_makes_library';
const STORAGE_KEY_SETTINGS = 'this_man_makes_settings';

export const SAMPLE_LIBRARY: LibraryMaterial[] = [
  {
    __backendId: 'lib-1',
    name: 'Soy Wax flakes (Golden Wax 464)',
    supplier: 'Supplies For Candles UK',
    pack: 1000,
    unit: 'grams',
    price: 6.95,
    notes: 'Clean burning 100% natural soy wax flakes',
    updated_at: new Date().toISOString(),
  },
  {
    __backendId: 'lib-2',
    name: 'Cotton Wick TCR 30/18 (pack of 50)',
    supplier: 'Candle Shack',
    pack: 50,
    unit: 'each',
    price: 4.5,
    notes: 'Pre-waxed cotton wicks with sustainer tabs',
    updated_at: new Date().toISOString(),
  },
  {
    __backendId: 'lib-3',
    name: 'Lavender & Wild Herb Fragrance Oil',
    supplier: 'Craftovator UK',
    pack: 100,
    unit: 'millilitres',
    price: 5.8,
    notes: 'IFRA certified 10% maximum load',
    updated_at: new Date().toISOString(),
  },
  {
    __backendId: 'lib-4',
    name: 'Amber Glass Jar 180ml with Aluminium Lid',
    supplier: 'Ampulla Packaging',
    pack: 24,
    unit: 'each',
    price: 18.24,
    notes: 'Recyclable cosmetic grade amber jar',
    updated_at: new Date().toISOString(),
  },
  {
    __backendId: 'lib-5',
    name: 'Recycled Kraft Mailing Box Small',
    supplier: 'Kite Packaging',
    pack: 50,
    unit: 'each',
    price: 16.5,
    notes: 'Royal Mail Large Letter compatible',
    updated_at: new Date().toISOString(),
  },
];

export const SAMPLE_PRODUCTS: SavedProduct[] = [
  {
    __backendId: 'prod-1',
    name: 'Hand-poured Lavender Soy Candle (180ml)',
    category: 'Candles and wax melts',
    sku: 'CAN-LAV-180',
    batch_quantity: 12,
    description: 'Artisan hand-poured 100% soy wax candle in amber glass with pure lavender essential oil.',
    notes: 'Burn time approx 35 hours. Cure time 7 days before dispatch.',
    materials: [
      {
        id: 'm-1',
        name: 'Soy Wax flakes (Golden Wax 464)',
        supplier: 'Supplies For Candles UK',
        pack: 1000,
        unit: 'grams',
        price: 6.95,
        used: 150,
        usedUnit: 'grams',
        waste: 5,
      },
      {
        id: 'm-2',
        name: 'Cotton Wick TCR 30/18',
        supplier: 'Candle Shack',
        pack: 50,
        unit: 'each',
        price: 4.5,
        used: 1,
        usedUnit: 'each',
        waste: 2,
      },
      {
        id: 'm-3',
        name: 'Lavender & Wild Herb Fragrance Oil',
        supplier: 'Craftovator UK',
        pack: 100,
        unit: 'millilitres',
        price: 5.8,
        used: 12,
        usedUnit: 'millilitres',
        waste: 3,
      },
      {
        id: 'm-4',
        name: 'Amber Glass Jar 180ml with Aluminium Lid',
        supplier: 'Ampulla Packaging',
        pack: 24,
        unit: 'each',
        price: 18.24,
        used: 1,
        usedUnit: 'each',
        waste: 0,
      },
    ],
    packaging: [
      {
        id: 'p-1',
        name: 'Recycled Kraft Gift Box & Tissue',
        pack: 25,
        price: 12.5,
        used: 1,
      },
      {
        id: 'p-2',
        name: 'Product Label & CLP Warning Sticker',
        pack: 100,
        price: 14.0,
        used: 2,
      },
    ],
    labour: {
      rate: 14,
      useSingleTime: false,
      totalMinutes: 18,
      taskMinutes: [10, 2, 2, 2, 1, 1], // Making, Setup, Personalisation, Finishing, QC, Dispatch
    },
    overheads: {
      fixedPerItem: 0.45,
      totalToAllocate: 60,
      allocationQuantity: 100,
      excludeOverhead: false,
    },
    postage: {
      actualPaid: 3.35,
      extraPackaging: 0.4,
      otherFulfilment: 0,
      chargedToCustomer: 3.95,
      freeCustomerPostage: false,
    },
    fees: {
      platform: 'etsy-uk',
      itemsPerOrder: 1,
      feeEnabled: true,
      feesApplyToPostage: true,
      feeValues: [6.5, 0.2, 0, 0, 0, 0, 0],
    },
    vat: {
      vatRegistered: false,
      vatRate: 20,
      vatInclusive: true,
      recoverableInputVat: 0,
    },
    pricing: {
      mode: 'price',
      sellingPrice: 16.0,
      targetMargin: 35,
      targetMarkup: 65,
      discount: 10,
    },
    bulk: {
      orderQuantity: 20,
      discount: 25,
      wholesaleTargetMargin: 25,
      extraPackagingPerItem: 0.2,
      minutesSavedPerItem: 4,
    },
    production_cost: 8.78,
    selling_price: 16.0,
    total_fees: 1.5,
    profit_per_item: 6.32,
    profit_margin: 0.317,
    markup: 0.465,
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Could not read settings from localStorage', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Could not save settings to localStorage', err);
  }
}

export function getStoredProducts(): SavedProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read products from localStorage', err);
  }
  // Initialize with sample
  saveStoredProducts(SAMPLE_PRODUCTS);
  return SAMPLE_PRODUCTS;
}

export function saveStoredProducts(products: SavedProduct[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  } catch (err) {
    console.error('Could not save products to localStorage', err);
  }
}

export function getStoredLibrary(): LibraryMaterial[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIBRARY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read library from localStorage', err);
  }
  saveStoredLibrary(SAMPLE_LIBRARY);
  return SAMPLE_LIBRARY;
}

export function saveStoredLibrary(library: LibraryMaterial[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LIBRARY, JSON.stringify(library));
  } catch (err) {
    console.error('Could not save library to localStorage', err);
  }
}
