# HÉBERGEMENT SUR VPS — PROCÉDURE

**VPS `76.13.44.177`**, servant `www.ivan-arsenov.de` (canonique) et
`www.ivanarsenov.de` (redirigé), plus les deux formes nues.

Établi le **2026-10-29**. Destinataires : Ivan Arsenov, l'intégrateur.

---

## 0 · Ce qui change vraiment, et le piège principal

Déplacer des fichiers d'un hébergement mutualisé vers un VPS ressemble à une
copie. Ce n'en est pas une.

> ### ⛔ `.htaccess` EST DU APACHE. NGINX NE LE LIT PAS.
>
> Pas « partiellement » : **pas du tout, et sans le moindre avertissement**.
>
> Or c'est ce fichier qui porte aujourd'hui la redirection canonique, le
> forçage HTTPS, la politique de sécurité du contenu, les en-têtes de cache,
> la page 404 et le refus de servir `config.local.php`.
>
> Téléversé tel quel sur un VPS en nginx, **le site s'afficherait
> parfaitement** — tout en ayant perdu chacune de ces protections. C'est une
> panne invisible à l'œil : il faut la chercher pour la voir.

La configuration nginx équivalente est donc **générée** :

```sh
node scripts/build-nginx.mjs
```

→ `release/nginx/ivan-arsenov.de.conf` et
`release/nginx/snippets/ivan-arsenov.de-headers.conf`

Les hôtes y sont lus dans `site.config.mjs`, jamais saisis. Trois écarts
volontaires par rapport au `.htaccess` sont signalés dans le fichier lui-même
(liste blanche PHP, cache de `/_astro/`, barre finale) — ce sont des écarts
assumés, pas des oublis.

### Si votre VPS tourne sous Apache

Alors rien de tout cela n'est nécessaire : le `.htaccess` livré dans le `.zip`
fonctionne tel quel. Il faut seulement activer `mod_rewrite`, `mod_headers`,
`mod_expires`, `mod_deflate` et autoriser `AllowOverride All` sur le
répertoire. Vérifier avec `apachectl -M`.

---

## 1 · Les deux domaines : qui sert, qui redirige

Vous demandez que le site réponde sur `https://www.ivanarsenov.de/` **et**
`https://www.ivan-arsenov.de/`. Les deux répondront. Mais **un seul servira
le contenu** — l'autre redirige en 301.

C'est la décision prise le 2026-10-10 (`doc/tr-031-domaine-principal.md`), et
elle tient toujours : deux domaines qui servent le **même** contenu se
concurrencent à l'indexation, dispersent l'autorité acquise et obligent à
choisir une adresse canonique de toute façon — autant que ce soit vous qui
choisissiez plutôt qu'un moteur de recherche.

| Nom | Rôle |
| --- | --- |
| `www.ivan-arsenov.de` | **sert le site** |
| `ivan-arsenov.de` | 301 → `www.ivan-arsenov.de` |
| `www.ivanarsenov.de` | 301 → `www.ivan-arsenov.de` |
| `ivanarsenov.de` | 301 → `www.ivan-arsenov.de` |

Les quatre portent un certificat, parce qu'**un domaine sans certificat
valide ne peut même pas rediriger** : le navigateur affiche une erreur de
sécurité avant d'avoir lu la redirection.

> Si vous vouliez réellement que les deux domaines servent le contenu de
> façon indépendante, dites-le — c'est faisable, mais cela demande de
> reconstruire le site deux fois avec des canonicals distincts, et ce n'est
> pas ce que je recommande.

---

## 2 · DNS — à faire en premier, et à laisser reposer

Chez le registraire de chaque domaine, **enregistrements A** :

| Nom | Type | Valeur |
| --- | --- | --- |
| `@` (ivan-arsenov.de) | A | `76.13.44.177` |
| `www` | A | `76.13.44.177` |
| `@` (ivanarsenov.de) | A | `76.13.44.177` |
| `www` | A | `76.13.44.177` |

