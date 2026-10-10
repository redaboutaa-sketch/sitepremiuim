# TR-031 — CHANGEMENT DE DOMAINE PRINCIPAL

**`www.ivan-arsenov.de` devient le domaine canonique.
`ivanarsenov.de` cesse de servir du contenu et redirige intégralement.**

Décidé par le propriétaire le **2026-10-10**.
Destinataires : Ivan Arsenov, l'intégrateur.

---

## 1 · Ce qui change, et pourquoi ça ne se résume pas à un renommage

Les deux domaines appartiennent au client. Jusqu'ici le site vivait sur
`ivanarsenov.de` (sans tiret) et la messagerie sur `ivan-arsenov.de` (avec).
L'arbitrage inverse la situation : le site rejoint le domaine de la
messagerie.

Le vrai risque n'est pas le renommage — c'est **ce qui arrive au domaine
qu'on quitte**. Laissé en l'état, il servirait le *même contenu* sous une
*autre adresse* : deux sites identiques qui se disputent l'indexation, et une
autorité acquise depuis août qui reste coincée sur l'adresse abandonnée. Le
second livrable de ce TR existe uniquement pour fermer ce piège.

| | avant | après |
| --- | --- | --- |
| Hôte canonique | `www.ivanarsenov.de` | **`www.ivan-arsenov.de`** |
| Autre domaine | `ivan-arsenov.de` — messagerie | **`ivanarsenov.de` — redirige, ne sert rien** |
| Destinataire du formulaire | `info@ivan-arsenov.de` | `info@ivan-arsenov.de` — **inchangé** |
| Expéditeur technique | `no-reply@ivanarsenov.de` | `no-reply@ivan-arsenov.de` |
| Préproduction | `staging.ivanarsenov.de` | `staging.ivan-arsenov.de` |

### Une seule valeur a été modifiée

`site.config.mjs` → `SITE_HOST`. Tout le reste en découle : canonicals,
hreflang, sitemap, `robots.txt`, `.htaccess`, données structurées, origine du
formulaire, hôte de préproduction. C'est précisément ce pour quoi ce fichier
avait été créé — l'origine vivait auparavant à huit endroits indépendants.

`CONTACT_EMAIL` reste **écrit en dur**, et le contrôle « aucune adresse
déduite du domaine web » reste actif. Les deux domaines coïncident désormais,
mais la coïncidence est *constatée*, pas *exploitée* : le jour où le site
changerait encore d'hôte, l'adresse du client ne suivrait pas.

---

## 2 · Le site de redirection — généré, pas écrit à la main

**`scripts/build-redirect.mjs`** → `release/redirect-ivanarsenov.de/public_html/`

Les deux hôtes sont **lus dans `site.config.mjs`**. Écrits en dur dans le
fichier de redirection, ils cesseraient de suivre au prochain changement et
la redirection pointerait vers l'ancien site — en 301, donc mise en cache par
les navigateurs, donc très difficile à rattraper.

Deux fichiers, rien d'autre :

**`.htaccess`** — une règle, sans condition. Sur ce domaine, *tout* doit
partir ; il n'y a aucune requête à servir sur place.

```apache
RewriteRule ^(.*)$ https://www.ivan-arsenov.de/$1 [R=301,L]
```

`$1` reprend le chemin ; mod_rewrite réattache seul la chaîne de requête.
`R=301` est permanent : c'est lui qui transfère l'autorité acquise. Un 302 ne
la transférerait pas. Un repli `Redirect 301` couvre le cas où mod_rewrite
serait absent.

**`index.html`** — page de repli servie uniquement si Apache n'applique pas
le `.htaccess`. Rafraîchissement immédiat, `canonical` vers la cible, aucun
contenu éditorial.

### Pourquoi il n'y a PAS de `noindex`

C'est le point contre-intuitif de ce TR, et il a failli m'échapper : la
première version du générateur posait `X-Robots-Tag: noindex` sur la
redirection. Le raisonnement semblait évident — ce domaine ne doit pas être
indexé, donc on l'interdit.

Il est faux. **Une 301 ne demande pas à être désindexée, elle demande à être
suivie** : elle dit « cette page vit désormais là-bas, reporte dessus ce que
tu lui accordais ». Les deux instructions se contredisent. Quand un moteur
fusionne l'ancienne URL avec la nouvelle — ce que la 301 lui demande
justement de faire — le `noindex` peut accompagner la fusion et s'appliquer à
la **cible**. On désindexerait le site principal pour protéger un domaine qui
ne sert rien.

La 301 suffit. L'ancienne URL sort de l'index d'elle-même une fois le
transfert constaté, et elle en sort **en ayant transmis son autorité** au
lieu de la perdre.

### ⚠️ Le certificat SSL du domaine secondaire doit rester valide

Sans lui, un visiteur arrivant en `https://ivanarsenov.de` ne voit pas la
redirection mais une **erreur de certificat** — c'est-à-dire pire que
l'ancien site. Ne pas désactiver le SSL sur ce domaine sous prétexte qu'il ne
sert plus rien.

---

## 3 · ⛔ Point bloquant ouvert : SPF

**À vérifier avant de compter sur le formulaire.**

L'expéditeur suit le nouvel hôte : `no-reply@ivan-arsenov.de`. Or ce domaine
publiait au 2026-08-29 :

```
v=spf1 a mx include:_spf.hostnet.nl -all
```

Le `-all` final est un **rejet dur**, pas un filtrage. Si l'IP du serveur
Hostinger qui envoie n'est couverte par aucun mécanisme, les demandes d'offre
ne partiront pas en indésirable : elles seront **refusées**. Le formulaire,
lui, annoncera un envoi réussi.

