# Project history

Mercato is the latest step of one line of work that started in April 2019.
Each earlier project was its own repository; they were joined into this one
in November 2026 with every original commit, author and date intact.

| Years | Project | What it was | In this repo |
|-------|---------|-------------|--------------|
| 2019 | Shopping | Expo shopping app: catalog, cart, wishlist, reviews, chat, push notifications. Built with Razan Kiwan. | tag `legacy/Shopping` (f3f10c12ca) |
| 2019 | products, product-mobile | Product catalog web app (React) and mobile app (React Native) with image upload. `products` built with ayashanaa. | tags `legacy/products` (28660434de), `legacy/product-mobile` (3540f864c1) |
| 2019 | items-display, ItemsMobile | Item listing web and mobile apps with infinite scroll. | tags `legacy/items-display` (5f6349fb07), `legacy/ItemsMobile` (f5401ab8a7) |
| 2020 | DeltaShopping | React Native app that started Delta Shopping. | tag `legacy/DeltaShopping` (19c0df938d) |
| 2020–2021 | DeltaShoppingServer | Express + Firebase server for Delta Shopping. | tag `legacy/DeltaShoppingServer` (d24a5cb913) |
| 2021 | Delta-Shopping-Backend | First commit of this repository. | tag `legacy/master-2021` (042bf3d15c) |
| 2026 | Delta Shopping marketplace | MongoDB marketplace monorepo, then invitation-only multi-store commerce. | `main`, Oct 2026 |
| 2026 | Mercato | Multi-tenant commerce platform with PostgreSQL Row-Level Security (this codebase). | `main` |
| 2026 | commerce-platform-spec | The spec set, identical to `docs/01`–`05`. | tag `legacy/commerce-platform-spec` (1a74df616a) |

## Reading old code

The old projects are history only; nothing from them is in the current tree.
Each is reachable from `main`; the hash next to a tag is that project's last
commit, so it works even where the tag is missing.

```bash
git log --oneline legacy/Shopping          # the 2019 shopping app's commits
git checkout legacy/Shopping -- .          # or browse it in a scratch worktree:
git worktree add ../shopping-2019 legacy/Shopping
```

## Notes

- `product-mobile` had committed Android build output (debug APKs and native
  libraries, about 70 MB). It was removed from that project's history before
  the join; every commit kept its message, author and date.
- The 2019–2021 Firebase projects used a web API key that is visible in that
  history. Web API keys are client identifiers, not secrets, but the old
  Firebase projects should stay restricted or be deleted.
