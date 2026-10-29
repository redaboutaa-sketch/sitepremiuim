# PROMPT À COLLER SUR LE VPS

À donner à Claude Code (ou à tout agent) **lancé en SSH sur `76.13.44.177`**,
dans un répertoire de travail quelconque.

Il est délibérément **descriptif et contraint** : il dit ce qu'il faut
obtenir, interdit ce qu'il ne faut pas toucher, et impose de constater plutôt
que de supposer. Un prompt qui dirait seulement « installe le site » laisserait
l'agent inventer les parties qu'il ne connaît pas — et ici, les parties qu'il
ne connaît pas sont justement celles qui font perdre des demandes d'offre.

> **Ce qu'il faut transférer sur le VPS avant de lancer le prompt :**
> le `.zip` du site, `release/nginx/ivan-arsenov.de.conf` et
> `release/nginx/snippets/ivan-arsenov.de-headers.conf`.

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

FICHIERS FOURNIS (déjà présents sur la machine, demande-moi les chemins)

  - une archive .zip contenant un dossier public_html/ : le site construit,
    avec public_html/api/enquiry.php et public_html/api/config.local.php
  - ivan-arsenov.de.conf          : configuration nginx, GÉNÉRÉE
  - ivan-arsenov.de-headers.conf  : fragment d'en-têtes, GÉNÉRÉ

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

  4. Déposer le site dans /var/www/ivan-arsenov.de/public_html, puis :
       propriétaire www-data, répertoires 755, fichiers 644,
       api/config.local.php en 640.

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
       curl -s 'https://www.ivan-arsenov.de/api/enquiry.php?probe=1'

     Attendus : 200 ; trois fois la même cible avec /drinks/ préservé ; une
     redirection http→https DIRECTE vers le nom canonique (un seul saut) ;
     la barre finale ajoutée ; les en-têtes de sécurité présents sur la page
     ET sur l'asset, avec UN SEUL Cache-Control ; 404 sur la page
     inexistante ; 404 sur config.local.php ; pas de listage ;
     {"delivery":"ready"}.

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
