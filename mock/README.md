# Mock data

This folder is the temporary stand-in for the future Python backend.

Every file here is plain JSON shaped exactly like the API responses the real
backend is expected to return. No business data lives inside React components.

| File | Future endpoint |
| --- | --- |
| `users.json` | `GET /users`, `POST /auth/login`, `POST /auth/register` |
| `merchants.json` | `GET /merchants/{id}` |
| `payment-codes.json` | `GET /merchants/{id}/payment-codes` |
| `products.json` | `GET /merchants/{id}/products` |
| `transactions.json` | `GET /merchants/{id}/transactions` |
| `plans.json` | `GET /billing/plans` |
| `pricing.json` | `GET /platform/pricing` |

The app reads them only through `src/lib/api/*` (the data-service layer).
When the Python API is ready, swap the JSON imports in that layer for `fetch`
calls — no component changes required.

Conventions:

- All money is stored in **cents (ZAR)** as integers, never floats.
- All timestamps are ISO 8601 UTC strings.
- IDs are strings and stable.
- Phone numbers are stored in E.164 format (`+27...`) — phone is the primary
  login identifier, email is the secondary one.
