/**
 * GÉNÉRATEUR DE LA CONFIGURATION NGINX (hébergement sur VPS).
 *
 * Le site a été construit pour Apache : tout ce qui le tient — canonicalisation
 * d'hôte, forçage HTTPS, en-têtes de sécurité, cache, page 404, protection du
 * fichier de configuration du formulaire — vit dans un `.htaccess`.
 *
 * Sur nginx, `.htaccess` n'est pas lu. Pas « partiellement » : pas du tout, et
 * SANS AUCUN AVERTISSEMENT. Le site s'afficherait parfaitement tout en ayant
 * perdu sa redirection canonique, sa CSP et le refus de servir
 * `config.local.php`. C'est le genre de panne qui ne se voit pas à l'œil.
 *
 * Ce fichier traduit donc `deploy/htaccess.template` en nginx, directive par
 * directive. Les écarts volontaires sont commentés sur place : il y en a
 * trois, et aucun n'est un oubli.
 *
 * Les hôtes sont LUS DEPUIS `site.config.mjs`, jamais saisis ici — même raison
 * que partout ailleurs dans ce dépôt : écrits en dur, ils cesseraient de
 * suivre au premier changement, et une redirection 301 fausse se met en cache
 * dans les navigateurs.
 *
 * Exécution : node scripts/build-nginx.mjs
 * Sortie    : release/nginx/
 */

import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { FOREIGN_APEX, SITE_APEX, SITE_HOST } from '../site.config.mjs';

const OUT = resolve(process.cwd(), 'release', 'nginx');

/** Racine servie. Modifiable ici seulement — le document de procédure la cite. */
const ROOT = `/var/www/${SITE_APEX}/public_html`;

/** Socket PHP-FPM. La version est vérifiée par la procédure, pas devinée. */
const FPM_SOCKET = '/run/php/php8.3-fpm.sock';

/** Racine dédiée aux défis ACME, servie en clair sur le port 80. */
const ACME_ROOT = '/var/www/acme';

/** Tous les noms qui doivent atterrir sur ce VPS. */
const CANONICAL = SITE_HOST;
const SECONDARY = [SITE_APEX, `www.${FOREIGN_APEX}`, FOREIGN_APEX].filter(
  (name) => name !== CANONICAL,
);
const ALL_NAMES = [CANONICAL, ...SECONDARY];

const banner = (title) => `# ==========================================================================
# ${title}
#
# ⚠️ FICHIER GÉNÉRÉ — ne pas éditer sur le serveur.
#    Source : scripts/build-nginx.mjs, hôtes lus dans site.config.mjs
#    Une correction faite ici serait perdue à la prochaine génération ; la
#    faire dans le dépôt, régénérer, redéployer.
# ==========================================================================`;

/* ────────────────────────────────────────────────────────────────────────
 * En-têtes de sécurité — dans un fichier séparé, et ce n'est pas du zèle.
 *
 * PIÈGE NGINX : `add_header` n'est hérité par un bloc `location` que si ce
 * bloc n'a AUCUN `add_header` à lui. Dès qu'une `location` en ajoute un seul
 * — ne serait-ce que `Cache-Control` — elle perd d'un coup TOUS ceux du
 * serveur : CSP, nosniff, Referrer-Policy. Silencieusement.
 *
 * D'où ce fragment, ré-inclus dans chaque `location` qui pose un en-tête.
 * Le recopier à la main serait la garantie qu'une copie diverge un jour.
 * ──────────────────────────────────────────────────────────────────────── */
const headers = `${banner('EN-TÊTES DE SÉCURITÉ — fragment ré-inclus, voir le commentaire')}

# À inclure dans le bloc \`server\` ET dans chaque \`location\` qui pose un
# \`add_header\` de son côté. Voir scripts/build-nginx.mjs pour le pourquoi.

add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), interest-cohort=()" always;

# Le site ne charge AUCUNE ressource tierce : la politique peut être stricte
# sans rien casser. \`form-action 'self'\` verrouille la cible du formulaire.
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'self'; base-uri 'self'; object-src 'none'" always;

# ── HSTS — DÉLIBÉRÉMENT DÉSACTIVÉ ───────────────────────────────────────
# À n'activer qu'une fois le site stable en HTTPS sur les deux domaines.
# C'est une porte à sens unique : le navigateur mémorise l'instruction pour
# la durée annoncée et REFUSERA ensuite tout accès en clair, y compris si le
# certificat expire. Un an d'inaccessibilité pour un renouvellement manqué.
# add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
`;

