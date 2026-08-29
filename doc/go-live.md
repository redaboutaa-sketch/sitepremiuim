# CHEMIN VERS LA MISE EN LIGNE — ivanarsenov.de

**Établi le 2026-08-25**, mis à jour le même jour · commit `8ec96d3`
Destinataires : Ivan Arsenov, son conseil juridique, l'intégrateur.

---

## Où on en est

Le site est **techniquement terminé et vérifié**. Il n'attend plus aucun
développement.

| Porte | Résultat |
| --- | --- |
| `npm run qa` (production) | **566/566** · 0 bloquant |
| `npm run qa:staging` | **569/569** · 0 bloquant |
| Tests | **1 092** passés |
| Préproduction | en ligne sur `staging.ivanarsenov.de` |

Ce qui reste à obtenir n'est **pas du code**. Ce sont quatre décisions ou
livraisons qui n'appartiennent qu'au propriétaire du site.

> ### ✅ RÉSOLU LE 2026-08-29 — les visuels sont publiés
>
> Ce document s'ouvrait sur un avertissement : la production n'affichait
> aucune photo de boisson, parce qu'aucun visuel n'avait d'autorisation.
>
> Ivan Arsenov **déclare détenir les autorisations** auprès des fournisseurs
> et des marques. Les 28 visuels sont publiés, et **la production rend
> désormais la même chose que la préproduction**.
>
> Deux réserves subsistent, détaillées à l'étape 4 : les **documents
> d'autorisation restent à archiver**, et les quatorze photos produit sont
> **générées par un modèle** — elles restent à remplacer par les packshots
> presse des marques.

---

## La séquence

Dans cet ordre. Chaque étape est indépendante des suivantes sauf mention.

| # | Étape | Qui | Bloque la mise en ligne ? |
| --- | --- | --- | --- |
| 1 | Textes juridiques (B3) | conseil juridique d'Ivan | **oui — risque légal** |
| 2 | Adresses e-mail (B5) | ✅ arbitré · **SPF à publier** | oui — sinon les demandes tombent en indésirable |
| 3 | Livraison du formulaire (B1) | intégrateur | **oui — sinon le site est inerte** |
| 4 | Visuels : droits (B2 · B11) | ✅ **autorisations déclarées** — publiés | non |
| 5 | Publication et contrôles | intégrateur | — |

---

## Étape 1 · Textes juridiques — B3

**C'est le seul point qui présente un risque juridique réel.**

Les trois pages légales affichent aujourd'hui, **en clair et visible du
public** :

> *« The legal wording below is a structured placeholder and must be reviewed
> by Ivan Arsenov's legal adviser before publication. »*

Les **données d'identification sont réelles et exactes** — raison sociale,
adresse, USt-IdNr `DE464097303`, numéro fiscal. C'est la **rédaction
juridique** qui est un gabarit.

En Allemagne l'Impressum est obligatoire (§ 5 DDG) et un Impressum incomplet
expose à une mise en demeure (*Abmahnung*).

### Ce que le conseil juridique doit fournir

Un texte, en **anglais et en allemand**, pour chacune de ces rubriques déjà en
place :

**Impressum** — § 5 DDG · Contact · Identification fiscale · Responsable du
contenu · Marques de tiers

**Politique de confidentialité** — Données collectées par le site · Formulaire
de demande d'offre · Hébergement et services externes · Droits des personnes ·
Responsable du traitement

**Cookies** — Cookies · Sélection de demande d'offre · Polices et ressources ·
**Régime de consentement** · Responsable du traitement

> La rubrique « régime de consentement » est volontairement laissée ouverte :
> la page **décrit** l'usage technique et **ne conclut pas** sur le régime
> applicable. Cette qualification appartient au conseil, pas à l'intégrateur.

**Éléments factuels utiles au conseil** — le site ne pose aucun cookie de
mesure d'audience, n'embarque aucun script tiers, ne fait aucune requête
externe, et héberge ses polices lui-même. Le seul traitement de données est le
formulaire de demande d'offre.

---

## Étape 2 · Adresses e-mail — B5

### ✅ Destinataire confirmé — 2026-08-25

`info@ivan-arsenov.de` (**avec tiret**) est bien la boîte qui reçoit les
demandes, alors que le site vit sur `ivanarsenov.de` (**sans tiret**). Les deux
domaines sont délibérément distincts. Enregistré dans `site.config.mjs`,
`src/data/company.ts` et le gabarit de configuration du formulaire.

### ✅ Expéditeur arbitré — `no-reply@ivanarsenov.de`

Sur le domaine du **site**, pas sur celui de la messagerie. Les deux valeurs
vivent donc délibérément sur deux domaines, chacun dans son rôle :