Ce qui décide : le mécanisme `a` résout l'enregistrement A d'
`ivan-arsenov.de` **nu**, sans `www`.

```sh
dig +short A   ivan-arsenov.de     # doit nommer l'IP qui envoie
dig +short TXT ivan-arsenov.de
```

- l'IP est celle du serveur web Hostinger → **couvert**, rien à faire ;
- l'IP est encore celle de Hostnet (`91.184.0.200`), seul `www` ayant
  basculé → **non couvert**, et le formulaire est muet.

Correctif le cas échéant : ajouter `ip4:<IP Hostinger>` au SPF du domaine.
**Ne pas** remplacer `-all` par `~all` pour contourner — ce serait affaiblir
la protection d'un domaine de messagerie réel pour masquer une IP manquante.

> **Ce point n'a pas pu être vérifié depuis la session** : la sortie DNS y est
> fermée (même `example.com` échoue). Il est reporté ici parce qu'il est
> bloquant, pas parce qu'il est douteux.

---

## 4 · Vérifications passées

Toutes relancées après la bascule, sur le nouvel hôte :

| Porte | Résultat |
| --- | --- |
| `npm run check` | **0 erreur** |
| `npm run qa:artifact` | **532/532** · 0 bloquant · 0 avertissement |
| `npm run qa:routes` | 16/16 routes · canonical auto-référente · hreflang réciproques |
| `npm test` | **827 passés**, 1 échec — voir ci-dessous |
| Générateur de redirection | `ivanarsenov.de → www.ivan-arsenov.de` |

La porte `qa:artifact` vérifie notamment, fichier par fichier, qu'**aucune
URL de l'artefact ne mentionne le domaine secondaire** — seules les adresses
e-mail peuvent le porter. Ce contrôle a changé de cible tout seul : il lit
`FOREIGN_APEX`, qui se recalcule depuis `SITE_HOST`.

### L'échec restant n'est pas lié à la bascule

`tests/featured.spec.ts:44` — « la piste est atteignable et défilable au
clavier », sur mobile uniquement.

**Je dois corriger ce que j'ai écrit précédemment à son sujet.** Je l'avais
qualifié d'instabilité de charge parallèle, en indiquant qu'il passait 3 fois
sur 3 en isolation. Relancé isolément aujourd'hui, il échoue **2 fois sur 3**.
Ce n'est pas une instabilité d'ordonnancement : c'est un défaut réel.

Mesuré sur la page, sur mobile :

| | valeur |
| --- | --- |
| largeur de la piste | 2 452 px |
| largeur visible | 412 px |
| débordement | 2 040 px |
| `scrollLeft` après deux flèches | **2 px**, ou 63 px, ou 0 |

La cause est identifiée. Sous 768 px, `src/scripts/track.ts` rend la main
dès l'entrée (`window.innerWidth < 768`) : la piste est volontairement
manuelle, puisque le doigt la manipule naturellement. Les flèches retombent
donc sur le défilement natif du conteneur, et la piste porte
`scroll-snap-type: x proximity`. Deux pressions déplacent d'environ 80 px ;
l'accrochage par proximité ramène souvent au point de départ. Le test lit
alors `0` et échoue.

**Conséquence réelle, au-delà du test** : au clavier, sur mobile, deux
pressions ne font pas avancer la piste. C'est un défaut d'accessibilité, pas
seulement un test fragile.

**Non corrigé ici, délibérément** : la correction touche le comportement
d'interaction d'un composant conçu, et n'a rien à voir avec une migration de
domaine. Les mêler dans un même commit rendrait l'un et l'autre plus
difficiles à relire et à annuler. À traiter dans son propre TR.

---

## 5 · Ce que l'intégrateur doit faire

### 5.1 Site principal — `www.ivan-arsenov.de`

Déjà livré et téléversé. Le paquet de cette version remplace le précédent :
le contenu est identique, seule l'origine change.

### 5.2 Domaine secondaire — `ivanarsenov.de`

1. **Vider** son `public_html` — et uniquement le sien. ⚠️ Le compte
   Hostinger héberge aussi `sospneu74.com`, sans rapport avec ce projet.
2. Y déposer les **deux fichiers** du paquet de redirection
   (`.htaccess` et `index.html`).
3. **Laisser le SSL actif** (§ 2).

### 5.3 Contrôler — une seule redirection, pas deux

```sh
curl -sI https://ivanarsenov.de/drinks/ | grep -i '^location'
# attendu : location: https://www.ivan-arsenov.de/drinks/
```

Le chemin doit être **préservé**. S'il tombe sur la racine, c'est le repli
`index.html` qui a répondu et non le `.htaccess` : mod_rewrite n'est pas actif.

> **Un saut de redirection supplémentaire est attendu** et n'est pas une
> anomalie : l'option « Force HTTPS » de hPanel s'exécute avant mod_rewrite.
> Relevé sur l'ancien domaine en août, il avait été décidé de la laisser —
> aucun en-tête HSTS n'étant publié, elle reste la garantie que `http` ne
> soit jamais servi en clair.

### 5.4 Search Console

Déclarer **les deux** domaines en propriété de type *Domaine* (validation DNS
par enregistrement TXT) :

- `ivan-arsenov.de` — le nouveau. Y soumettre `sitemap-index.xml`.
- `ivanarsenov.de` — l'ancien. Sans cette propriété, la bascule ne se voit
  pas : c'est lui qui est indexé aujourd'hui.

Les deux resteront vides un jour ou deux — Search Console n'affiche rien de
rétroactif sur une propriété neuve.
