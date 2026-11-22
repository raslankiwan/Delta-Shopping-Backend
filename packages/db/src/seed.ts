/**
 * Seed a demo Palestine (West Bank) organization with TWO stores so tenant
 * isolation is observable end-to-end (the storefront/admin point at one; the
 * isolation test proves the other is invisible). Runs as `app_owner` (BYPASSRLS)
 * to write across stores.
 *
 * The primary store models a Palestinian marketplace: Arabic-default, ILS pricing
 * (+JOD/USD), 16% VAT, a category tree, and a mix of physical / digital / service
 * products. Shipping zones cover the eleven West Bank governorates.
 *
 * Run from the repo root: `bun run db:seed`.
 */
import { createDb } from './client';
import {
  category,
  inventoryItem,
  location,
  price,
  priceList,
  product,
  productImage,
  productOption,
  productOptionValue,
  productVariant,
  role,
  shippingZone,
  staffMembership,
  staffUser,
  store,
  storeCurrency,
  storeLocale,
  organization,
  translation,
} from './schema';

/** The eleven West Bank governorates + a default flat courier rate (ILS agorot). */
const WEST_BANK_GOVERNORATES: ReadonlyArray<{ code: string; ar: string; rate: number; eta: number }> = [
  { code: 'jenin', ar: 'جنين', rate: 2500, eta: 3 },
  { code: 'tubas', ar: 'طوباس', rate: 2500, eta: 3 },
  { code: 'tulkarm', ar: 'طولكرم', rate: 2500, eta: 3 },
  { code: 'nablus', ar: 'نابلس', rate: 2000, eta: 2 },
  { code: 'qalqilya', ar: 'قلقيلية', rate: 2500, eta: 3 },
  { code: 'salfit', ar: 'سلفيت', rate: 2000, eta: 2 },
  { code: 'ramallah', ar: 'رام الله والبيرة', rate: 1500, eta: 1 },
  { code: 'jericho', ar: 'أريحا والأغوار', rate: 3000, eta: 4 },
  { code: 'jerusalem', ar: 'القدس', rate: 2000, eta: 2 },
  { code: 'bethlehem', ar: 'بيت لحم', rate: 2000, eta: 2 },
  { code: 'hebron', ar: 'الخليل', rate: 2500, eta: 3 },
];

interface SeededCategory {
  slug: string;
  /** Arabic label (base value; ar is the default locale). */
  name: string;
}

interface SeededProduct {
  slug: string;
  title: string;
  description: string;
  sku: string;
  /** Price in minor units per currency, e.g. { ILS: 4500, JOD: 9000, USD: 1200 }. */
  prices: Record<string, number>;
  /** Optional "was" price per currency (strikethrough). */
  compareAt?: Record<string, number>;
  arTitle?: string;
  arDescription?: string;
  vendor?: string;
  tags?: string[];
  image?: string;
  categorySlug?: string;
  /** physical (default) | digital | service. */
  type?: 'physical' | 'digital' | 'service';
  /** Service-only metadata. */
  serviceDurationMinutes?: number;
  serviceLocation?: 'onsite' | 'remote' | 'customer';
  /** If present, variants are generated for the cartesian product of option values. */
  options?: Array<{ name: string; values: string[] }>;
}

const STORE_A_CATEGORIES: SeededCategory[] = [
  { slug: 'food', name: 'أطعمة ومنتجات محلية' },
  { slug: 'apparel', name: 'ملابس وتراث' },
  { slug: 'digital', name: 'منتجات رقمية' },
  { slug: 'services', name: 'خدمات' },
];

