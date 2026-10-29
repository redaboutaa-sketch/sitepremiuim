# ==========================================================================
# PHP-FPM pour l'endpoint de demande d'offre.
#
# Deux ajouts à l'image officielle, et pas un de plus. Un conteneur qui sert
# un seul fichier PHP n'a pas besoin d'autre chose.
# ==========================================================================

FROM php:8.3-fpm-alpine

# ── mbstring ─────────────────────────────────────────────────────────────
# `enquiry.php` tronque chaque champ avec `mb_substr`. Sans l'extension,
# l'envoi finit en erreur 500 — le site s'affiche, seul le formulaire casse.
#
# Le test conditionnel n'est pas de la prudence gratuite : selon les
# versions, mbstring est tantôt compilé dans l'image officielle, tantôt non.
# Installer sans vérifier échoue dans le premier cas ; ne pas installer
# échoue dans le second. On constate, puis on agit.
RUN set -eux; \
    if ! php -m | grep -qi '^mbstring$'; then \
      apk add --no-cache --virtual .build-deps $PHPIZE_DEPS oniguruma-dev; \
      docker-php-ext-install mbstring; \
      runDeps="$(scanelf --needed --nobanner --format '%n#p' --recursive /usr/local/lib/php/extensions \
        | tr ',' '\n' | sort -u | awk 'system("[ -e /usr/local/lib/" $1 " ]") == 0 { next } { print "so:" $1 }')"; \
      apk add --no-cache $runDeps; \
      apk del .build-deps; \
    fi; \
    php -m | grep -qi '^mbstring$'

# ── Envoi du courrier ────────────────────────────────────────────────────
# `mail()` remet le message à un agent local. Un conteneur PHP n'en a aucun :
# sans ceci, `mail()` renvoie false, l'endpoint rend 502, et la demande
# d'offre est perdue — alors que le site, lui, fonctionne parfaitement.
#
# msmtp relaie vers la messagerie du domaine, en s'authentifiant. SPF et DKIM
# sont alors ceux de cette boîte, déjà alignés : rien à changer dans le DNS,
# et aucune question de réputation d'IP. La configuration est montée depuis
# l'hôte (/etc/ivan-arsenov/msmtprc) et n'entre jamais dans l'image.
RUN set -eux; \
    apk add --no-cache msmtp; \
    printf 'sendmail_path = /usr/bin/msmtp -t\n' > /usr/local/etc/php/conf.d/zz-sendmail.ini

# Le pool par défaut écoute déjà sur 9000 et tourne en www-data.
# `enquiry.php` n'écrit rien : aucun droit d'écriture n'est accordé.
WORKDIR /var/www/ivan-arsenov.de/public_html
