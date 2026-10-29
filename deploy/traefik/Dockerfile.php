# ==========================================================================
# PHP-FPM pour l'endpoint de demande d'offre.
#
# Trois ajouts à l'image officielle, et pas un de plus. Un conteneur qui sert
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
# échoue dans le second. On constate, puis on agit — et la dernière ligne
# fait échouer la CONSTRUCTION si le résultat n'est pas là, plutôt que de
# laisser découvrir l'absence sur une demande d'offre perdue.
RUN set -eux; \
    if ! php -m | grep -qi '^mbstring$'; then \
      apk add --no-cache --virtual .build-deps $PHPIZE_DEPS oniguruma-dev; \
      docker-php-ext-install mbstring; \
      apk add --no-cache oniguruma; \
      apk del .build-deps; \
    fi; \
    php -m | grep -qi '^mbstring$'

# ── Envoi du courrier ────────────────────────────────────────────────────
# `mail()` remet le message à un agent local. Un conteneur PHP n'en a aucun :
# sans ceci, `mail()` renvoie false, l'endpoint rend 502, et la demande
# d'offre est perdue — alors que le site, lui, fonctionne parfaitement.
#
# msmtp relaie vers la messagerie du domaine en s'authentifiant. SPF et DKIM
# sont alors ceux de cette boîte, déjà alignés : rien à changer dans le DNS,
# et aucune question de réputation d'IP.
#
# La configuration n'entre JAMAIS dans l'image : elle est montée depuis
# l'hôte et recopiée au démarrage par l'entrypoint, qui lui donne le
# propriétaire et les droits que msmtp exige.
RUN set -eux; \
    apk add --no-cache msmtp; \
    printf 'sendmail_path = /usr/bin/msmtp -C /run/msmtprc -t\n' \
      > /usr/local/etc/php/conf.d/zz-sendmail.ini

COPY entrypoint.sh /usr/local/bin/ivan-entrypoint
RUN chmod 755 /usr/local/bin/ivan-entrypoint

# Le pool par défaut écoute sur 9000 et tourne en www-data.
# `enquiry.php` n'écrit rien : aucun droit d'écriture n'est accordé.
WORKDIR /var/www/ivan-arsenov.de/public_html

ENTRYPOINT ["/usr/local/bin/ivan-entrypoint"]
CMD ["php-fpm"]
