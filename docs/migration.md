# Requirements and consolidation

## Source audit

| Repository | Observed implementation | Destination |
| --- | --- | --- |
| Shopping | Expo 32 / React Native 2019 marketplace, Redux, Firebase, English/Arabic | Sanitized original in `legacy/Shopping`; supported features rebuilt in `apps/web` |
| DeltaShopping | Unmodified React Native starter | History tag; no duplicated starter scaffold in active source |
| DeltaShoppingServer | Express prototype with one Firebase login handler | Sanitized reference in `legacy/DeltaShoppingServer`; replaced by shared server package |
| Delta-Shopping-Backend | `.gitignore` only | Canonical private monorepo |

The source screens/actions establish these requirements: accounts, categories, listing creation/edit/delete, available/sold state, search, product details, wishlist, cart, reviews, seller contact, chat, in-app notifications, and language selection. New administration adds member suspension and listing moderation. There is no payment integration in the original source.

## Validation

Run type checking, domain/password tests, isolated MongoDB integration tests, a Next.js production build, and browser checks. Integration tests verify that unauthorized users cannot edit listings, moderate users, see other people's messages, restore hidden listings, or retain access after account suspension.

Before archiving originals, preserve each default branch in a canonical tag, compare tag commit IDs to the source, push tags, and verify the production app and MongoDB health endpoint. Add repository pointers to the new home, then archive the redundant repositories. Keep the canonical repository active.

## Live Firebase data

No live Firebase export or Firebase administrator credentials were supplied. The new deployment starts with a new MongoDB database, not a copy of historical production data. Do not claim historical data has been migrated.

To migrate later:

1. Export the Firebase Realtime Database and inventory referenced object-storage media using an authorized account. Store exports outside Git.
2. Map `/categories/{category}/{key}` records into products, normalizing legacy Title/Info/Price/Currency/Amount/Sold fields. Retain a unique `legacyPath` for idempotency. Convert prices carefully and validate against shared schemas.
3. Map Firebase UIDs to new user IDs, preserving ownership. The old app inconsistently stored profile fields directly and below push keys; normalize both forms. Do not copy plain passwords or fabricate password hashes. Use a configured invitation/password-reset flow for old accounts.
4. Map per-user cart/wishlist references through the product map; deduplicate by user, product, and kind. Migrate reviews, conversations, and notifications with preserved timestamps and participants.
5. Copy authorized media into managed storage or retain stable public HTTPS links after access review. Do not migrate API keys from app source.
6. Dry-run into a separate staging database, compare counts and ownership mappings, then obtain a cutover window, back up both databases, migrate incrementally, and point clients at the new API.

The retained legacy mobile app is reference material, not a migrated MongoDB client. Native app modernization/distribution remains separate work. The deployed responsive web app supports phone browsers.
