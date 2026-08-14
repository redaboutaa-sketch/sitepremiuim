# IVAN ARSENOV — B2B Soft Drinks

Site vitrine B2B pour Ivan Arsenov Iliev (Wildeshausen, Allemagne), spécialiste
des boissons non alcoolisées internationales.

Sortie **100 % statique** : `dist/` est uploadable tel quel dans `public_html`
chez Hostinger, sans runtime Node en production.

## Documents de référence

| Fichier | Rôle |
|---|---|
| `doc/prd.md` | User stories, périmètre, risques, décisions client |
| `doc/plan.md` | 22 tracer bullets, stack, definition of done |
| `doc/catalog.md` | Inventaire des marques, taxonomie, modèle de données |
| `doc/content-architecture.md` | Sitemap, copy deck, UX de l'Enquiry List |
| `doc/design-direction.md` | Direction artistique, tokens, mouvement |

## Commandes

```bash
npm install
npm run dev        # serveur de développement
npm run check      # types + diagnostics Astro  (doit rester à 0 erreur)
npm run build      # génère dist/
npm run qa:routes  # routage, canonical, hreflang, lang  (sur dist/)
npm run test       # smoke tests navigateur       (sur dist/)
npm run serve      # sert dist/ localement
```

`npm run check`, `npm run qa:routes` et `npm run test` doivent tous passer avant
tout commit.

## Architecture

```
src/
  i18n/         table de routage + dictionnaires EN/DE
  layouts/      squelette HTML
  views/        contenu de page (indépendant de la locale)
  pages/        16 routes fines (8 pages × 2 langues)
  components/   composants réutilisables
scripts/        outillage QA
tests/          tests Playwright
doc/            spécifications
```

### i18n

EN est la **langue source éditoriale** — sans statut canonique en SEO.

- Chemins centralisés dans `src/i18n/routes.ts`. **Aucun chemin en dur ailleurs.**
- Slugs allemands traduits : `/drinks/` ↔ `/de/getraenke/`.
- **Canonical auto-référente** sur chaque page. Une page DE ne canonicalise
  jamais vers son équivalent EN.
- Variantes reliées uniquement par `hreflang` réciproques + `x-default` → EN.
- Parité EN/DE garantie par le type `Dictionary` : une clé manquante ou en trop
  dans `de.ts` fait échouer `npm run check`, donc le build.

### Environnement de test

Le Chromium préinstallé ne correspond pas au build attendu par
`@playwright/test`. `playwright.config.ts` pointe `executablePath` sur
`/opt/pw-browsers/chromium`. **Ne pas lancer `playwright install`.**
Surchargeable via `CHROMIUM_PATH`.

## Sécurité

Aucun secret n'est versionné. La configuration du formulaire de contact
(TR-015) vit hors dépôt, côté serveur.
