# Déploiement Hostinger — procédure

> **Statut : NON EXÉCUTÉE.** Ce document décrit la mise en ligne. Aucun
> déploiement de production n'a été effectué, conformément à la consigne du
> Gate 3. Rien de ce qui suit n'a été lancé contre l'hébergement réel.

Le site est **entièrement statique**. `dist/` s'uploade tel quel dans
`public_html`. Aucun runtime Node n'est requis côté serveur. Le seul élément
dynamique est un unique fichier PHP de 130 lignes qui envoie la demande
d'offre par e-mail.

---

## 0 · Ce qu'il faut avoir sous la main

| Élément | Où | Note |
| --- | --- | --- |
| Accès hPanel Hostinger | — | plan avec PHP ≥ 8.1 |
| Domaine `ivan-arsenov.de` | DNS pointé sur Hostinger | |
| Boîte `info@ivan-arsenov.de` | messagerie Hostinger | destinataire des demandes |
| Boîte ou alias `no-reply@ivan-arsenov.de` | messagerie Hostinger | expéditeur technique |

L'expéditeur technique n'est pas un détail de confort : mettre l'adresse du
prospect en `From` fait échouer SPF et envoie la demande en spam. Le prospect
va en `Reply-To`.

---

## 1 · Construire l'artefact

```bash
npm ci
npm run qa          # bloque si un contrôle échoue — ne pas contourner
npm run build
```

`npm run build` exécute d'abord `qa:catalog` : une marque exclue, un doublon
de slug ou un `productName` sur une marque `brand-level-only` **arrête le
build**. C'est voulu — un catalogue faux ne doit pas pouvoir être publié.

Le résultat est dans `dist/` : 17 pages, `sitemap-index.xml`, `robots.txt`,
`.htaccess`, polices et CSS empreintés.

> `dist/` ne contient **aucun packshot produit**. Les 88 visuels attendus
> n'ont pas été fournis ; le catalogue affiche le repli typographique. Voir
> `doc/assets-guide.md`.

---

## 2 · Téléverser

### hPanel → Gestionnaire de fichiers

1. Ouvrir `public_html`.
2. **Vider le répertoire** de toute page de parking Hostinger
   (`default.php`, `index.html` par défaut).
3. Téléverser le **contenu** de `dist/` — pas le dossier `dist` lui-même.
   `public_html/index.html` doit exister à la racine.
4. Vérifier que `.htaccess` est bien monté : le gestionnaire de fichiers
   masque les fichiers commençant par un point tant que l'option
   « afficher les fichiers cachés » n'est pas cochée.

### ou en SFTP

```bash
# depuis la racine du dépôt, après un build
sftp -P 65002 uXXXXXXXX@XXX.XXX.XXX.XXX
> cd public_html
> put -r dist/*
```

Les identifiants SFTP se trouvent dans hPanel → Fichiers → Comptes FTP.

---

## 3 · Brancher le formulaire (FORM_DELIVERY_READY)

Tant que cette étape n'est pas faite, le formulaire **le dit** : il affiche
« Enquiry delivery is not active on this environment yet — nothing has been
sent » et propose l'adresse e-mail directe. Il ne simule jamais un envoi.

1. Créer `public_html/api/`.
2. Copier `deploy/enquiry.php.example` → `public_html/api/enquiry.php`.
3. Copier `deploy/config.local.php.example` → `public_html/api/config.local.php`
   et renseigner les deux adresses réelles.
   **Ce fichier ne doit jamais être versionné** ; il est déjà dans
   `.gitignore`, et `.htaccess` en refuse le service.
4. Vérifier les droits : `644` sur les deux fichiers, `755` sur `api/`.

### Contrat de disponibilité

Le front n'essaie pas de deviner si l'endpoint existe. Il interroge :

```
GET /api/enquiry.php?probe=1
```

et n'accepte comme disponible que la réponse exacte :

```json
{"delivery":"ready"}
```

Tout le reste — `{"delivery":"not-ready"}`, corps illisible, 404, 503, panne
réseau — vaut indisponible, et **rien n'est alors annoncé au visiteur**. Le
défaut est fermé.

La sonde n'est **pas** un `HEAD` : un endpoint POST a le droit de répondre
405 à un HEAD tout en étant parfaitement opérationnel, et le déclarer
indisponible sur ce seul motif serait un faux négatif qui coûte une affaire.

### Vérification

```bash
curl -s https://www.ivan-arsenov.de/api/enquiry.php?probe=1
# attendu : {"delivery":"ready"}
```

---

## 4 · Test E2E — la seule preuve de FORM_DELIVERY_READY

La sonde constate qu'un endpoint **se déclare** configuré. Elle ne prouve
rien sur la livraison réelle. `FORM_DELIVERY_READY` ne passe à `PASS`
qu'après ceci, effectué sur l'environnement cible :

