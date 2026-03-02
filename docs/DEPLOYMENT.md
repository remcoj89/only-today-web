# Hostinger Business Deployment

Deploymentrunbook voor Only Today web (Astro static build) op Hostinger Business Webhosting.

## Benodigde environment variables

Zet deze variabelen in je buildomgeving (of lokaal in `.env` vóór build):

| Variabele | Verplicht | Beschrijving |
|-----------|-----------|--------------|
| `PUBLIC_WEB_URL` | Ja* | Canonieke URL van de frontend (bv. `https://app.onlytoday.nl`). Gebruikt voor sitemap, canonical tags, og:url. |
| `PUBLIC_APP_URL` | Ja* | Alternatief voor `PUBLIC_WEB_URL` (backward compatibility). |
| `PUBLIC_API_URL` | Nee | API base URL voor fetch/auth. Indien niet gezet: valt terug op `PUBLIC_WEB_URL` of `PUBLIC_APP_URL`. |
| `PUBLIC_SUPABASE_URL` | Ja | Supabase project URL. |
| `PUBLIC_SUPABASE_ANON_KEY` | Ja | Supabase anon key. |
| `PUBLIC_GTM_ID` | Nee | Google Tag Manager container ID. |
| `PUBLIC_DEFAULT_LOCALE` | Nee | Standaardtaal (bv. `nl`). |

\* Minimaal één van `PUBLIC_WEB_URL` of `PUBLIC_APP_URL` is verplicht.

## Build

```bash
npm ci
npm run build
```

De output staat in `dist/`.

## Upload naar Hostinger

1. Upload de **inhoud** van `dist/` naar `public_html/` (niet de map zelf).
2. Zorg dat `.htaccess` meekomt (staat in `public/.htaccess` en wordt gekopieerd naar `dist/`).

## DNS en SSL

1. Koppel je domein aan Hostinger.
2. Activeer SSL (Let's Encrypt) in het Hostinger panel.
3. Forceer HTTPS via de `.htaccess` of Hostinger-instellingen.

## Post-deploy checklist

- [ ] Login flow werkt
- [ ] Register flow werkt
- [ ] Forgot password flow werkt
- [ ] API-calls gaan naar de juiste backend
- [ ] Sitemap (`/sitemap-index.xml`) toont correcte URLs
- [ ] Canonical en og:url tags zijn correct
- [ ] PWA manifest en iconen laden

## Auth-beveiliging

Routes met `requiresAuth` worden alleen **client-side** afgeschermd (localStorage-check + redirect naar `/login`). Er is geen server-side sessiecontrole. Dit is normaal voor static hosting; de daadwerkelijke beveiliging zit in de API.

> **Let op**: Beveiliging van gevoelige data gebeurt in de API. De client-side check voorkomt alleen dat onbevoegde gebruikers de UI zien; de API valideert tokens server-side.