Supprimer les anciens A/AAAA/CNAME qui pointaient vers Hostinger. Un AAAA
oublié est une panne intermittente : les visiteurs en IPv6 iraient encore
chez l'ancien hébergeur.

### ⚠️ Ne touchez PAS aux enregistrements MX

La messagerie `info@ivan-arsenov.de` est chez un autre fournisseur et doit y
rester. **Changer le A n'affecte pas la réception du courrier** — c'est le MX
qui la gouverne, et lui seul. C'est une peur fréquente et infondée.

### Mais changer le A déplace bien le SPF

`ivan-arsenov.de` publie :

```
v=spf1 a mx include:_spf.hostnet.nl -all
```

Le mécanisme `a` autorise **l'IP de l'enregistrement A du domaine**. En le
faisant pointer sur `76.13.44.177`, vous autorisez *automatiquement* le VPS à
envoyer au nom du domaine. C'est un effet de bord heureux — mais il ne suffit
pas, voir § 6.

### Vérifier avant d'aller plus loin

```sh
dig +short A www.ivan-arsenov.de   # 76.13.44.177
dig +short A ivan-arsenov.de       # 76.13.44.177
dig +short A www.ivanarsenov.de    # 76.13.44.177
dig +short A ivanarsenov.de        # 76.13.44.177
dig +short MX ivan-arsenov.de      # INCHANGÉ
```

**Les quatre doivent répondre avant de demander un certificat.** Let's
Encrypt vérifie la possession par le DNS public ; une propagation incomplète
fait échouer la demande, et cinq échecs par heure déclenchent une limitation
temporaire.

> **Confirmez d'abord que `76.13.44.177` est bien l'adresse publique de votre
> VPS** (`curl -s ifconfig.me` depuis le serveur). Je n'ai pas pu le vérifier
> : la sortie réseau de ma session est fermée. Pointer quatre domaines vers
> une IP erronée est long à rattraper, les enregistrements étant mis en cache.

---

## 3 · Préparer le serveur

Debian/Ubuntu. Tout en `sudo`.

```sh
apt update
apt install -y nginx php8.3-fpm php8.3-mbstring certbot python3-certbot-nginx rsync
nginx -v          # ≥ 1.25.1 pour `http2 on;` — sinon voir l'en-tête du .conf
php -v            # si ce n'est pas 8.3, corriger fastcgi_pass dans le .conf
```

`php8.3-mbstring` n'est pas facultatif : `enquiry.php` utilise `mb_substr`
pour tronquer les champs. Sans elle, l'endpoint renvoie une erreur 500 à
chaque envoi.

```sh
mkdir -p /var/www/ivan-arsenov.de/public_html /var/www/acme
ufw allow 'Nginx Full' && ufw allow OpenSSH && ufw enable
```

---

## 4 · Déposer le site — par git, sans `.zip`

### Pourquoi un `git clone` du dépôt ne suffit pas

Le dépôt contient la **source** Astro. `dist/` est dans `.gitignore` : il n'y
a **aucune page servable dedans**. Cloné tel quel sur le serveur, il faudrait
y installer Node, 322 Mo de dépendances et assez de mémoire pour traiter 92
images — et une construction qui échoue bloquerait alors la machine qui sert
le site.

La chaîne retenue sépare les deux :

```
  dépôt (source)  ──GitHub Actions──▶  branche deploy/production  ──git pull──▶  VPS
                      construit                 public_html/                    sert
                      + audite                  uniquement
```

GitHub Actions construit, **passe la porte d'audit de l'artefact**, puis
publie le résultat sur `deploy/production`. Si la construction est fautive,
elle échoue chez GitHub et la branche que le serveur suit ne bouge pas.

Le serveur n'a plus besoin que de `git`.

### 4.1 Déclencher la première construction