| Valeur | Adresse | Domaine |
| --- | --- | --- |
| `recipient` — reçoit | `info@ivan-arsenov.de` | messagerie (avec tiret) |
| `sender` — envoie | `no-reply@ivanarsenov.de` | site (sans tiret) |

**Pourquoi ce choix.** C'est le serveur web qui envoie, et son SPF est le seul
des deux à dépendre du même hébergeur que le formulaire — donc le seul
directement modifiable.

| Hôte | Adresse IP | Rôle |
| --- | --- | --- |
| `ivan-arsenov.de` | `91.184.0.200` | messagerie — reçoit |
| `www.ivanarsenov.de` | `2.57.91.91` | serveur web — envoie |
| `staging.ivanarsenov.de` | `77.37.76.100` | préproduction |

La boîte `no-reply@` **n'a pas besoin d'exister ni d'être relevée** :
`enquiry.php` met l'adresse du prospect en `Reply-To` et jamais en `From`.
Répondre à une demande d'offre écrit donc bien au prospect.

### ⚠️ Il reste une action : publier le SPF

Ce choix **rend** le SPF modifiable, il ne le **configure** pas.

État de la zone DNS de `ivanarsenov.de` au 2026-08-29 (relevé sur hPanel) :
un `A @ → 2.57.91.91`, un `CNAME www → ivanarsenov.de`, et **aucun TXT, aucun
MX**. Il n'y a donc pas de SPF à modifier : il y en a un à créer.

#### L'enregistrement à ajouter

| Champ | Valeur |
| --- | --- |
| **Type** | `TXT` |
| **Name** | `@` |
| **Value** | `v=spf1 a ~all` |
| **TTL** | `300` |

**`@` et non `www`.** L'expéditeur est `no-reply@ivanarsenov.de`, donc le SPF
interrogé est celui de l'**apex**. Un TXT posé sur `www` ne serait jamais lu —
c'est l'erreur classique, d'autant que `www` n'est ici qu'un CNAME vers l'apex.

**Pourquoi `a`** — le mécanisme `a` autorise l'adresse du `A` du domaine, soit
exactement `2.57.91.91`, le serveur qui enverra. Il se maintient tout seul si
l'IP change un jour. `v=spf1 ip4:2.57.91.91 ~all` est l'équivalent explicite,
si vous préférez figer la valeur.

**Ne pas utiliser d'`include:` d'un service de messagerie.** Ces inclusions
autorisent les serveurs de boîtes hébergées ; or ce domaine n'a aucun MX et
n'héberge aucune boîte. C'est le serveur *web* qui envoie. Autoriser autre
chose n'aurait aucun effet.

**`~all` et non `-all`.** Softfail le temps de vérifier. Passer à `-all` une
fois le test concluant, si vous le souhaitez.

#### Vérifier — et ne pas s'arrêter à la propagation

```bash
dig +short TXT ivanarsenov.de
# attendu : "v=spf1 a ~all"
```

Puis, et c'est le seul contrôle qui prouve quelque chose : **un envoi réel**
depuis le formulaire vers une boîte externe (Gmail, Outlook), puis lecture de
l'en-tête du message reçu.

```
Authentication-Results: ... spf=pass ...
```

> ⚠️ **Si le résultat est `spf=fail` ou `softfail`, ne pas conclure que le SPF
> est mauvais.** Sur un hébergement mutualisé, `mail()` peut sortir par un
> relais SMTP dont l'IP diffère de celle du serveur web. Le cas échéant,
> l'en-tête `Received:` du message nomme l'IP réellement utilisée : il suffit
> alors de l'ajouter — `v=spf1 a ip4:<cette IP> ~all`.
>
> Je ne peux pas anticiper ce point depuis mon environnement : il ne se
> constate qu'à l'envoi.

*Note : aucun outil DNS n'est installé ici, je n'ai donc pas pu lire les TXT
moi-même. Les adresses IP ci-dessus sont mesurées, et la zone vient de votre
capture hPanel.*

---

## Étape 3 · Livraison du formulaire — B1

Tant que cette étape n'est pas faite, le formulaire affiche *« Enquiry delivery
is not active on this environment yet »* et propose l'adresse e-mail directe.
**Il ne simule jamais un envoi.** Pour un site B2B dont l'objet est la demande
d'offre, publier sans cette étape rend le site commercialement inerte.

Les fichiers sont prêts dans le dépôt et n'attendent que les valeurs de
l'étape 2.

```
public_html/api/enquiry.php        ← deploy/enquiry.php.example        (644)
public_html/api/config.local.php   ← deploy/config.local.php.example   (644)
public_html/api/                                                       (755)
```