/* ────────────────────────────────────────────────────────────────────────
 * Site principal.
 * ──────────────────────────────────────────────────────────────────────── */
const site = `${banner(`${CANONICAL} — SITE PRINCIPAL`)}

# ⚠️ \`http2 on;\` exige nginx 1.25.1 ou plus récent. Sur une version
#    antérieure, nginx REFUSE DE DÉMARRER : retirer les trois lignes
#    \`http2 on;\` et écrire \`listen 443 ssl http2;\` à la place.
#    Vérifier avec : nginx -v

# ── Barre finale obligatoire ─────────────────────────────────────────────
# ÉCART ASSUMÉ nº 3 : rien de tel dans le \`.htaccess\`, parce qu'Apache le
# faisait tout seul — mod_dir renvoie de lui-même /drinks vers /drinks/.
# nginx ne le fait pas dans cette configuration ; omettre ce bloc laisserait
# donc DEUX URL servir la même page, ce que les canonicals passent leur
# temps à empêcher. Le site est construit avec \`trailingSlash: 'always'\` :
# /drinks/ est la seule forme canonique.
#
# Règle : pas de point dans le chemin (donc pas d'extension, donc une page)
# et pas de barre finale. /drinks → oui ; /favicon.svg, /_astro/x.abc.webp,
# /api/enquiry.php → non.
#
# Contrepartie acceptée : une adresse inexistante sans point, /nimporte,
# part en 301 vers /nimporte/ avant de rendre 404. Deux requêtes au lieu
# d'une, pour une page qui n'existe pas — le prix est nul, et la règle reste
# lisible.
#
# Un \`map\` plutôt qu'un \`if\` imbriqué : il s'évalue une fois, hors de tout
# bloc, et se lit sans connaître l'ordre des directives.
map $uri $ia_wants_slash {
    default        0;
    ~^/[^.]*[^/]$  1;
}

# ── Port 80 ──────────────────────────────────────────────────────────────
# Un seul saut : http://n'importe lequel des 4 noms → https://canonique.
# La chaîne de requête est conservée par $request_uri.
server {
    listen      80;
    listen      [::]:80;
    server_name ${ALL_NAMES.join(' ')};

    # ⚠️ AVANT la redirection, sinon le renouvellement du certificat échoue.
    # Let's Encrypt appelle cette URL EN CLAIR ; une 301 vers https la ferait
    # échouer, et l'erreur n'apparaîtrait que 90 jours plus tard.
    location ^~ /.well-known/acme-challenge/ {
        root         ${ACME_ROOT};
        default_type "text/plain";
    }

    location / {
        return 301 https://${CANONICAL}$request_uri;
    }
}

# ── Port 443, domaines NON canoniques ────────────────────────────────────
# Ils doivent répondre en HTTPS — et donc porter un certificat valide — rien
# que pour pouvoir rediriger. Un visiteur qui tape https://${SECONDARY[0] ?? ''}
# sans certificat ne verrait pas la redirection mais une erreur de sécurité,
# c'est-à-dire pire que l'ancien site.
server {
    listen      443 ssl;
    listen      [::]:443 ssl;
    http2       on;
    server_name ${SECONDARY.join(' ')};

    ssl_certificate     /etc/letsencrypt/live/${SITE_APEX}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${SITE_APEX}/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://${CANONICAL}$request_uri;
}

# ── Port 443, le site ────────────────────────────────────────────────────
server {
    listen      443 ssl;
    listen      [::]:443 ssl;
    http2       on;
    server_name ${CANONICAL};

    ssl_certificate     /etc/letsencrypt/live/${SITE_APEX}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${SITE_APEX}/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    root  ${ROOT};
    index index.html;

    # Équivalent de \`Options -Indexes\` : aucun listage de répertoire.
    autoindex off;

    # Astro sort la 404 en /404.html À LA RACINE, et non en /404/index.html,
    # malgré \`format: 'directory'\`. Pointer sur le second rendait une erreur
    # serveur à la place de la page d'erreur — défaut relevé par l'audit de
    # l'artefact, invisible à la lecture des sources.
    error_page 404 /404.html;

    client_max_body_size 1m;

    include snippets/${SITE_APEX}-headers.conf;

    # ── Compression ──────────────────────────────────────────────────────
    gzip            on;
    gzip_vary       on;
    gzip_proxied    any;
    gzip_min_length 1024;
    gzip_types      text/plain text/css text/javascript application/javascript
                    application/json image/svg+xml application/xml
                    application/rss+xml;

    if ($ia_wants_slash) {
        return 301 https://${CANONICAL}$uri/$is_args$args;
    }

    # ── Formulaire de demande d'offre ────────────────────────────────────
    # ÉCART ASSUMÉ nº 1 : le \`.htaccess\` interdisait de SERVIR
    # config.local.php ; ici on va plus loin — un seul fichier PHP est
    # exécutable, nommément. Tout autre .php rend 404, qu'il existe ou non.
    # Une liste blanche vaut mieux qu'une liste noire : elle couvre aussi les
    # fichiers qu'on n'a pas prévus.
    location = /api/enquiry.php {
        include snippets/${SITE_APEX}-headers.conf;
        add_header X-Robots-Tag "noindex" always;

        include      snippets/fastcgi-php.conf;
        fastcgi_pass unix:${FPM_SOCKET};
    }

    location ~ \\.php$ {
        return 404;
    }

    # ── Cache ────────────────────────────────────────────────────────────
    # ÉCART ASSUMÉ nº 2 : le \`.htaccess\` ne donnait le cache long qu'aux
    # polices et aux images. Les .css et .js de /_astro/ portent pourtant la
    # même empreinte dans leur nom et sont tout aussi immuables — ils en
    # étaient privés. Ici, tout /_astro/ est couvert, ce qui est la raison
    # d'être de ce dossier.
    #
    # Pas de directive \`expires\` dans ces blocs, et c'est volontaire :
    # \`expires\` émet SON PROPRE \`Cache-Control\`. Combinée à l'\`add_header\`
    # ci-dessous, elle produirait DEUX en-têtes \`Cache-Control\` sur la même
    # réponse — un cas que la norme ne tranche pas et que les caches
    # intermédiaires résolvent chacun à leur façon. Un seul en-tête, écrit
    # une fois, et \`immutable\` conservé.
    location ^~ /_astro/ {
        include    snippets/${SITE_APEX}-headers.conf;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        access_log off;
        try_files  $uri =404;
    }

    # Polices et images hors /_astro/ : même raisonnement, nom stable.
    location ~* \\.(?:woff2|avif|webp|png|jpe?g|svg|ico)$ {
        include    snippets/${SITE_APEX}-headers.conf;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        access_log off;
        try_files  $uri =404;
    }

    # Le HTML n'est jamais mis en cache durablement : une correction de
    # contenu doit être visible immédiatement.
    location ~* \\.html$ {
        include    snippets/${SITE_APEX}-headers.conf;
        add_header Cache-Control "public, max-age=0, must-revalidate" always;
    }

    # ── Fichiers cachés ──────────────────────────────────────────────────
    # Équivalent du \`<Files ~ "^\\.">\` Apache. Le .htaccess téléversé avec
    # l'artefact tombe aussi ici : inutile sur nginx, et inutile à exposer.
    location ~ /\\. {
        deny all;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
`;

await rm(OUT, { recursive: true, force: true });
await mkdir(join(OUT, 'snippets'), { recursive: true });
await writeFile(join(OUT, `${SITE_APEX}.conf`), site);
await writeFile(join(OUT, 'snippets', `${SITE_APEX}-headers.conf`), headers);

console.log(`  canonique : ${CANONICAL}`);
console.log(`  redirigés : ${SECONDARY.join(', ')}`);
console.log(`  racine    : ${ROOT}`);
console.log(`  écrit dans ${OUT}`);