1. Ouvrir `https://www.ivan-arsenov.de/contact/`.
2. Ajouter deux marques depuis `/drinks/` au préalable.
3. Remplir les six champs requis avec des données réelles et joignables.
4. Envoyer.
5. **Vérifier la réception dans la boîte `info@ivan-arsenov.de`** — objet
   `Business enquiry — <société>`, les deux marques listées, `Reply-To`
   pointant sur l'adresse saisie.
6. Répondre au message pour confirmer que `Reply-To` fonctionne.
7. Refaire l'essai depuis `/de/kontakt/` : vérifier que les caractères
   accentués (`ä`, `ö`, `ü`, `ß`) arrivent intacts — l'en-tête déclare
   `charset=UTF-8`.

Tant que les étapes 5 et 6 ne sont pas constatées **par un humain sur la
vraie boîte**, le statut reste `PENDING`. Une réponse HTTP 200 de PHP ne
prouve pas qu'un e-mail est arrivé.

Si `mail()` est désactivé sur le plan Hostinger, l'endpoint renvoie 502 et le
formulaire affiche l'erreur sans effacer la saisie. Il faut alors passer par
SMTP authentifié — modification de `enquiry.php` à prévoir, hors périmètre
actuel.

---

## 5 · HTTPS et domaine canonique

1. hPanel → Sécurité → SSL : installer le certificat gratuit sur
   `ivan-arsenov.de` **et** `www.ivan-arsenov.de`.
2. Ne pas activer la redirection HTTPS de hPanel : `.htaccess` la fait déjà,
   et combinée elle produirait un double saut.

`.htaccess` canonicalise en une seule redirection 301 vers
`https://www.ivan-arsenov.de/…`. Le `site` d'Astro et toutes les canonicals
pointent sur ce même hôte : un désaccord entre les deux crée des doublons
d'indexation.

### Vérification

```bash
curl -sI http://ivan-arsenov.de/drinks/     | grep -i '^location'
curl -sI https://ivan-arsenov.de/drinks/    | grep -i '^location'
# attendu dans les deux cas, en UN saut :
# location: https://www.ivan-arsenov.de/drinks/
```

---

## 6 · Contrôles post-mise en ligne

| Contrôle | Commande / geste | Attendu |
| --- | --- | --- |
| Page d'accueil | `curl -sI https://www.ivan-arsenov.de/` | `200` |
| Slash final | ouvrir `/drinks` | redirige vers `/drinks/` |
| 404 | ouvrir `/nexistepas/` | page 404 du site, statut `404` |
| Sitemap | `/sitemap-index.xml` | 16 URLs, 48 `xhtml:link` |
| robots | `/robots.txt` | `Sitemap:` présent |
| Compression | `curl -sI -H 'Accept-Encoding: gzip' …/drinks/` | `content-encoding: gzip` |
| Cache polices | `curl -sI …/fonts/*.woff2` | `max-age=31536000, immutable` |
| Cache HTML | `curl -sI …/` | `max-age=0, must-revalidate` |
| CSP | `curl -sI …/` | en-tête `content-security-policy` présent |
| Styleguide absent | `/styleguide/` | `404` — **doit** échouer |
| Config non servie | `/api/config.local.php` | `403` |

Le styleguide n'est pas retiré après coup : il est injecté par un plugin
Astro conditionné à `command === 'dev' || STYLEGUIDE=1`, donc **structurellement
absent** d'un build de production.

---

## 7 · Référencement

À faire une fois la mise en ligne constatée, pas avant :

1. Google Search Console → ajouter la propriété `https://www.ivan-arsenov.de`.
2. Soumettre `https://www.ivan-arsenov.de/sitemap-index.xml`.
3. Vérifier dans l'outil d'inspection que la version EN et la version DE sont
   toutes deux indexables et que les `hreflang` sont réciproques.

Les canonicals sont **auto-référentes** dans les deux langues : une page
allemande ne canonicalise jamais vers son équivalent anglais. Les variantes
ne sont reliées que par les `hreflang`.

---

## 8 · Mise à jour ultérieure

```bash
git pull
npm ci
npm run qa && npm run build
# téléverser dist/ en écrasant
```

Ne pas écraser `public_html/api/` : `enquiry.php` et `config.local.php` ne
sont pas produits par le build et seraient perdus.

Le HTML n'étant pas mis en cache durablement (`max-age=0, must-revalidate`),
une correction de contenu est visible immédiatement. Les assets empreintés
changent de nom, donc aucun vidage de cache n'est nécessaire.

---

## 9 · Ce que cette procédure ne couvre pas

- **Sauvegarde** : aucune stratégie définie côté hébergeur.
- **SMTP authentifié** si `mail()` est indisponible.
- **Registre de traitement RGPD** et durée de conservation des demandes —
  renvoyés au conseil juridique d'Ivan, comme le reste des pages légales
  (bandeau `LEGAL_CONTENT_REQUIRES_VALIDATION`).
- **Consentement cookies** : le site n'en pose aucun, mais le régime
  applicable au `sessionStorage` reste à trancher juridiquement.