`config.local.php` porte deux valeurs, **toutes deux arbitrées** et déjà
inscrites dans le gabarit :

```php
'recipient' => 'info@ivan-arsenov.de',      // domaine de messagerie
'sender'    => 'no-reply@ivanarsenov.de',   // domaine du site
```

Il n'y a donc plus rien à décider ici — seulement à copier les fichiers. Le SPF
de l'étape 2 reste, lui, à publier.

### Vérification

```bash
curl -s https://www.ivanarsenov.de/api/enquiry.php?probe=1
# attendu : {"delivery":"ready"}
```

Puis **un envoi réel de bout en bout**. La sonde constate qu'un point de
livraison *se déclare* prêt ; elle ne prouve pas qu'un message arrive.

---

## Étape 4 · Les visuels — B2 et B11

Quatorze marques. Pour chacune, deux fichiers manquent de droits.

| | Nombre | Statut actuel | Ce qui manque |
| --- | --- | --- | --- |
| Logos | 14 | `referential-use` | autorisation écrite du titulaire |
| Photos produit | 14 | `unknown` · **générées** | fichier presse **et** autorisation |

Les photos actuelles ont été **produites par un modèle** — leur manifeste C2PA
signé porte `gpt-image 2.0` / `trainedAlgorithmicMedia`. Elles servent à juger
le design ; elles ne donnent aucun droit et ne seront jamais publiées en l'état.

### ✅ DÉCISION DU CLIENT — 2026-08-29 : les visuels sont PUBLIÉS

Ivan Arsenov **déclare détenir les autorisations** auprès des fournisseurs et
des marques. Les 28 visuels — 14 logos et 14 photos produit — passent donc
`validated` / `granted` au registre et sont publiés en production.

> ⚠️ **Ce qui est enregistré, c'est une déclaration, pas une preuve.** Les
> documents n'ont pas été transmis au dépôt. Le champ `evidence` de chaque
> asset porte l'auteur de la déclaration et sa date, rien de plus.
> **À archiver dès réception** — c'est la seule pièce qui compterait en cas de
> contestation.

#### La nuance qui subsiste sur les quatorze photos

Une autorisation d'usage de marque **ne transforme pas un fichier généré par un
modèle en photographie officielle du produit**. Les quatorze visuels produits
restent `sourceType: 'generated'` au registre — à vie, publiés ou non : la
donnée ne ment jamais sur l'origine d'un fichier.

Concrètement, deux conséquences :

- une canette rendue par un modèle peut **différer du produit réellement
  livré** — conditionnement, format, mentions d'étiquette ;
- ces quatorze fichiers **restent à remplacer** par les packshots presse des
  marques, qu'Ivan est maintenant en position de demander. Le modèle de
  courrier est en annexe.

Les visuels publiés gardent leur attribut `data-generated` dans le HTML : le
jour du remplacement, on les retrouve sans avoir à deviner.

#### Ce que ça change dans le site

| | Avant | Après |
| --- | --- | --- |
| Accueil | 27 replis, 0 image | 0 repli, **21 images** |
| Catalogue `/drinks/` | 14 replis, 0 image | 0 repli, **28 images** |
| Poids de l'accueil | ~300 Ko | **782 Ko** |
| Poids de `/drinks/` | ~250 Ko | **424 Ko** |

Le poids de l'accueil a plus que doublé : 479 Ko d'images réparties sur une
vingtaine de fichiers de 20 à 62 Ko. Aucun fichier n'est aberrant, c'est le
nombre qui pèse. Les budgets de non-régression ont été **remesurés** et
relevés route par route, pas desserrés en bloc.

Si le poids devient un sujet, la cible est claire : les **six packshots de la
scène d'accueil**, chargés en avidité parce qu'ils sont au-dessus de la ligne
de flottaison. La piste Featured, elle, est déjà paresseuse.

#### Les garde-fous n'ont pas été supprimés, ils ont été retournés

Sept contrôles d'artefact et trois tests exigeaient l'inverse exact — zéro
visuel de marque en production. Ils vérifient désormais que **rien ne se vide** :
la scène rend bien ses six packshots, la piste ses quatorze, plus aucun
emplacement ne retombe sur un repli. Une régression qui rendrait à nouveau des
replis passerait autrement inaperçue jusqu'à ce qu'un visiteur la voie.

Un garde-fou est même renforcé : un visuel généré publié doit porter une
autorisation `granted` **avec sa trace**. Publier un fichier fabriqué que
personne n'assume reste interdit.

---

## Étape 5 · Publication

