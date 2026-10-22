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
export const TRIAL_KEYS = ['TESTER', 'TRIAL', 'BETA-3DAY', 'TESTER-3DAY', 'TRIAL-3DAY', 'TEST-3DAY', 'BETA'];

export const DEFAULT_PAYHIP_URL = 'https://thismanmakes.co.uk/';

const STORAGE_KEY_LICENSE = 'tmm_craft_calculator_license';
const STORAGE_KEY_IS_PRO = 'tmm_craft_calculator_is_pro';
const STORAGE_KEY_PAYHIP_URL = 'tmm_craft_calculator_payhip_url';
const STORAGE_KEY_TRIAL_EXPIRES = 'tmm_craft_calculator_trial_expires';

// Shared fallbacks for domain-wide TMM apps (e.g., calendar.thismanmakes.co.uk)
const ECOSYSTEM_KEY_LICENSE = 'tmm_license_key';
const ECOSYSTEM_KEY_IS_PRO = 'tmm_is_pro';

export interface StoredLicenseInfo {
  isPro: boolean;
  licenseKey: string;
  payhipUrl: string;
  isTrial: boolean;
  trialExpiresAt?: number | null;
  trialRemainingText?: string;
}

/**
 * Checks whether a key is a 3-day tester trial key.
 */
export function isTrialKey(rawKey: string): boolean {
  if (!rawKey || typeof rawKey !== 'string') return false;
  const cleaned = rawKey.trim().toUpperCase();
  return TRIAL_KEYS.includes(cleaned);
}

/**
 * Validates a license key.
 * Allows permanent test keys, 3-day trial keys, or standard Payhip format (alphanumeric with dashes or 8+ characters).
 */
