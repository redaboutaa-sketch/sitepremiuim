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
| Domaine `ivanarsenov.de` | DNS pointé sur Hostinger | **sans tiret** |
| Boîte `info@ivan-arsenov.de` | messagerie | destinataire des demandes — **domaine avec tiret** |
| Boîte ou alias `no-reply@ivan-arsenov.de` | messagerie | expéditeur technique — **domaine avec tiret** |

> ### ⚠️ Domaine web ≠ domaine e-mail
>
> Le site est servi depuis **`ivanarsenov.de`** (sans tiret). Les adresses
> fournies par le client sont sur **`ivan-arsenov.de`** (avec tiret).
>
> Ce n'est pas une faute de frappe à corriger : une entreprise peut héberger
> son site sur un domaine et sa messagerie sur un autre. `info@ivanarsenov.de`
> **n'a jamais été confirmée** et n'apparaît nulle part dans le code — un test
> de l'audit d'artefact échoue si elle y entre.
>
> ✅ **Statut au 2026-08-25 : CONFIRMÉ par le propriétaire.**
> `info@ivan-arsenov.de` (avec tiret) est bien la boîte destinataire. Le
> domaine de messagerie est délibérément distinct du domaine web.
>
> ⚠️ **Ce qui reste ouvert : l'EXPÉDITEUR.** La confirmation portait sur le
> destinataire. Les deux domaines sont hébergés séparément — relevé le
> 2026-08-25 : `ivan-arsenov.de` → 91.184.0.200, `www.ivanarsenov.de` →
> 2.57.91.91. Si le SPF de `ivan-arsenov.de` n'autorise pas 2.57.91.91, les
> messages du formulaire seront classés indésirables ou rejetés — et le
> formulaire annoncera quand même un envoi réussi, puisque la remise au
> serveur aura fonctionné. Des demandes d'offre perdues en silence.
>
> Deux issues, à trancher avec l'hébergeur de messagerie : ajouter le serveur
> web au SPF de `ivan-arsenov.de`, ou faire porter l'expéditeur par le domaine
> du site (`no-reply@ivanarsenov.de`). `recipient` ne bouge pas.
>
> Point pratique : si la boîte vit sur `ivan-arsenov.de` alors que le site est
> sur `ivanarsenov.de`, l'expéditeur technique `no-reply@ivan-arsenov.de` reste
> cohérent avec SPF **du domaine de messagerie** — c'est bien celui-là qui
> compte pour `From`, pas celui du site.

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
curl -s https://www.ivanarsenov.de/api/enquiry.php?probe=1
# attendu : {"delivery":"ready"}
```

---

## 4 · Test E2E — la seule preuve de FORM_DELIVERY_READY

La sonde constate qu'un endpoint **se déclare** configuré. Elle ne prouve
rien sur la livraison réelle. `FORM_DELIVERY_READY` ne passe à `PASS`
qu'après ceci, effectué sur l'environnement cible :

1. Ouvrir `https://www.ivanarsenov.de/contact/`.
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

> ### ⚠️ État DNS constaté — à vérifier avant toute action
>
> Relevé depuis cet environnement (résolution DNS fonctionnelle, vérifiée
> contre un domaine témoin) :
>
> | Hôte | Résolution |
> | --- | --- |
> | `ivanarsenov.de` | **aucun enregistrement** |
> | `www.ivanarsenov.de` | **aucun enregistrement** |
> | `staging.ivanarsenov.de` | **aucun enregistrement** |
> | `ivan-arsenov.de` | `91.184.0.200` · `2a02:2268:1:0:f816:3eff:fe7b:63c6` |
>
> Deux conséquences directes :
>
> 1. **La stratégie `www` n'est pas vérifiable.** Le nouveau domaine ne
>    résout pas encore ; rien ne permet de confirmer que Hostinger sert
>    l'apex, le `www`, ou les deux. La configuration livrée applique la
>    stratégie `www` approuvée au Gate 2. **Si hPanel montre que l'apex doit
>    être canonique**, ne pas déployer en l'état : changer `SITE_HOST` dans
>    `site.config.mjs` et rebâtir — une seule valeur, tout suit.
> 2. **Quelque chose répond déjà sur l'ancien domaine.** Ne pas supposer que
>    le compte est vide. Vérifier l'état réel de `public_html` avant tout
>    téléversement, et **ne remplacer aucun site existant** sans confirmation
>    d'Ivan.
>
> Je n'ai aucun accès au compte Hostinger — ni identifiants, ni connecteur.
> Ces points ne peuvent être levés que par vous, dans hPanel.

1. hPanel → Sécurité → SSL : installer le certificat gratuit sur
   `ivanarsenov.de` **et** `www.ivanarsenov.de`.
2. Ne pas activer la redirection HTTPS de hPanel : `.htaccess` la fait déjà,
   et combinée elle produirait un double saut.

`.htaccess` canonicalise en une seule redirection 301 vers
`https://www.ivanarsenov.de/…`. Le `site` d'Astro et toutes les canonicals
pointent sur ce même hôte : un désaccord entre les deux crée des doublons
d'indexation.

### Vérification