Le flux est dans `.github/workflows/deploy-build.yml`. Il part à chaque
poussée sur la branche par défaut, et à la demande depuis l'onglet
**Actions → Construire et publier le site → Run workflow**.

**La branche `deploy/production` est créée à la première exécution.** Tant
qu'elle n'existe pas, l'étape 4.3 n'a rien à cloner.

> Le dépôt est **public**. Aucune clé, aucun jeton n'est nécessaire sur le
> serveur pour lire. En contrepartie : rien de confidentiel ne doit jamais y
> être commité. `config.local.php` est dans `.gitignore`, et c'est une ligne
> à ne pas retirer.

### 4.2 La configuration du formulaire va hors de la racine web

```sh
mkdir -p /etc/ivan-arsenov
# y déposer config.local.php (modèle : deploy/config.local.php.example)
chown root:www-data /etc/ivan-arsenov/config.local.php
chmod 640 /etc/ivan-arsenov/config.local.php
```

**Ce déplacement est obligatoire avec un déploiement par git**, pas une
préférence de rangement. Le script de mise à jour exécute `git clean -fd`,
qui efface tout fichier non suivi de l'arborescence. Laissée dans
`public_html/api/`, la configuration disparaîtrait **à la première mise à
jour** — et le formulaire se mettrait à refuser les demandes sans que rien ne
l'annonce.

`enquiry.php` cherche donc `/etc/ivan-arsenov/config.local.php` **en
premier**, et retombe sur `__DIR__` pour l'hébergement mutualisé. Les deux
fonctionnent.

### 4.3 Installer le script de déploiement

```sh
curl -fsSL https://raw.githubusercontent.com/redaboutaa-sketch/sitepremiuim/\
claude/premium-website-factory-iqri35/deploy/vps-pull.sh \
  -o /usr/local/bin/ivan-deploy
chmod 755 /usr/local/bin/ivan-deploy
```

Puis, à chaque mise en ligne :

```sh
ivan-deploy
```

Il tire la branche, remet les droits, recharge PHP-FPM et affiche la sonde du
formulaire. Le dépôt est cloné dans `/var/www/ivan-arsenov.de/`, de sorte que
`public_html/` s'y trouve exactement là où nginx l'attend — **et que `.git`
reste hors de ce qui est servi**. Cloner directement dans la racine web
exposerait l'historique complet à qui demanderait `/.git/config`.

### Revenir en arrière

L'historique de `deploy/production` est conservé : chaque mise en ligne y est
un commit.

```sh
cd /var/www/ivan-arsenov.de
git fetch --unshallow origin deploy/production   # une seule fois
git log --oneline -10
git checkout <sha-précédent> -- public_html
chown -R www-data:www-data public_html
```

### La voie manuelle reste valable

Si vous préférez ne pas utiliser GitHub Actions, construisez sur votre poste
et synchronisez :

```sh
npm ci && npm run build && npm run qa:artifact
rsync -av --delete dist/ root@76.13.44.177:/var/www/ivan-arsenov.de/public_html/
chown -R www-data:www-data /var/www/ivan-arsenov.de/public_html
```

La configuration vivant désormais hors de la racine, `--delete` ne risque
plus de l'emporter.

> Le `.htaccess` livré avec le site est inerte sous nginx. La configuration
> le rend inaccessible (`location ~ /\.`) ; le supprimer est aussi acceptable.

---

## 5 · Installer la configuration nginx

```sh
# depuis le dépôt, sur votre poste
node scripts/build-nginx.mjs
scp release/nginx/ivan-arsenov.de.conf \
    root@76.13.44.177:/etc/nginx/sites-available/
scp release/nginx/snippets/ivan-arsenov.de-headers.conf \
    root@76.13.44.177:/etc/nginx/snippets/
```

Sur le serveur :

```sh
ln -sf /etc/nginx/sites-available/ivan-arsenov.de.conf \
       /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default    # sinon il capte les requêtes non nommées
```

