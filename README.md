# mybookip — Booki customer payment page

Repo: [https://github.com/RavneetDTU/mybookip](https://github.com/RavneetDTU/mybookip)

Live: `https://payment.booki.co.za`  
SMS payment links: `https://payment.booki.co.za/payment/{paymentId}`

This is **not** the restaurant dashboard (`mybooki`). It is only the customer PayFast checkout.

---

## How it fits with the other apps

| App | Host | Role |
|---|---|---|
| `twilio_openai` | `https://phone.booki.co.za` | AI calls, SMS, `GET /api/payment/:id`, PayFast ITN |
| `mybooki` | Booki dashboard | Settings → Bank Details (restaurant PayFast merchant in Firestore) |
| **mybookip (this repo)** | `https://payment.booki.co.za` | Customer pays here |

Keep `PAYMENT_FRONTEND_URL=https://payment.booki.co.za` on the voice server. Do not point SMS at `phone.booki.co.za`.

---

## Split payments

1. Page loads booking from `GET {VITE_API_BASE_URL}/api/payment/{id}` (production: `https://phone.booki.co.za`).
2. If the JSON includes `splitPayment: { merchant_id, percentage }`, the PayFast form posts a hidden `setup` field (not included in the MD5 signature).
3. PayFast then sends ~80% to the restaurant merchant and ~20% stays on Booki (primary merchant from `VITE_PF_*`).
4. If `splitPayment` is omitted (no valid restaurant merchant in Firestore), there is no `setup` — 100% to Booki.

ITN still goes to `https://phone.booki.co.za/api/payfast/notify`.

---

## Routes

| Path | Page |
|---|---|
| `/payment/:paymentId` | Checkout |
| `/payment-success` | PayFast return |
| `/payment-fail` | Cancel / unknown URL (including `/`) |

---

## Env

See `.env.example`. Production Vercel should set:

```env
VITE_API_BASE_URL=https://phone.booki.co.za
VITE_PF_MERCHANT_ID=...
VITE_PF_MERCHANT_KEY=...
VITE_PF_PASSPHRASE=...
VITE_PF_NOTIFY_URL=https://phone.booki.co.za/api/payfast/notify
```

---

## Deploy

Push to `main` on this GitHub repo. Vercel project **mybookip** serves `payment.booki.co.za`. Split will not apply on live until this checkout change is deployed.
