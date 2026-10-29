#!/bin/sh
#
# Prépare les fichiers de configuration montés depuis l'hôte, puis rend la
# main à l'image officielle.
#
# POURQUOI CETTE ÉTAPE EXISTE
#
# Deux fichiers viennent de l'hôte et doivent être lus DANS le conteneur par
# `www-data`. Or cet utilisateur n'a pas le même identifiant numérique
# partout : 33 sur Debian et Ubuntu, 82 sur Alpine. Un fichier posé en
# `640 root:www-data` sur l'hôte est donc illisible par le `www-data` de
# cette image — et la panne serait silencieuse : la sonde répondrait
# « not-ready » et le formulaire se désactiverait sans erreur.
#
# Plutôt que d'imposer à l'hôte de deviner le bon identifiant, on recopie au
# démarrage, avec le bon propriétaire. Le montage reste en lecture seule et
# l'hôte garde ses droits à lui.
#
# msmtp ajoute sa propre exigence : il REFUSE un fichier de configuration
# lisible par d'autres que son propriétaire dès lors qu'il contient un mot
# de passe. D'où la copie privée en 600.

set -e

SRC=/host-config

if [ -r "$SRC/config.local.php" ]; then
  mkdir -p /etc/ivan-arsenov
  install -o www-data -g www-data -m 400 \
    "$SRC/config.local.php" /etc/ivan-arsenov/config.local.php
else
  echo "⚠️  $SRC/config.local.php absent — le formulaire refusera les envois." >&2
fi

if [ -r "$SRC/msmtprc" ]; then
  install -o www-data -g www-data -m 600 "$SRC/msmtprc" /run/msmtprc
else
  echo "⚠️  $SRC/msmtprc absent — mail() échouera, l'endpoint rendra 502." >&2
fi

exec docker-php-entrypoint "$@"
