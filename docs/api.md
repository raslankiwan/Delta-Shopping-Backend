# API

All routes are under `/api`, accept JSON for mutation bodies, and return JSON. Auth is an HttpOnly session cookie. Errors use `{ "error": "message" }`; 400 validation, 401 authentication, 403 ownership/role, 404 missing, 409 duplicate, 429 rate limit, and 503 unavailable.

| Method | Path | Access / behavior |
| --- | --- | --- |
| GET | `/health` | Database ping |
| POST | `/auth/register` | email, password (10–128), name; member-only signup |
| POST | `/auth/login` | email/password; creates session |
| GET | `/auth/me` | Current public profile or null |
| POST | `/auth/logout` | Revokes current session |
| GET | `/products?q=&category=&sort=recent&page=1` | Active listings, 24 per page; sort=price supported |
| GET | `/products?mine=true` | Current user's listings |
| POST | `/products` | Member; shared product schema |
| GET | `/products/:id` | Product and recent reviews; hidden listings restricted |
| PATCH | `/products/:id` | Owner/admin; fields and active/sold status |
| DELETE | `/products/:id` | Owner/admin; soft hide |
| POST | `/products/:id/reviews` | Member, one review per product; no self review |
| GET | `/saved?kind=wishlist` | Member; kind=cart supported |
| POST/DELETE | `/saved/:id?kind=wishlist` | Idempotent save/remove; cannot save own listing |
| GET/POST | `/messages` | Participant inbox; seller must be a participant |
| GET/PATCH | `/notifications` | Current user's notifications / mark all read |
| GET | `/admin/overview` | Admin counts |
| GET | `/admin/products` | Admin; up to 200 recent listings |
| GET | `/admin/users` | Admin; up to 200 public profiles (no hashes) |
| PATCH | `/admin/products/:id` | Admin; status active/sold/hidden |
| PATCH | `/admin/users/:id` | Admin; disabled boolean; protects admin accounts |

Product fields: title, description, category (Mobiles/Laptops/Cars/Clothes/Music/Other), price (positive number), currency (USD/JOD/NIS), location, company, condition (New/Like new/Good/Used), image (empty or public HTTPS URL). Server assigns seller identity and timestamps.

Messages require productId, to, text. Reviews require text and rating (1–5). No route accepts arbitrary MongoDB query objects. Search metacharacters are escaped before constructing regex queries.