const STORE_A_PRODUCTS: SeededProduct[] = [
  {
    slug: 'palestinian-olive-oil', title: 'Palestinian Olive Oil', description: 'Extra-virgin olive oil from West Bank groves.', sku: 'OO',
    prices: { ILS: 4500, JOD: 8500, USD: 1200 }, compareAt: { ILS: 5500, JOD: 10000, USD: 1500 },
    arTitle: 'زيت زيتون فلسطيني', arDescription: 'زيت زيتون بكر ممتاز من بيّارات الضفة الغربية.',
    vendor: 'مزارع فلسطين', tags: ['olive-oil', 'local'], categorySlug: 'food', type: 'physical',
    options: [{ name: 'Size', values: ['500ml', '1L', '3L'] }],
  },
  {
    slug: 'keffiyeh', title: 'Palestinian Keffiyeh', description: 'Hand-woven Hirbawi keffiyeh.', sku: 'KEF',
    prices: { ILS: 6000, JOD: 12000, USD: 1700 },
    arTitle: 'كوفية فلسطينية', arDescription: 'كوفية حرباوي منسوجة يدويًا.',
    vendor: 'الحرباوي', tags: ['heritage', 'apparel'], categorySlug: 'apparel', type: 'physical',
    options: [{ name: 'Color', values: ['أبيض وأسود', 'أحمر وأبيض'] }],
  },
  {
    slug: 'medjool-dates', title: 'Medjool Dates', description: 'Premium Jericho Medjool dates, 1kg.', sku: 'DAT-1KG',
    prices: { ILS: 3500, JOD: 7000, USD: 950 },
    arTitle: 'تمر مجدول', arDescription: 'تمر مجدول فاخر من أريحا، 1 كغم.',
    vendor: 'أريحا', tags: ['food', 'local'], categorySlug: 'food', type: 'physical',
  },
  {
    slug: 'palestinian-cookbook-ebook', title: 'Palestinian Cookbook (eBook)', description: 'Downloadable PDF cookbook of traditional recipes.', sku: 'EBK-COOK',
    prices: { ILS: 2000, JOD: 4000, USD: 550 },
    arTitle: 'كتاب الطبخ الفلسطيني (نسخة رقمية)', arDescription: 'كتاب طبخ رقمي (PDF) لوصفات فلسطينية تقليدية.',
    vendor: 'دار النشر', tags: ['ebook', 'digital'], categorySlug: 'digital', type: 'digital',
  },
  {
    slug: 'nutrition-consultation', title: 'Nutrition Consultation', description: 'One-hour online nutrition consultation.', sku: 'SVC-NUTR',
    prices: { ILS: 15000, JOD: 30000, USD: 4000 },
    arTitle: 'استشارة تغذية', arDescription: 'جلسة استشارة تغذية أونلاين لمدة ساعة.',
    vendor: 'عيادة', tags: ['service', 'health'], categorySlug: 'services', type: 'service',
    serviceDurationMinutes: 60, serviceLocation: 'remote',
  },
  {
    slug: 'appliance-installation', title: 'Appliance Installation', description: 'On-site home appliance installation visit.', sku: 'SVC-INST',
    prices: { ILS: 25000, JOD: 50000, USD: 6800 },
    arTitle: 'خدمة تركيب أجهزة', arDescription: 'زيارة منزلية لتركيب الأجهزة الكهربائية.',
    vendor: 'فنّي', tags: ['service', 'home'], categorySlug: 'services', type: 'service',
    serviceDurationMinutes: 120, serviceLocation: 'onsite',
  },
];

const STORE_B_PRODUCTS: SeededProduct[] = [
  { slug: 'borealis-notebook', title: 'Borealis Notebook', description: 'A5 dotted notebook.', sku: 'BOR-NB-001', prices: { ILS: 2500 }, arTitle: 'دفتر بورياليس', arDescription: 'دفتر منقّط بحجم A5.', vendor: 'Borealis', tags: ['stationery'], type: 'physical' },
  { slug: 'borealis-pen', title: 'Borealis Pen', description: 'Rollerball, black ink.', sku: 'BOR-PEN-001', prices: { ILS: 1500 }, arTitle: 'قلم بورياليس', arDescription: 'قلم حبر أسود.', vendor: 'Borealis', tags: ['stationery'], type: 'physical' },
];