### 5.0 Pré-vol

- **`www` ou apex ?** Les deux résolvent, et **sur le même hôte** —
  `ivanarsenov.de` et `www.ivanarsenov.de` pointent tous deux sur
  `2.57.91.91` (relevé le 2026-08-25). La canonicalisation est donc un libre
  choix, pas une contrainte : la configuration livrée canonicalise vers
  `www.ivanarsenov.de` et fonctionnera. Pour préférer l'apex, changer
  `SITE_HOST` dans `site.config.mjs` et rebâtir — une seule valeur, tout suit.
- **`public_html` est-il vide ?** Quelque chose répondait déjà sur l'ancien
  domaine. Ne remplacer aucun site existant sans confirmation d'Ivan.

### 5.1 Téléverser

`public_html` : vider, déposer le **contenu** de `dist/` — pas le dossier.
`public_html/index.html` doit exister à la racine. Cocher **« afficher les
fichiers cachés »** et vérifier que `.htaccess` est monté : sans lui, les
redirections, la compression et les en-têtes de sécurité tombent.

### 5.2 SSL

Certificat sur l'apex **et** le `www`. **Ne pas** activer la redirection HTTPS
de hPanel : `.htaccess` la fait déjà, et les deux ensemble produisent un double
saut.

### 5.3 Contrôles

Le tableau complet est en `doc/deploy-hostinger.md` §6. Les deux qui doivent
**échouer** :

| `/styleguide/` | doit renvoyer **404** |
| `/api/config.local.php` | doit renvoyer **403** |

Puis, depuis un poste ayant un accès direct :

```bash
npm run qa:remote -- https://www.ivanarsenov.de
BASE_URL=https://www.ivanarsenov.de npm run qa:remote:e2e
```

### 5.4 Référencement

Une fois la mise en ligne **constatée**, jamais avant. Voir
`doc/deploy-hostinger.md` §7.

---

## Annexe · Modèle de demande de droits

À adresser au service presse ou au responsable de marque, une fois par marque.
Adapter le nom du produit.

**Objet** — `Bilddaten und Nutzungsfreigabe für Fachhändler-Website / Image assets and usage permission for a trade website`

> Sehr geehrte Damen und Herren,
>
> ich betreibe unter **ivanarsenov.de** eine B2B-Website für den Großhandel mit
> alkoholfreien Erfrischungsgetränken (Ivan Arsenov Iliev, Zwischenbrücken 8,
> 27793 Wildeshausen, USt-IdNr. DE464097303).
>
> Für die Darstellung Ihres Sortiments bitte ich um:
> 1. **Produktabbildungen** (freigestelltes Packshot, PNG mit Alphakanal oder
>    hochauflösendes Original) sowie Ihr **Logo** (bevorzugt als Vektordatei);
> 2. eine **schriftliche Nutzungsfreigabe** für die referenzielle Verwendung
>    als Händler auf dieser Website.
>
> Die Darstellung erfolgt ausschließlich referenziell — keine Preisangaben,
> keine Verfügbarkeitsangaben, keine Eigenwerbung mit Ihrer Marke. Bestehende
> Markenrichtlinien halte ich selbstverständlich ein; bitte senden Sie mir
> diese mit.
>
> Für Rückfragen stehe ich gerne zur Verfügung.
>
> Mit freundlichen Grüßen
> Ivan Arsenov Iliev

**Ce qu'il faut obtenir, et qui compte :** la réponse écrite. Un fichier reçu
sans autorisation reste `requires_validation` et n'ira pas en production — le
build le retirera, exactement comme aujourd'hui.

Dès qu'une autorisation arrive, transmettez-la : elle est enregistrée dans
`authorization.evidence` avec sa référence et sa date, et le visuel bascule.

---

## Récapitulatif des blocages

| # | Blocage | Qui le lève | Effet s'il reste ouvert |
| --- | --- | --- | --- |
| **B3** | Textes juridiques | conseil juridique | **risque de mise en demeure** |
| **B1** | Livraison du formulaire | intégrateur, après B5 | **aucune demande n'arrive** |
| **B5** | Publier le SPF de `ivanarsenov.de` — adresses arbitrées | Ivan, dans hPanel | **demandes perdues en silence** |
| **B2** | Photos produit — 14 **générées**, publiées | Ivan | à remplacer par les packshots presse |
| **B11** | Droits sur les logos — 14, publiés | Ivan | **documents d'autorisation à archiver** |

`TR027_FINDING_001` — collision d'un libellé allemand en Featured entre 320 et
768 px. Cosmétique, documenté, non corrigé sous gel de version. Ne bloque pas
la mise en ligne.