### Le certificat — l'ordre compte

La configuration livrée référence des chemins de certificat **qui n'existent
pas encore**. `nginx -t` échouera donc tant que le certificat n'est pas émis,
et c'est normal, pas un défaut de la configuration.

Obtenir d'abord le certificat avec une configuration minimale en clair :

```sh
certbot certonly --webroot -w /var/www/acme \
  -d ivan-arsenov.de -d www.ivan-arsenov.de \
  -d ivanarsenov.de  -d www.ivanarsenov.de \
  --cert-name ivan-arsenov.de \
  --agree-tos -m info@ivan-arsenov.de --no-eff-email
```

`--cert-name ivan-arsenov.de` **n'est pas décoratif** : il fixe le nom du
répertoire `/etc/letsencrypt/live/…` que la configuration référence. Sans
lui, certbot choisit un nom à partir du premier domaine et les chemins ne
correspondent plus.

> Si `--webroot` échoue parce que rien n'écoute encore sur le port 80,
> utiliser `certbot certonly --standalone` après avoir arrêté nginx, puis le
> relancer. Le renouvellement automatique, lui, passera par `--webroot` grâce
> au bloc `acme-challenge` de la configuration.

Puis activer :

```sh
nginx -t && systemctl reload nginx
certbot renew --dry-run     # vérifie le renouvellement AVANT qu'il soit urgent
```

---

## 6 · Le formulaire — le point le plus fragile

`api/enquiry.php` utilise `mail()`, qui remet le message à un agent local. Sur
un mutualisé il y en avait un ; **sur un VPS neuf, il n'y en a aucun**.
`mail()` renvoie alors `false`, l'endpoint rend 502, et la demande d'offre est
perdue.

Deux routes. La première est nettement préférable.

### Option A — relayer par le fournisseur de messagerie *(recommandée)*

Le message part de la boîte réelle, authentifié. SPF et DKIM sont déjà
alignés pour elle : **rien à changer dans le DNS**, et aucune question de
réputation d'IP.

```sh
apt install -y msmtp msmtp-mta
```

`/etc/msmtprc` (droits `600`, `root:root`) :

```
defaults
auth           on
tls            on
tls_trust_file /etc/ssl/certs/ca-certificates.crt
logfile        /var/log/msmtp.log

account        ivan
host           <serveur SMTP du fournisseur de la boîte>
port           587
from           no-reply@ivan-arsenov.de
user           <identifiant>
password       <mot de passe>

account default : ivan
```

Puis dans `/etc/php/8.3/fpm/php.ini` :

```ini
sendmail_path = /usr/bin/msmtp -t
```

`systemctl restart php8.3-fpm`.

> Beaucoup de fournisseurs exigent que `from` soit **exactement** une boîte
> existante. Si `no-reply@ivan-arsenov.de` n'existe pas, soit on la crée,
> soit on bascule `sender` sur `info@ivan-arsenov.de` dans
> `api/config.local.php`. Le prospect reste joignable dans les deux cas :
> `enquiry.php` le met en `Reply-To`, jamais en `From`.

### Option B — envoyer depuis le VPS

```sh
apt install -y postfix        # « Internet Site », nom : ivan-arsenov.de
```

Trois réserves, à peser avant de choisir cette route :

1. **Le port 25 sortant est bloqué par défaut chez beaucoup d'hébergeurs.**
   À vérifier auprès du vôtre ; sinon rien ne part, sans message d'erreur
   clair.
2. **Réputation.** Une IP de VPS sans historique d'envoi est souvent classée
   en indésirable pendant des semaines.
3. **SPF.** Le `a` d'`ivan-arsenov.de` pointera sur le VPS (§ 2), donc
   l'autorisation existe. Mais la politique se termine par `-all` — un
   **rejet dur** : si l'IP d'envoi diffère de celle du A (relais sortant,
   IPv6), les messages sont **refusés**, pas filtrés.