async function seedStore(
  db: ReturnType<typeof createDb>['db'],
  organizationId: string,
  opts: {
    slug: string;
    name: string;
    domain: string;
    locales: string[];
    currencies: string[];
    defaultCurrency: string;
    products: SeededProduct[];
    categories?: SeededCategory[];
    shippingZones?: boolean;
  },
): Promise<string> {
  const [s] = await db
    .insert(store)
    .values({
      organizationId,
      slug: opts.slug,
      name: opts.name,
      primaryDomain: opts.domain,
      defaultLocale: opts.locales[0]!,
      defaultCurrency: opts.defaultCurrency,
      timezone: 'Asia/Hebron',
      taxRateBps: 1600, // 16% Palestinian VAT
    })
    .returning();
  const storeId = s!.id;

  await db.insert(storeLocale).values(
    opts.locales.map((locale, i) => ({ storeId, locale, isDefault: i === 0 })),
  );
  await db.insert(storeCurrency).values(
    opts.currencies.map((currency) => ({ storeId, currency, isDefault: currency === opts.defaultCurrency })),
  );

  // Shipping zones: one per West Bank governorate.
  if (opts.shippingZones) {
    await db.insert(shippingZone).values(
      WEST_BANK_GOVERNORATES.map((g) => ({
        storeId,
        governorate: g.code,
        name: g.ar,
        rateMinor: g.rate,
        codAvailable: true,
        etaDays: g.eta,
      })),
    );
  }

  // Categories.
  const categoryBySlug = new Map<string, string>();
  for (const [i, c] of (opts.categories ?? []).entries()) {
    const [row] = await db
      .insert(category)
      .values({ storeId, slug: c.slug, name: c.name, position: i })
      .returning();
    categoryBySlug.set(c.slug, row!.id);
  }

  const [defaultLocation] = await db
    .insert(location)
    .values({ storeId, name: 'المستودع الرئيسي', isDefault: true })
    .returning();

  // One price list per enabled currency (prices are stored per currency, not FX-converted).
  const priceListByCurrency = new Map<string, string>();
  for (const currency of opts.currencies) {
    const [list] = await db
      .insert(priceList)
      .values({ storeId, name: `${currency} retail`, currency })
      .returning();
    priceListByCurrency.set(currency, list!.id);
  }

  for (const p of opts.products) {
    const type = p.type ?? 'physical';
    const [prod] = await db
      .insert(product)
      .values({
        storeId,
        slug: p.slug,
        title: p.title,
        description: p.description,
        type,
        requiresShipping: type === 'physical',
        categoryId: p.categorySlug ? (categoryBySlug.get(p.categorySlug) ?? null) : null,
        serviceDurationMinutes: p.serviceDurationMinutes ?? null,
        serviceLocation: p.serviceLocation ?? null,
        vendor: p.vendor,
        tags: p.tags ?? [],
        status: 'active',
      })
      .returning();

    if (p.image) {
      await db.insert(productImage).values({ storeId, productId: prod!.id, url: p.image, alt: p.title });
    }

    // Build the variant list: cartesian product of option values, or a single variant.
    const variantSpecs = buildVariantSpecs(p);
    for (const spec of variantSpecs) {
      const [variant] = await db
        .insert(productVariant)
        .values({ storeId, productId: prod!.id, sku: spec.sku, optionValues: spec.optionValues })
        .returning();
      // Services/digital goods are not stock-tracked, but a row keeps checkout uniform.
      await db
        .insert(inventoryItem)
        .values({ storeId, variantId: variant!.id, locationId: defaultLocation!.id, onHand: 999, reorderPoint: 0 });
      for (const [currency, amountMinor] of Object.entries(p.prices)) {
        const listId = priceListByCurrency.get(currency);
        if (!listId) continue;
        await db.insert(price).values({
          storeId,
          priceListId: listId,
          variantId: variant!.id,
          amountMinor,
          compareAtAmountMinor: p.compareAt?.[currency] ?? null,
        });
      }
    }

    // Persist the option definitions (Size, Color, …) for the admin/storefront.
    for (const [i, opt] of (p.options ?? []).entries()) {
      const [optRow] = await db
        .insert(productOption)
        .values({ storeId, productId: prod!.id, name: opt.name, position: i })
        .returning();
      await db.insert(productOptionValue).values(
        opt.values.map((value, j) => ({ storeId, optionId: optRow!.id, value, position: j })),
      );
    }

    if (opts.locales.includes('ar')) {
      const rows = [];
      if (p.arTitle) rows.push({ storeId, entityType: 'product', entityId: prod!.id, field: 'title', locale: 'ar', value: p.arTitle });
      if (p.arDescription) rows.push({ storeId, entityType: 'product', entityId: prod!.id, field: 'description', locale: 'ar', value: p.arDescription });
      if (rows.length) await db.insert(translation).values(rows);
    }
  }

  return storeId;
}

