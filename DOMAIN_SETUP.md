# 🌐 Configurare Domeniu Custom - liliadubita.md/conflicte

## Pași pentru a conecta domeniul tău cu Vercel

### 1. Deploy pe Vercel (dacă nu e deja făcut)

1. Mergi pe [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Importă repository-ul `relatia-360-landing`
4. Click "Deploy"

### 2. Configurare Domeniu în Vercel

1. **Mergi la proiectul tău pe Vercel**
   - Selectează proiectul `relatia-360-landing`

2. **Settings → Domains**
   - Click pe tab-ul "Domains"

3. **Adaugă domeniul**
   - În câmpul "Domain", introdu: `liliadubita.md`
   - Click "Add"

4. **Configurează subdomain-ul**
   - După ce domeniul principal este adăugat, Vercel va detecta automat subdomain-urile
   - Sau adaugă direct: `conflicte.liliadubita.md` (dacă vrei subdomain)
   - **SAU** configurează path-ul `/conflicte` în setările de routing

### 3. Configurare DNS pe liliadubita.md

După ce adaugi domeniul în Vercel, vei primi instrucțiuni pentru DNS:

#### Opțiunea 1: Subdomain (conflicte.liliadubita.md)
```
Type: CNAME
Name: conflicte
Value: cname.vercel-dns.com
```

#### Opțiunea 2: Path routing (liliadubita.md/conflicte)
Dacă domeniul principal `liliadubita.md` este deja pe Vercel:
- Vercel va gestiona automat routing-ul
- Poți configura redirect sau rewrite în `vercel.json`

### 4. Configurare vercel.json (pentru path routing)

Dacă vrei să folosești `liliadubita.md/conflicte` ca path:

Creează fișierul `vercel.json` în root:

```json
{
  "rewrites": [
    {
      "source": "/conflicte/:path*",
      "destination": "/:path*"
    }
  ]
}
```

Apoi în Vercel:
- Settings → Domains
- Adaugă `liliadubita.md`
- Configurează routing-ul

### 5. Verificare

După configurare:
- Așteaptă câteva minute pentru propagarea DNS
- Verifică la: `https://liliadubita.md/conflicte` (sau `https://conflicte.liliadubita.md`)

## Note importante

- **DNS Propagation**: Poate dura până la 24 de ore (de obicei 5-10 minute)
- **SSL Certificate**: Vercel generează automat certificat SSL (HTTPS)
- **Redirect**: Dacă domeniul principal este deja pe Vercel, poți configura redirect-uri

## Suport

Dacă întâmpini probleme:
- Verifică DNS records în panoul de control al domeniului
- Verifică status-ul în Vercel Dashboard → Domains
- Contactează suportul Vercel dacă e necesar