export function isValidLicenseKey(rawKey: string): boolean {
  if (!rawKey || typeof rawKey !== 'string') return false;
  const cleaned = rawKey.trim().toUpperCase();

  if (cleaned.length === 0) return false;

  // Check permanent test keys or 3-day trial keys
  if (TEST_KEYS.includes(cleaned) || TRIAL_KEYS.includes(cleaned)) {
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
 * Formats remaining trial time as human readable string.
 */
export function formatTrialRemaining(expiresAt: number): string {
  const diffMs = expiresAt - Date.now();
  if (diffMs <= 0) return 'Expired';

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m left`;
}

/**
 * Retrieves the stored license status and key, validating trial expiration if applicable.
 */
export function getStoredLicense(): StoredLicenseInfo {
  try {
    const directPro = localStorage.getItem(STORAGE_KEY_IS_PRO);
    const directKey = localStorage.getItem(STORAGE_KEY_LICENSE) || '';
    const ecoPro = localStorage.getItem(ECOSYSTEM_KEY_IS_PRO);
    const ecoKey = localStorage.getItem(ECOSYSTEM_KEY_LICENSE) || '';
    const customUrl = localStorage.getItem(STORAGE_KEY_PAYHIP_URL) || DEFAULT_PAYHIP_URL;
    const trialExpiresStr = localStorage.getItem(STORAGE_KEY_TRIAL_EXPIRES);

    const licenseKey = directKey || ecoKey;
    const isTrial = isTrialKey(licenseKey) || (!!trialExpiresStr && trialExpiresStr !== 'permanent');
    let trialExpiresAt: number | null = null;
    let trialRemainingText: string | undefined;

    if (isTrial && trialExpiresStr) {
      trialExpiresAt = parseInt(trialExpiresStr, 10);
      if (!isNaN(trialExpiresAt)) {
        if (Date.now() > trialExpiresAt) {
          // Trial has expired! Revert to free plan
          removeLicense();
          return {
            isPro: false,
            licenseKey: '',
            payhipUrl: customUrl,
            isTrial: true,
            trialExpiresAt,
            trialRemainingText: 'Expired',
          };
        }
        trialRemainingText = formatTrialRemaining(trialExpiresAt);
      }
    }

    const isPro = directPro === 'true' || ecoPro === 'true' || isValidLicenseKey(licenseKey);

    return {
      isPro,
      licenseKey,
      payhipUrl: customUrl,
      isTrial,
      trialExpiresAt,
      trialRemainingText,
    };
  } catch (e) {
    console.warn('Unable to access localStorage for license verification:', e);
    return {
      isPro: false,
      licenseKey: '',
      payhipUrl: DEFAULT_PAYHIP_URL,
      isTrial: false,
    };
  }
}

/**
 * Saves and activates a license key.
 * If trial key or days specified, sets a 3-day (or custom days) expiration timestamp.
 */
export function saveLicense(rawKey: string, customDays?: number): boolean {
  if (!isValidLicenseKey(rawKey)) {
    return false;
  }

  const cleaned = rawKey.trim().toUpperCase();
  const isTrial = isTrialKey(cleaned) || (typeof customDays === 'number' && customDays > 0);

  try {
    localStorage.setItem(STORAGE_KEY_LICENSE, cleaned);
    localStorage.setItem(STORAGE_KEY_IS_PRO, 'true');
    // Sync with ecosystem keys
    localStorage.setItem(ECOSYSTEM_KEY_LICENSE, cleaned);
    localStorage.setItem(ECOSYSTEM_KEY_IS_PRO, 'true');

    if (isTrial) {
      const days = customDays && customDays > 0 ? customDays : 3;
      const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY_TRIAL_EXPIRES, expiresAt.toString());
    } else {
      localStorage.removeItem(STORAGE_KEY_TRIAL_EXPIRES);
    }

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
    localStorage.removeItem(STORAGE_KEY_TRIAL_EXPIRES);
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
 * Checks URL query params for ?license=, ?key=, ?trial=, or ?tester= on mount.
 * If present and valid, activates license and cleans URL query string.
 * Supports:
 * - ?trial=3 or ?tester=3 (activates 3-day trial)
 * - ?license=KEY or ?key=KEY
 */
export function checkUrlForLicense(): { activated: boolean; key?: string; isTrial?: boolean } {
  try {
    if (typeof window === 'undefined' || !window.location.search) {
      return { activated: false };
    }

    const params = new URLSearchParams(window.location.search);
    const candidate = params.get('license') || params.get('key') || params.get('payhip_license');
    const trialParam = params.get('trial') || params.get('tester');

    // Check for trial parameter: e.g. ?trial=3 or ?tester=true
    if (trialParam) {
      const parsedDays = parseInt(trialParam, 10);
      const days = !isNaN(parsedDays) && parsedDays > 0 ? parsedDays : 3;
      const trialKey = `TESTER-${days}DAY`;
      const saved = saveLicense(trialKey, days);
      if (saved) {
        params.delete('trial');
        params.delete('tester');
        const newSearch = params.toString();
        const newUrl =
          window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
        return { activated: true, key: trialKey, isTrial: true };
      }
    }

    if (candidate && isValidLicenseKey(candidate)) {
      const isTrial = isTrialKey(candidate);
      const saved = saveLicense(candidate, isTrial ? 3 : undefined);
      if (saved) {
        // Clean query params from URL without refreshing the page
        params.delete('license');
        params.delete('key');
        params.delete('payhip_license');
        const newSearch = params.toString();
        const newUrl =
          window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);

        return { activated: true, key: candidate.trim().toUpperCase(), isTrial };
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
export function maskLicenseKey(key: string, isTrial?: boolean, remainingText?: string): string {
  if (!key) return '';
  const trimmed = key.trim();
  if (isTrial || TRIAL_KEYS.includes(trimmed.toUpperCase())) {
    return `${trimmed.toUpperCase()} (3-Day Tester Pass${remainingText ? ` • ${remainingText}` : ''})`;
  }
  if (TEST_KEYS.includes(trimmed.toUpperCase())) {
    return `${trimmed.toUpperCase()} (Permanent Test License)`;
  }
  if (trimmed.length <= 8) {
    return trimmed;
  }
  const start = trimmed.slice(0, 4);
  const end = trimmed.slice(-4);
  return `${start}-••••-••••-${end}`;
}
