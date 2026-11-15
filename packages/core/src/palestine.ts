/**
 * Palestine (West Bank) market constants.
 *
 * The platform is multi-tenant and currency/locale-agnostic, but the primary
 * market is the West Bank, so the sane defaults and reference data live here:
 * currencies in circulation, VAT rate, and the governorate list that drives
 * shipping zones and address validation.
 */
import { z } from 'zod';

/** Israeli new shekel — the everyday currency in the West Bank (2 decimals, agorot). */
export const PALESTINE_DEFAULT_CURRENCY = 'ILS';

/** Currencies commonly accepted: shekel (default), Jordanian dinar, US dollar. */
export const PALESTINE_CURRENCIES = ['ILS', 'JOD', 'USD'] as const;

/** Default storefront locale: Arabic, Palestine region. */
export const PALESTINE_DEFAULT_LOCALE = 'ar';

/** ISO-3166 alpha-2 for the State of Palestine. */
export const PALESTINE_COUNTRY = 'PS';

/** Asia/Hebron is the West Bank IANA timezone. */
export const PALESTINE_TIMEZONE = 'Asia/Hebron';

/** VAT is 16% in the Palestinian territories, expressed in basis points. */
export const PALESTINE_VAT_BPS = 1600;

/**
 * The eleven West Bank governorates (muhafazat). `code` is the stable key used in
 * addresses and shipping zones; `ar`/`en` are display labels; `shippingMinor` is a
 * default flat courier rate in ILS agorot for that zone.
 */
export interface Governorate {
  readonly code: string;
  readonly ar: string;
  readonly en: string;
  /** Default flat shipping rate to this governorate, in ILS minor units (agorot). */
  readonly shippingMinor: number;
}

export const WEST_BANK_GOVERNORATES: readonly Governorate[] = [
  { code: 'jenin', ar: 'جنين', en: 'Jenin', shippingMinor: 2500 },
  { code: 'tubas', ar: 'طوباس', en: 'Tubas', shippingMinor: 2500 },
  { code: 'tulkarm', ar: 'طولكرم', en: 'Tulkarm', shippingMinor: 2500 },
  { code: 'nablus', ar: 'نابلس', en: 'Nablus', shippingMinor: 2000 },
  { code: 'qalqilya', ar: 'قلقيلية', en: 'Qalqilya', shippingMinor: 2500 },
  { code: 'salfit', ar: 'سلفيت', en: 'Salfit', shippingMinor: 2000 },
  { code: 'ramallah', ar: 'رام الله والبيرة', en: 'Ramallah & al-Bireh', shippingMinor: 1500 },
  { code: 'jericho', ar: 'أريحا والأغوار', en: 'Jericho & al-Aghwar', shippingMinor: 3000 },
  { code: 'jerusalem', ar: 'القدس', en: 'Jerusalem', shippingMinor: 2000 },
  { code: 'bethlehem', ar: 'بيت لحم', en: 'Bethlehem', shippingMinor: 2000 },
  { code: 'hebron', ar: 'الخليل', en: 'Hebron', shippingMinor: 2500 },
] as const;

export const GOVERNORATE_CODES = WEST_BANK_GOVERNORATES.map((g) => g.code) as [string, ...string[]];

/** zod validator for a West Bank governorate code. */
export const governorateCode = z.enum(GOVERNORATE_CODES);
export type GovernorateCode = z.infer<typeof governorateCode>;

export function governorateByCode(code: string): Governorate | undefined {
  return WEST_BANK_GOVERNORATES.find((g) => g.code === code);
}

/**
 * Palestine payment methods. `cod` (cash on delivery) is the default and works
 * offline; the gateways are the local rails — wired via adapters when keys exist.
 */
export const PALESTINE_PAYMENT_METHODS = ['cod', 'palpay', 'jawwalpay', 'bank_of_palestine'] as const;
export type PalestinePaymentMethod = (typeof PALESTINE_PAYMENT_METHODS)[number];