```bash
curl -sI http://ivanarsenov.de/drinks/     | grep -i '^location'
curl -sI https://ivanarsenov.de/drinks/    | grep -i '^location'
# attendu dans les deux cas, en UN saut :
# location: https://www.ivanarsenov.de/drinks/
```

---

## 6 · Contrôles post-mise en ligne

| Contrôle | Commande / geste | Attendu |
| --- | --- | --- |
| Page d'accueil | `curl -sI https://www.ivanarsenov.de/` | `200` |
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

1. Google Search Console → ajouter la propriété `https://www.ivanarsenov.de`.
2. Soumettre `https://www.ivanarsenov.de/sitemap-index.xml`.
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

---

## 10 · Préproduction — `staging.ivanarsenov.de`

### Construire

```bash
npm run qa:staging     # build préproduction + audit de l'artefact
```

`DEPLOY_TARGET=staging` change **quatre** choses, et rien d'autre :

| | Production | Préproduction |
| --- | --- | --- |
| Hôte de redirection `.htaccess` | `www.ivanarsenov.de` | `staging.ivanarsenov.de` |
| `<meta name="robots">` | `index, follow` | `noindex, nofollow` |
| `X-Robots-Tag` | absent | `noindex, nofollow` |
| `robots.txt` | `Allow: /` + `Sitemap:` | `Disallow: /`, aucun sitemap |

`ASSET_MODE=staging` est activé en même temps : les visuels en
`requires_validation` y sont rendus, alors que la production les remplace par
le repli typographique. C'est l'intérêt d'une préproduction — voir un asset
avant de l'autoriser.

### Canonicals en préproduction — décision explicite

Les canonicals de la préproduction **pointent vers les URLs de production**.
C'est intentionnel, et sûr uniquement parce que l'exclusion d'indexation est
posée **trois fois** : balise, en-tête HTTP et `robots.txt`. Aucune URL de
préproduction ne peut entrer dans l'index, donc ces canonicals n'ont jamais
l'occasion d'être interprétées.

L'alternative — canonicals auto-référentes sur l'hôte de préproduction —
obligerait à faire dépendre `src/i18n/config.ts` d'une variable
d'environnement, donc à la faire entrer dans les bundles client. On
échangerait un risque théorique contre un risque réel.

`npm run qa:staging` vérifie les trois exclusions ; il échoue si l'une saute.

### Créer le sous-domaine

1. **D'abord**, vérifier dans hPanel l'état réel du compte : quels domaines y
   sont rattachés, ce que sert déjà `public_html`, et si un site existe.
   Ne rien remplacer sans confirmation d'Ivan.
2. `ivanarsenov.de` doit résoudre avant tout — au relevé le plus récent, ce
   n'est pas le cas (voir §5).
3. hPanel → Domaines → Sous-domaines → créer `staging`. Hostinger crée un
   répertoire dédié (`public_html/staging` ou `domains/staging.…/public_html`
   selon le plan).
4. SSL : émettre le certificat pour `staging.ivanarsenov.de`.
5. Téléverser le contenu de `dist/` **dans le répertoire du sous-domaine**,
   jamais dans `public_html` racine.
6. Protection d'accès : hPanel → Fichiers → Protection par mot de passe, sur
   le répertoire du sous-domaine. Le `noindex` empêche l'indexation, pas la
   consultation par quelqu'un qui connaît l'URL.

### Contrôles après mise en préproduction — automatisés

Deux commandes, à lancer **depuis un poste ayant accès au site** :

```bash
# 1. Audit du site RÉELLEMENT EN LIGNE — aucun navigateur requis
npm run qa:remote -- https://staging.ivanarsenov.de --expect=staging

# 2. Parcours navigateur complet contre la même URL distante
BASE_URL=https://staging.ivanarsenov.de npm run qa:remote:e2e
```

`qa:remote` couvre ce qu'un audit de `dist/` ne peut pas voir : HTTPS,
certificat, chaîne de redirection, en-têtes réellement émises, assets
réellement servis, 404, absence du styleguide, sonde du formulaire. Il
échoue avec un code 1 si un contrôle bloquant tombe.

C'est la distinction qui compte : **un artefact correct mal déployé reste un
site cassé**. Un `.htaccess` non monté — parce que le gestionnaire de
fichiers masque les fichiers cachés — laisse les balises `noindex` en place
et supprime l'en-tête `X-Robots-Tag`, la CSP et la page 404. Seule
l'interrogation du serveur le montre.

Contrôle manuel complémentaire, quelques jours plus tard :

| Contrôle | Attendu |
| --- | --- |
| Recherche `site:staging.ivanarsenov.de` | aucun résultat, durablement |

### Le formulaire en préproduction

Deux options, et le choix doit être **conscient** :

- **Ne pas déposer `api/enquiry.php`** — la sonde répond indisponible, le
  formulaire l'annonce et ne prétend rien. C'est le défaut, et c'est sûr.
- **Le déposer avec un destinataire de test** — permet de fermer B1 sans
  polluer la boîte d'Ivan. Ne jamais pointer la préproduction sur
  `info@…` en production : un test finit toujours par ressembler à une vraie
  demande d'offre.

---