/** Expand a product's options into concrete variant specs (cartesian product). */
function buildVariantSpecs(p: SeededProduct): Array<{ sku: string; optionValues: Record<string, string> }> {
  const options = p.options ?? [];
  if (options.length === 0) return [{ sku: p.sku, optionValues: {} }];
  let combos: Array<Record<string, string>> = [{}];
  for (const opt of options) {
    const next: Array<Record<string, string>> = [];
    for (const combo of combos) for (const value of opt.values) next.push({ ...combo, [opt.name]: value });
    combos = next;
  }
  let n = 0;
  return combos.map((c) => {
    n += 1;
    // Option values may be Arabic; ASCII-fold to keep SKUs stable, fall back to an index.
    const suffix = Object.values(c)
      .map((v) => v.toUpperCase().replace(/[^A-Z0-9]+/g, ''))
      .filter(Boolean)
      .join('-');
    return { sku: suffix ? `${p.sku}-${suffix}` : `${p.sku}-${n}`, optionValues: c };
  });
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_ADMIN_URL;
  if (!url) throw new Error('Missing DATABASE_ADMIN_URL (privileged role for seeding)');
  const { db, close } = createDb(url, { max: 1 });

  try {
    // Idempotent: clear any prior demo data (cascades to stores and their catalog).
    const { eq } = await import('drizzle-orm');
    await db.delete(organization).where(eq(organization.slug, 'demo-merchant'));

    const [org] = await db
      .insert(organization)
      .values({ name: 'سوق فلسطين', slug: 'demo-merchant', plan: 'trial' })
      .returning();

    // Owner staff user with an org-wide Owner role (permissions ["*"]).
    const ownerPassword = 'password123';
    const [ownerRole] = await db
      .insert(role)
      .values({ organizationId: org!.id, name: 'Owner', permissions: ['*'] })
      .returning();
    const [owner] = await db
      .insert(staffUser)
      .values({
        organizationId: org!.id,
        email: 'owner@demo.test',
        passwordHash: await Bun.password.hash(ownerPassword, { algorithm: 'argon2id' }),
        name: 'Demo Owner',
      })
      .returning();
    await db.insert(staffMembership).values({
      organizationId: org!.id,
      staffUserId: owner!.id,
      storeId: null,
      roleId: ownerRole!.id,
    });

    // Primary Palestine store → Arabic default, ILS pricing, VAT, categories, zones.
    const storeAId = await seedStore(db, org!.id, {
      slug: 'aurora',
      name: 'سوق فلسطين',
      domain: 'aurora.localhost',
      locales: ['ar', 'en'],
      currencies: ['ILS', 'JOD', 'USD'],
      defaultCurrency: 'ILS',
      products: STORE_A_PRODUCTS,
      categories: STORE_A_CATEGORIES,
      shippingZones: true,
    });

    const storeBId = await seedStore(db, org!.id, {
      slug: 'borealis',
      name: 'Borealis',
      domain: 'borealis.localhost',
      locales: ['ar', 'en'],
      currencies: ['ILS'],
      defaultCurrency: 'ILS',
      products: STORE_B_PRODUCTS,
      shippingZones: true,
    });

    console.log('Seeded demo Palestine organization with two isolated stores:\n');
    console.log(`  Store A (سوق فلسطين) ${storeAId}   ${STORE_A_PRODUCTS.length} products, ILS/JOD/USD, ar/en (ar default), 16% VAT`);
    console.log(`  Store B (Borealis)   ${storeBId}   ${STORE_B_PRODUCTS.length} products, ILS, ar/en (ar default)`);
    console.log('\n  Staff owner login: owner@demo.test / password123 (org-wide, all permissions)');
    console.log('\nUse a store id as X-Store-Id (or NEXT_PUBLIC_DEMO_STORE_ID / VITE_DEMO_STORE_ID).');
    /* eslint-enable no-console */
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