Ne jamais passer `-all` à `~all` pour contourner : ce serait affaiblir la
protection d'un domaine de messagerie réel pour masquer une IP manquante.

### Vérifier

```sh
curl -s 'https://www.ivan-arsenov.de/api/enquiry.php?probe=1'
# attendu : {"delivery":"ready"}
```

> **La sonde ne prouve pas l'envoi.** Elle dit seulement que le fichier de
> configuration est lisible et renseigné. La seule preuve est **une demande
> réelle, reçue dans la boîte**, dont l'en-tête porte `spf=pass`. Tant que ce
> message n'est pas arrivé, le formulaire n'est pas validé.

---

## 7 · Contrôles de recette

À passer **tous**, dans cet ordre.

```sh
# 1 — le site répond, sur le nom canonique
curl -sI https://www.ivan-arsenov.de/ | head -1          # HTTP/2 200

# 2 — les trois autres noms redirigent, chemin préservé
for h in ivan-arsenov.de www.ivanarsenov.de ivanarsenov.de; do
  echo -n "$h → "; curl -sI "https://$h/drinks/" | grep -i '^location'
done
# attendu à chaque fois : https://www.ivan-arsenov.de/drinks/

# 3 — http part en https en UN seul saut
curl -sI http://ivanarsenov.de/drinks/ | grep -i '^location'
# attendu : https://www.ivan-arsenov.de/drinks/   (et non http://www.…)

# 4 — barre finale
curl -sI https://www.ivan-arsenov.de/drinks | grep -i '^location'
# attendu : https://www.ivan-arsenov.de/drinks/

# 5 — en-têtes de sécurité présents SUR UNE PAGE
curl -sI https://www.ivan-arsenov.de/ | grep -iE 'content-security|nosniff|referrer|frame-options'

# 6 — et aussi sur un asset mis en cache (le piège add_header)
curl -sI https://www.ivan-arsenov.de/favicon.svg | grep -iE 'content-security|cache-control'
#   un SEUL cache-control, et la CSP doit être là

# 7 — la 404 rend bien la page, pas une erreur serveur
curl -sI https://www.ivan-arsenov.de/nexistepas/ | head -1   # HTTP/2 404

# 8 — la configuration du formulaire n'est pas servie
curl -s -o /dev/null -w '%{http_code}\n' \
     https://www.ivan-arsenov.de/api/config.local.php        # 404

# 9 — aucun listage de répertoire
curl -s -o /dev/null -w '%{http_code}\n' \
     https://www.ivan-arsenov.de/_astro/                     # 403 ou 404

# 10 — la sonde du formulaire
curl -s 'https://www.ivan-arsenov.de/api/enquiry.php?probe=1'
```

Puis, depuis le dépôt :

```sh
npm run qa:remote          # audit distant complet
npm run qa:remote:e2e      # parcours réels au navigateur
npm run qa:csp
```

Ces trois commandes lisent l'hôte dans `site.config.mjs` : elles visent
automatiquement le bon domaine.

Enfin : **un envoi réel du formulaire**, et la lecture de l'en-tête
`Authentication-Results` du message reçu.

---

## 8 · Ce qui reste ouvert

| Point | État |
| --- | --- |
| `76.13.44.177` est bien l'IP publique du VPS | **à confirmer** — non vérifiable depuis ma session |
| Le VPS tourne nginx ou Apache | **à confirmer** — la procédure couvre les deux |
| Port 25 sortant ouvert (option B uniquement) | à vérifier auprès de l'hébergeur |
| `spf=pass` constaté sur un envoi réel | **non constaté** |
| Documents d'autorisation des marques | à archiver (antérieur) |
| Les 14 photos produit restent générées | à remplacer par des packshots presse (antérieur) |
| Relecture juridique des mentions | recommandée (antérieur) |
