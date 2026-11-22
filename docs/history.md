# Project history

Mercato is the latest step of one line of work that started in 2019. Each
earlier project was its own repository; they were joined into this one in
November 2026 with their original commits and dates.

| Years | Project | What it was | Last commit here |
|-------|---------|-------------|------------------|
| 2019 | product-mobile | Product catalog mobile app (React Native) with image upload. | `103f29e` |
| 2019 | items-display, ItemsMobile | Item listing web and mobile apps with infinite scroll. | `22414b1`, `034fc88` |
| 2020 | DeltaShopping | React Native app that started Delta Shopping. | `e302bf8` |
| 2020–2021 | DeltaShoppingServer | Express + Firebase server for Delta Shopping. | `b1f8ae9` |
| 2021 | Delta-Shopping-Backend | First commit of this repository. | `c70cea7` |
| 2026 | Delta Shopping marketplace | MongoDB marketplace monorepo, then invitation-only multi-store commerce. | `main`, Oct 2026 |
| 2026 | Mercato | Multi-tenant commerce platform with PostgreSQL Row-Level Security (this codebase). | `main` |
| 2026 | commerce-platform-spec | The spec set, identical to `docs/01`–`05`. | `3356396` |

Two earlier team projects stay in their own archived repositories, where
their contributors are credited: the 2019 Expo shopping app
([Shopping](https://github.com/raslankiwan/Shopping)) and the product catalog
web app ([products](https://github.com/raslankiwan/products)).

## Reading old code

The old projects are history only; nothing from them is in the current tree.

```bash
git log --oneline b1f8ae9                   # DeltaShoppingServer's commits
git worktree add ../delta-server-2021 b1f8ae9   # browse it in a scratch worktree
```

## Notes

- `product-mobile` had committed Android build output (debug APKs and native
  libraries, about 70 MB). It was removed from that project's history before
  the join; every commit kept its message and date.
- The 2020–2021 Firebase project used a web API key that is visible in that
  history. Web API keys are client identifiers, not secrets, but the old
  Firebase project should stay restricted or be deleted.
