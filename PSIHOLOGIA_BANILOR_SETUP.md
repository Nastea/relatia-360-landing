# Psihologia Banilor — checklist plată + chatbot (go-live)

Landing: `/psihologia-banilor` · Produs: `psihologia_banilor` (vezi `lib/products.ts`)
Preț: **990 lei** primele 20 bilete plătite, apoi **1290 lei** (MDL, cod Paynet 498).

Fluxul: `/psihologia-banilor` → `POST /api/paynet/create` → portal Paynet →
`/api/paynet/callback` (marchează `paid`) → `/multumim?order=…` (polling) →
link Telegram `t.me/<bot>?start=access_<token>` → botul confirmă înscrierea.

---

## 1. Variabile de mediu (Vercel / .env)

### Supabase (obligatoriu)
- [ ] `SUPABASE_URL` (sau `NEXT_PUBLIC_SUPABASE_URL`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

### Paynet
- [ ] `PAYNET_ENV` = `test` (la testare) → `live` (la lansare)
- [ ] `PAYNET_USERNAME`
- [ ] `PAYNET_PASSWORD`
- [ ] `PAYNET_MERCHANT_CODE`
- [ ] `PAYNET_SALE_AREA_CODE`
- [ ] `PAYNET_CALLBACK_URL` = `https://DOMENIU/api/paynet/callback`
      ⚠️ Exact această formă — codul derivă URL-ul de succes (`/multumim`) tăind
      `/api/paynet/callback` din ea. Dacă e greșită, redirect-ul după plată se strică.
- Test: `PAYNET_API_HOST_TEST`, `PAYNET_PORTAL_HOST_TEST`, `PAYNET_NOTIFY_SECRET_KEY_TEST`
- Live: `PAYNET_API_HOST_LIVE`, `PAYNET_PORTAL_HOST_LIVE`, `PAYNET_NOTIFY_SECRET_KEY_LIVE`

### Telegram
- [ ] `TELEGRAM_BOT_TOKEN` — tokenul de la @BotFather
- [ ] `TELEGRAM_BOT_USERNAME` — username-ul botului **fără @** (ex: `PsihologiaBanilorBot`).
      Apare în linkul de pe `/multumim` (via `/api/config`). Dacă lipsește, default e `Relatia360Bot`.
- [ ] `SITE_URL` = `https://DOMENIU` (fără `/` la final) — folosit de webhook + linkuri bot
- [ ] `TELEGRAM_WEBHOOK_ADMIN_KEY` — cheie oarecare, ca să poți seta webhook-ul securizat

> Poți reutiliza botul existent (același `TELEGRAM_BOT_TOKEN`) — mesajul de confirmare
> se schimbă automat în funcție de produs (vezi `lib/products.ts → telegramConfirmation`).
> Dacă vrei un bot separat pentru eveniment, creează-l la @BotFather și pune tokenul/username-ul lui.

---

## 2. Bază de date (Supabase)

Se folosește aceeași tabelă `orders` + tabelele Telegram ca la curs. Dacă proiectul e nou,
rulează migrațiile din `supabase/migrations/`:
- [ ] `create_orders_table.sql`
- [ ] `add_paynet_columns.sql`
- [ ] `drop_order_id_column.sql`
- [ ] `add_telegram_bot_tables.sql`

(Dacă baza rulează deja pentru RELAȚIA 360, nu e nevoie de nimic — schema e comună.)

---

## 3. Configurare în panoul Paynet

- [ ] Setează URL-ul de notificare (callback) la `https://DOMENIU/api/paynet/callback`
- [ ] Confirmă că moneda MDL (498) e activă pentru contul de comerciant
- [ ] Verifică `PAYNET_MERCHANT_CODE` / `PAYNET_SALE_AREA_CODE` cu suportul Paynet

---

## 4. Setează webhook-ul Telegram (o singură dată după deploy)

Accesează în browser:
```
https://DOMENIU/api/telegram/set-webhook?key=TELEGRAM_WEBHOOK_ADMIN_KEY
```
Răspuns așteptat: `{ "ok": true, "telegram": { "ok": true, "result": true, ... } }`

---

## 5. Test end-to-end (pe `PAYNET_ENV=test`)

1. [ ] Deschide `/psihologia-banilor`, apasă **Vreau bilet** → bifează termenii → **Vreau bilet**.
2. [ ] Ești dus la portalul Paynet (test). La revenire ajungi pe `/multumim?order=…`.
3. [ ] Dacă plata de test nu se confirmă singură, apasă **„Am plătit deja"** pe `/multumim`
       (rula `/api/paynet/confirm-test`, activ doar când `PAYNET_ENV` ≠ `live`).
4. [ ] Statusul devine `paid`, apare linkul spre botul de Telegram.
5. [ ] Deschide botul → trimite `/start` cu tokenul → primești:
       **„Înscriere confirmată ✅ Ești înscris la evenimentul live PSIHOLOGIA BANILOR…"**
6. [ ] Verifică prețul în trepte: primele 20 comenzi **paid** → 990 lei; a 21-a → 1290 lei.
       (Se numără comenzile cu `status = paid` pentru `product_id = psihologia_banilor`.)

---

## 6. Trecerea în LIVE

- [ ] `PAYNET_ENV=live` + toate cele 3 variabile `*_LIVE`
- [ ] `SITE_URL` și `PAYNET_CALLBACK_URL` pe domeniul de producție
- [ ] Re-rulează `set-webhook` dacă domeniul s-a schimbat
- [ ] Fă o plată reală de test (sumă mică dacă se poate) și verifică tot fluxul
- [ ] Confirmă că `/api/paynet/confirm-test` întoarce 404 în live (butonul „Am plătit deja" e dezactivat)

---

## De completat pe landing (conținut)
- [ ] Oraș + adresă completă (`EVENT.city`, `EVENT.address`) + embed Google Maps în secțiunea „Unde ne vedem"
- [ ] Confirmă anul (acum: 8 august 2026)
