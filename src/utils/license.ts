/**
 * Payhip License Verification & Freemium Limits Manager
 * Supports:
 * - Immediate offline test keys ('PRO', 'TEST-PRO', 'DEMO-PRO', 'TMM-PRO')
 * - Payhip license key formats
 * - URL query parameter auto-activation (?license=KEY or ?key=KEY)
 * - Cross-app sync with This Man Makes ecosystem (tmm_license_key, tmm_is_pro)
 */

export const FREE_LIMITS = {
  maxProducts: 2,
  maxLibraryMaterials: 5,
} as const;

export const TEST_KEYS = ['PRO', 'TEST-PRO', 'PAYHIP-PRO', 'DEMO-PRO', 'TMM-PRO', 'ANDY-PRO'];

export const DEFAULT_PAYHIP_URL = 'https://thismanmakes.co.uk/';

const STORAGE_KEY_LICENSE = 'tmm_craft_calculator_license';
const STORAGE_KEY_IS_PRO = 'tmm_craft_calculator_is_pro';
const STORAGE_KEY_PAYHIP_URL = 'tmm_craft_calculator_payhip_url';

// Shared fallbacks for domain-wide TMM apps (e.g., calendar.thismanmakes.co.uk)
const ECOSYSTEM_KEY_LICENSE = 'tmm_license_key';
const ECOSYSTEM_KEY_IS_PRO = 'tmm_is_pro';

/**
 * Validates a license key.
 * Allows test keys or standard Payhip format (alphanumeric with dashes or 8+ characters).
 */
export function isValidLicenseKey(rawKey: string): boolean {
  if (!rawKey || typeof rawKey !== 'string') return false;
  const cleaned = rawKey.trim().toUpperCase();

  if (cleaned.length === 0) return false;

  // Check test keys
  if (TEST_KEYS.includes(cleaned)) {
    return true;
  }

  // Payhip standard format: e.g. "XXXX-XXXX-XXXX-XXXX" or 8+ alphanumeric characters
  const alphanumericOnly = cleaned.replace(/[^A-Z0-9]/g, '');
  if (alphanumericOnly.length >= 8) {
    return true;
  }

  return false;
}

/**
 * Retrieves the stored license status and key.
 */
export function getStoredLicense(): { isPro: boolean; licenseKey: string; payhipUrl: string } {
  try {
    const directPro = localStorage.getItem(STORAGE_KEY_IS_PRO);
    const directKey = localStorage.getItem(STORAGE_KEY_LICENSE) || '';
    const ecoPro = localStorage.getItem(ECOSYSTEM_KEY_IS_PRO);
    const ecoKey = localStorage.getItem(ECOSYSTEM_KEY_LICENSE) || '';
    const customUrl = localStorage.getItem(STORAGE_KEY_PAYHIP_URL) || DEFAULT_PAYHIP_URL;

    const licenseKey = directKey || ecoKey;
    const isPro = directPro === 'true' || ecoPro === 'true' || isValidLicenseKey(licenseKey);

    return {
      isPro,
      licenseKey,
      payhipUrl: customUrl,
    };
  } catch (e) {
    console.warn('Unable to access localStorage for license verification:', e);
    return {
      isPro: false,
      licenseKey: '',
      payhipUrl: DEFAULT_PAYHIP_URL,
    };
  }
}

/**
 * Saves and activates a license key.
 */
export function saveLicense(rawKey: string): boolean {
  if (!isValidLicenseKey(rawKey)) {
    return false;
  }

  const cleaned = rawKey.trim().toUpperCase();

  try {
    localStorage.setItem(STORAGE_KEY_LICENSE, cleaned);
    localStorage.setItem(STORAGE_KEY_IS_PRO, 'true');
    // Sync with ecosystem keys
    localStorage.setItem(ECOSYSTEM_KEY_LICENSE, cleaned);
    localStorage.setItem(ECOSYSTEM_KEY_IS_PRO, 'true');
    return true;
  } catch (e) {
    console.error('Failed to save license in localStorage:', e);
    return false;
  }
}

/**
 * Deactivates and removes the current license key.
 */
export function removeLicense(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_LICENSE);
    localStorage.removeItem(STORAGE_KEY_IS_PRO);
    localStorage.removeItem(ECOSYSTEM_KEY_LICENSE);
    localStorage.removeItem(ECOSYSTEM_KEY_IS_PRO);
  } catch (e) {
    console.warn('Failed to remove license from localStorage:', e);
  }
}

/**
 * Saves a custom Payhip checkout product URL.
 */
export function savePayhipUrl(url: string): void {
  try {
    if (url && url.trim()) {
      localStorage.setItem(STORAGE_KEY_PAYHIP_URL, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_PAYHIP_URL);
    }
  } catch (e) {
    console.warn('Failed to save Payhip URL:', e);
  }
}

/**
 * Checks URL query params for ?license= or ?key= on mount.
 * If present and valid, activates license and cleans URL query string.
 */
export function checkUrlForLicense(): { activated: boolean; key?: string } {
  try {
    if (typeof window === 'undefined' || !window.location.search) {
      return { activated: false };
    }

    const params = new URLSearchParams(window.location.search);
    const candidate = params.get('license') || params.get('key') || params.get('payhip_license');

    if (candidate && isValidLicenseKey(candidate)) {
      const saved = saveLicense(candidate);
      if (saved) {
        // Clean query params from URL without refreshing the page
        params.delete('license');
        params.delete('key');
        params.delete('payhip_license');
        const newSearch = params.toString();
        const newUrl =
          window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);

        return { activated: true, key: candidate.trim().toUpperCase() };
      }
    }
  } catch (e) {
    console.warn('Failed checking URL for license query parameters:', e);
  }

  return { activated: false };
}

/**
 * Masks a license key for safe display in settings.
 */
export function maskLicenseKey(key: string): string {
  if (!key) return '';
  const trimmed = key.trim();
  if (TEST_KEYS.includes(trimmed.toUpperCase())) {
    return `${trimmed.toUpperCase()} (Test License)`;
  }
  if (trimmed.length <= 8) {
    return trimmed;
  }
  const start = trimmed.slice(0, 4);
  const end = trimmed.slice(-4);
  return `${start}-••••-••••-${end}`;
}
