#!/usr/bin/env bash
#
# DÉPLOIEMENT SUR LE VPS — tire la branche `deploy/production` et l'installe.
#
# À poser en /usr/local/bin/ivan-deploy (chmod 755) et à lancer en root.
#
# Cette branche ne contient QUE `public_html/`, déjà construit et audité par
# le flux GitHub Actions. Le serveur n'a donc besoin ni de Node, ni des
# dépendances, ni d'assez de mémoire pour traiter les images.
#
# Le dépôt est cloné dans le PARENT de la racine servie, pas dedans :
#
#     /var/www/ivan-arsenov.de/          ← le dépôt, avec son .git
#     /var/www/ivan-arsenov.de/public_html/   ← ce que nginx sert
#
# Ce décalage d'un niveau n'est pas cosmétique : il met `.git` HORS de ce qui
# est servi. Cloner directement dans la racine web exposerait l'historique
# complet à qui demanderait /.git/config.
#
# La configuration du formulaire vit en /etc/ivan-arsenov/config.local.php,
# hors du dépôt : le `git clean` ci-dessous efface tout fichier non suivi de
# l'arborescence, et l'y laisser la ferait disparaître à chaque mise à jour.

set -euo pipefail

REPO="${IVAN_REPO:-https://github.com/redaboutaa-sketch/sitepremiuim.git}"
BRANCH="${IVAN_BRANCH:-deploy/production}"
TARGET="${IVAN_TARGET:-/var/www/ivan-arsenov.de}"
CONFIG="${IVAN_CONFIG:-/etc/ivan-arsenov/config.local.php}"
FPM="${IVAN_FPM:-php8.3-fpm}"

say() { printf '  %s\n' "$*"; }

[ "$(id -u)" -eq 0 ] || { echo 'À lancer en root.' >&2; exit 1; }

# ── Récupérer ────────────────────────────────────────────────────────────
if [ -d "$TARGET/.git" ]; then
  say "mise à jour de $TARGET"
  git -C "$TARGET" fetch --depth 1 origin "$BRANCH"
  BEFORE="$(git -C "$TARGET" rev-parse HEAD)"
  git -C "$TARGET" reset --hard FETCH_HEAD
  # Retire ce que la version précédente avait laissé. Sans cela, un fichier
  # supprimé de la construction resterait servi indéfiniment.
  git -C "$TARGET" clean -fd
  AFTER="$(git -C "$TARGET" rev-parse HEAD)"
  [ "$BEFORE" = "$AFTER" ] && say 'déjà à jour' || say "${BEFORE:0:7} → ${AFTER:0:7}"
else
  say "premier clonage dans $TARGET"
  mkdir -p "$(dirname "$TARGET")"
  git clone --depth 1 --branch "$BRANCH" "$REPO" "$TARGET"
fi

[ -d "$TARGET/public_html" ] || {
  echo "ERREUR : $TARGET/public_html absent. Mauvaise branche ?" >&2
  exit 1
}

# ── Le formulaire ────────────────────────────────────────────────────────
# `enquiry.php` cherche sa configuration hors racine web EN PREMIER. Son
# absence n'empêche pas le site de fonctionner : la sonde répondra
# "not-ready" et le formulaire refusera les envois au lieu de les accepter
# en silence. On avertit plutôt que d'échouer.
if [ ! -r "$CONFIG" ]; then
  say "⚠️  $CONFIG absent ou illisible — le formulaire refusera les envois."
fi

# ── Droits ───────────────────────────────────────────────────────────────
chown -R www-data:www-data "$TARGET/public_html"
find "$TARGET/public_html" -type d -exec chmod 755 {} +
find "$TARGET/public_html" -type f -exec chmod 644 {} +
[ -r "$CONFIG" ] && { chown root:www-data "$CONFIG"; chmod 640 "$CONFIG"; }

# `.git` ne doit pas être lisible par le serveur web. Il est déjà hors de la
# racine servie ; ceci ferme le cas d'une erreur de configuration nginx.
chmod 750 "$TARGET/.git"

# ── Recharger ────────────────────────────────────────────────────────────
# Les fichiers statiques n'ont rien à recharger. PHP, si : OPcache garde en
# mémoire la version précédente d'enquiry.php.
systemctl reload "$FPM" 2>/dev/null || say "⚠️  rechargement de $FPM impossible"

# ── Constater ────────────────────────────────────────────────────────────
say ''
say "déployé : $(git -C "$TARGET" rev-parse --short HEAD)"
say "fichiers : $(find "$TARGET/public_html" -type f | wc -l)"
say ''
say 'sonde du formulaire :'
curl -s 'https://www.ivan-arsenov.de/api/enquiry.php?probe=1' || true
say ''
say 'La sonde dit seulement que la configuration est lisible.'
say 'Elle NE PROUVE PAS qu’un message part ni qu’il arrive.'
