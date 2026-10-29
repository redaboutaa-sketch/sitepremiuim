# PROMPT À COLLER SUR LE VPS

À donner à Claude Code (ou à tout agent) **lancé en SSH sur `76.13.44.177`**,
dans un répertoire de travail quelconque.

Il est délibérément **descriptif et contraint** : il dit ce qu'il faut
obtenir, interdit ce qu'il ne faut pas toucher, et impose de constater plutôt
que de supposer. Un prompt qui dirait seulement « installe le site » laisserait
l'agent inventer les parties qu'il ne connaît pas — et ici, les parties qu'il
ne connaît pas sont justement celles qui font perdre des demandes d'offre.

> **Ce qu'il faut transférer sur le VPS avant de lancer le prompt :**
> `release/nginx/ivan-arsenov.de.conf`,
> `release/nginx/snippets/ivan-arsenov.de-headers.conf`, et le contenu de
> `config.local.php` (modèle : `deploy/config.local.php.example`).
>
> **Le site lui-même n'a pas à être transféré** : il est tiré depuis GitHub.
> La branche `deploy/production` doit exister — c'est-à-dire que le flux
> *Construire et publier le site* doit avoir tourné au moins une fois.

---

```text
Tu interviens sur un VPS Debian/Ubuntu, IP publique attendue 76.13.44.177,
avec sudo. Objectif : y héberger un site statique déjà construit et son
unique endpoint PHP, servis en HTTPS sur quatre noms de domaine.

CE QUE TU DOIS OBTENIR

  www.ivan-arsenov.de   sert le site           (nom canonique)
  ivan-arsenov.de       301 vers le canonique
  www.ivanarsenov.de    301 vers le canonique
  ivanarsenov.de        301 vers le canonique

Les quatre répondent en HTTPS avec un certificat valide : un domaine sans
certificat ne peut pas même rediriger, le navigateur bloque avant.

D'OÙ VIENT LE SITE

  Il n'est PAS copié à la main. Il est tiré depuis GitHub, sur une branche
  qui contient le site DÉJÀ CONSTRUIT :

    dépôt   https://github.com/redaboutaa-sketch/sitepremiuim.git  (public)
    branche deploy/production
    contenu public_html/ et rien d'autre

  Ne clone PAS la branche par défaut pour la construire sur cette machine.
  Elle contient la source Astro ; `dist/` y est ignoré par git. La
  construire ici demanderait Node et 322 Mo de dépendances sur un serveur de
  production, et une construction en échec bloquerait la machine qui sert le
  site. La branche deploy/production existe exactement pour éviter cela.

  Le script de déploiement fait tout le travail :
    deploy/vps-pull.sh  →  à poser en /usr/local/bin/ivan-deploy (chmod 755)

FICHIERS FOURNIS (déjà présents sur la machine, demande-moi les chemins)

  - ivan-arsenov.de.conf          : configuration nginx, GÉNÉRÉE
  - ivan-arsenov.de-headers.conf  : fragment d'en-têtes, GÉNÉRÉ
  - le contenu de config.local.php (destinataire et expéditeur du formulaire)

INTERDITS — ils ne sont pas négociables

  1. Ne réécris pas la configuration nginx fournie. Elle est générée depuis
     la source de vérité du projet ; une correction faite ici serait perdue
     à la prochaine génération et personne ne le saurait. Si tu y trouves un
     défaut : SIGNALE-LE, n'y touche pas.
  2. Ne modifie AUCUN enregistrement DNS, et surtout pas les MX. La
     messagerie du domaine est chez un autre fournisseur et doit y rester.
  3. Ne modifie pas le SPF. S'il manque quelque chose, dis lequel et
     pourquoi. N'affaiblis jamais une politique `-all` en `~all`.
  4. Ne touche pas au contenu du site : ni HTML, ni texte, ni image. Il est
     validé.
  5. `api/config.local.php` contient des adresses réelles : ne le publie
     pas, ne le copie pas hors du serveur, ne l'affiche pas en entier.
  6. Avant toute commande destructive (rm -rf, --delete, écrasement d'une
     configuration existante), montre-moi ce qui va disparaître et attends
     ma réponse.
  7. Si une autre application est déjà servie par ce VPS, ne la casse pas :
     inventorie sites-enabled avant d'y toucher.

ÉTAPES

  1. Constater l'état réel. N'installe rien avant d'avoir montré :
     l'IP publique réelle (curl -s ifconfig.me), le serveur web déjà
     installé et sa version, la version de PHP, ce que contient
     /etc/nginx/sites-enabled, et si quelque chose écoute déjà sur 80/443.
     Si l'IP publique n'est pas 76.13.44.177 : ARRÊTE et dis-le-moi.
     Si la machine tourne sous Apache et non nginx : ARRÊTE et dis-le-moi,
     la configuration fournie ne s'applique pas.

  2. Vérifier le DNS AVANT de demander un certificat. Les quatre noms
     doivent déjà résoudre vers cette machine :
       dig +short A www.ivan-arsenov.de ivan-arsenov.de \
                     www.ivanarsenov.de ivanarsenov.de
     Si un seul ne résout pas encore : ARRÊTE. Une demande de certificat
     échouée compte dans un quota horaire, et cinq échecs bloquent pour une
     heure.

  3. Installer ce qui manque : nginx, php-fpm avec l'extension mbstring
     (enquiry.php utilise mb_substr — sans elle, erreur 500 à chaque envoi),
     certbot et son greffon nginx, rsync.

  4. Déposer le site, par git et non à la main.

     D'abord la configuration du formulaire, HORS de la racine web :
       /etc/ivan-arsenov/config.local.php, root:www-data, 640.
     Ce n'est pas du rangement : le déploiement exécute `git clean -fd`, qui
     efface tout fichier non suivi de l'arborescence. Placée dans
     public_html/api/, cette configuration disparaîtrait à la PREMIÈRE mise
     à jour et le formulaire refuserait les demandes en silence.

     Puis installer deploy/vps-pull.sh en /usr/local/bin/ivan-deploy
     (chmod 755) et le lancer. Il clone deploy/production dans
     /var/www/ivan-arsenov.de — donc public_html/ s'y trouve là où nginx
     l'attend, et .git reste HORS de ce qui est servi.

     Vérifie ensuite que /.git n'est pas servi :
       curl -s -o /dev/null -w '%{http_code}\n' \
            https://www.ivan-arsenov.de/.git/config      # 403 ou 404

     Si tu dois t'y reprendre avant que le certificat existe, teste en
     local : curl -s -o /dev/null -w '%{http_code}\n' \
                  --resolve www.ivan-arsenov.de:443:127.0.0.1 …

  5. Installer la configuration fournie :
       le .conf dans /etc/nginx/sites-available/ + lien dans sites-enabled
       le fragment d'en-têtes dans /etc/nginx/snippets/
     Désactiver le site « default » s'il est actif, sinon il capte les
     requêtes dont le nom ne correspond à aucun server_name.

     Vérifie la version de nginx : la configuration utilise « http2 on; »,
     qui exige 1.25.1 ou plus. En dessous, nginx REFUSE DE DÉMARRER — son
     en-tête explique la correction à appliquer.

     Vérifie que le socket PHP-FPM référencé par fastcgi_pass existe
     réellement (ls /run/php/). La version y est écrite en dur.

  6. Obtenir le certificat pour les QUATRE noms, en une seule demande, avec
     --cert-name ivan-arsenov.de : ce nom fixe le répertoire sous
     /etc/letsencrypt/live/ que la configuration référence. Sans lui, les
     chemins ne correspondront pas.

     Attendu : « nginx -t » ÉCHOUE tant que le certificat n'existe pas,
     puisque la configuration le référence. Ce n'est pas un défaut.

  7. nginx -t, puis recharger. Puis « certbot renew --dry-run » : le
     renouvellement se vérifie maintenant, pas dans 90 jours.

  8. Le courrier. mail() a besoin d'un agent local, qu'un VPS neuf n'a pas :
     sans lui, le formulaire rend 502 et la demande est perdue.
     Montre-moi d'abord ce que tu constates (un MTA est-il installé ?), puis
     propose-moi les deux routes — relais SMTP authentifié par le
     fournisseur de la boîte, ou MTA local — avec leurs conséquences sur
     SPF et sur la réputation d'envoi. ATTENDS MON CHOIX avant d'installer.

  9. Recette. Exécute ces contrôles et donne la sortie BRUTE de chacun,
     sans la résumer :

       curl -sI https://www.ivan-arsenov.de/ | head -1
       for h in ivan-arsenov.de www.ivanarsenov.de ivanarsenov.de; do
         echo -n "$h → "; curl -sI "https://$h/drinks/" | grep -i '^location'
       done
       curl -sI http://ivanarsenov.de/drinks/ | grep -i '^location'
       curl -sI https://www.ivan-arsenov.de/drinks | grep -i '^location'
       curl -sI https://www.ivan-arsenov.de/ | grep -iE 'content-security|nosniff|referrer|frame-options'
       curl -sI https://www.ivan-arsenov.de/favicon.svg | grep -iE 'content-security|cache-control'
       curl -sI https://www.ivan-arsenov.de/nexistepas/ | head -1
       curl -s -o /dev/null -w '%{http_code}\n' https://www.ivan-arsenov.de/api/config.local.php
       curl -s -o /dev/null -w '%{http_code}\n' https://www.ivan-arsenov.de/_astro/
       curl -s -o /dev/null -w '%{http_code}\n' https://www.ivan-arsenov.de/.git/config
       curl -s 'https://www.ivan-arsenov.de/api/enquiry.php?probe=1'

     Attendus : 200 ; trois fois la même cible avec /drinks/ préservé ; une
     redirection http→https DIRECTE vers le nom canonique (un seul saut) ;
     la barre finale ajoutée ; les en-têtes de sécurité présents sur la page
     ET sur l'asset, avec UN SEUL Cache-Control ; 404 sur la page
     inexistante ; 404 sur config.local.php ; pas de listage ; l'historique
     git inaccessible ; {"delivery":"ready"}.

 10. Expliquer à l'exploitant comment mettre à jour le site ensuite :
     une seule commande, `ivan-deploy`, après que GitHub Actions a publié
     une nouvelle version sur deploy/production. Rien à reconstruire sur
     cette machine.

COMPTE RENDU

  Termine par un tableau : contrôle, attendu, obtenu, verdict.
  Ne déclare RIEN conforme sans la sortie de commande correspondante.
  Si un contrôle échoue, dis-le et explique pourquoi — ne le contourne pas,
  ne le retire pas de la liste.

  Et sois explicite sur ce que tu n'as PAS pu vérifier. En particulier :
  la sonde du formulaire dit seulement que le fichier de configuration est
  lisible et renseigné. Elle NE PROUVE PAS qu'un message part ni qu'il
  arrive. La seule preuve est une demande réelle reçue dans la boîte. Ne
  présente jamais la sonde verte comme un formulaire fonctionnel.
```
