# CHEMIN VERS LA MISE EN LIGNE — ivanarsenov.de

**Établi le 2026-08-25**, mis à jour le 2026-08-29 · commit `89c2216`
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
| 1 | Textes juridiques (B3) | ✅ **rédigés** — relecture recommandée | non, mais à faire relire |
| 2 | Adresses e-mail (B5) | ✅ **SPF publié et vérifié** | reste à constater `spf=pass` à l'envoi |
| 3 | Livraison du formulaire (B1) | intégrateur | **oui — sinon le site est inerte** |
| 4 | Visuels : droits (B2 · B11) | ✅ **autorisations déclarées** — publiés | non |
| 5 | Publication et contrôles | intégrateur | — |

---

## Étape 1 · Textes juridiques — B3

### ✅ RÉDIGÉS le 2026-08-29

Les trois pages portent désormais des textes complets, en anglais et en
allemand. Le bandeau « brouillon en attente de relecture » — qui s'affichait
au **public** — a été retiré : une page légale qui annonce elle-même n'être
qu'un gabarit est pire que pas de page du tout. Une **date de dernière mise à
jour** l'a remplacé.

**Chaque affirmation a été vérifiée contre le code**, pas reprise d'un modèle :
aucun cookie, aucun script tiers, aucune requête externe, polices
auto-hébergées, et un seul traitement de données — le formulaire, dont la
liste de champs est celle réellement postée.

| Page | Contenu |
| --- | --- |
| **Impressum** | § 5 DDG · contact · USt-IdNr (§ 27a UStG) · responsable § 18 Abs. 2 MStV · marques de tiers · responsabilité contenus et liens (§§ 7–10 DDG) · § 36 VSBG |
| **Datenschutz** | portée · journaux serveur (Art. 6 (1) f) · formulaire (Art. 6 (1) b et f, conservation §§ 257 HGB / 147 AO) · anti-spam · aucune transmission à des tiers · droits (Art. 15–21, 77) avec l'autorité de Basse-Saxe nommée |
| **Cookies** | aucun cookie · sessionStorage de l'anfrage · polices locales · pourquoi il n'y a pas de bandeau |

### ⚠️ Ce que ces textes ne sont pas

**Un avis juridique.** Ils ont été rédigés par l'intégrateur, pas par un
avocat. Ils sont exacts sur les faits techniques ; la qualification juridique,
elle, appartient au conseil d'Ivan.

Deux points méritent particulièrement son œil :

1. **L'absence de numéro de téléphone.** Le § 5 DDG exige des moyens permettant
   « une prise de contact rapide et une communication directe ». L'e-mail et le
   formulaire sont fournis. La jurisprudence européenne (CJUE C-298/07) admet
   ce dispositif **à condition qu'une réponse intervienne sous une heure** pour
   qui le demande. Si Ivan ne peut pas le garantir, publier un numéro est plus
   sûr — le champ existe déjà dans les données (`COMPANY.phone`, aujourd'hui
   nul).
2. **La qualification du sessionStorage.** Les pages retiennent le § 25 Abs. 2
   Nr. 2 TDDDG — stockage strictement nécessaire à un service expressément
   demandé — et en concluent qu'aucun bandeau de consentement n'est requis.
   Le raisonnement est exposé sur la page même : la sélection n'existe que
   parce que le visiteur a cliqué, ne contient que ce que ce clic implique, et
   sert uniquement à fournir la fonction demandée. C'est défendable et c'est la
   position retenue ; c'est aussi le point qu'un conseil validerait ou
   corrigerait en premier.

### 🔒 Une correction au passage : le Steuernummer n'est plus publié

La page affichait le numéro fiscal `68/120/14293`. **Le § 5 DDG ne l'exige
pas** — il n'exige que l'USt-IdNr (n° 6) — et le publier facilite l'usurpation
d'identité fiscale sans rien apporter au visiteur. Il a été retiré du rendu.
La donnée reste au dépôt : elle est vraie et sert ailleurs, elle ne sort
simplement plus sur la page.

### Ce qu'il reste à faire

- **Faire relire** par le conseil d'Ivan, en attirant son attention sur les
  deux points ci-dessus.
- **Conclure le contrat de sous-traitance (Art. 28 DSGVO) avec Hostinger.** La
  page de confidentialité indique que l'hébergeur traite les journaux pour le
  compte d'Ivan : c'est une affirmation qu'il faut rendre vraie. Hostinger
  fournit un DPA standard.

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

### ✅ SPF publié et vérifié — 2026-08-29

L'enregistrement est en place, et il a été **lu directement dans le DNS**, pas
constaté sur une capture d'écran :

```
TXT ivanarsenov.de  →  "v=spf1 a ~all"
   1 enregistrement · 1 segment · 13 octets
```

Trois points contrôlés, chacun étant une erreur classique :

| Contrôle | Résultat |
| --- | --- |
| Un seul enregistrement SPF | ✅ — deux SPF sur un domaine = `permerror` |
| Aucun guillemet littéral | ✅ — 13 octets exactement, les guillemets d'hPanel n'étaient qu'un affichage |
| Le mécanisme `a` désigne bien l'expéditeur | ✅ — `ivanarsenov.de` → `2.57.91.91`, le serveur web |

#### Ce que la vérification a révélé sur l'autre domaine

En interrogeant `ivan-arsenov.de` — le domaine de messagerie — j'ai lu :

```
v=spf1 a mx include:_spf.hostnet.nl -all
```

La messagerie d'Ivan est chez **Hostnet**, et sa politique se termine par
**`-all` : un rejet dur.** Le serveur web Hostinger (`2.57.91.91`) n'est ni
son `a`, ni son `mx`, ni dans l'`include` de Hostnet.

Autrement dit : avoir mis l'expéditeur sur `ivan-arsenov.de` n'aurait pas
seulement fait tomber les messages en indésirable — **ils auraient été
purement et simplement rejetés**. Le choix de l'étape précédente était le bon,
et c'est maintenant mesuré et non plus seulement raisonné.

#### Ce qui reste à faire, et ne peut se faire qu'à l'envoi

Un SPF publié n'est pas un SPF qui passe. Sur un hébergement mutualisé,
`mail()` peut sortir par un relais dont l'IP diffère de celle du serveur web —
et dans ce cas `a` ne suffit pas.

**Le seul contrôle qui prouve quelque chose** : après l'étape 3, un envoi réel
depuis le formulaire vers une boîte externe (Gmail, Outlook), puis lecture de
l'en-tête du message reçu.

```
Authentication-Results: ... spf=pass ...
```

Si le résultat est `fail` ou `softfail`, l'en-tête `Received:` nomme l'IP
réellement utilisée : il suffit alors de l'ajouter —
`v=spf1 a ip4:<cette IP> ~all`.

Une fois `spf=pass` constaté, `~all` peut passer à `-all` si vous le souhaitez.

#### Optionnel — DMARC

`_dmarc.ivanarsenov.de` n'a aucun enregistrement. Ce n'est pas requis et rien
n'en dépend. Un `v=DMARC1; p=none; rua=mailto:…` donnerait de la visibilité
sur ce que les destinataires font des messages, sans aucun risque de blocage.
À considérer après coup, jamais avant d'avoir constaté `spf=pass`.

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
de l'étape 2 est publié et vérifié.

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
| **B3** | Textes juridiques rédigés · relecture + DPA Hostinger | conseil juridique · Ivan | qualification juridique non validée |
| **B1** | Livraison du formulaire | intégrateur, après B5 | **aucune demande n'arrive** |
| **B5** | ✅ adresses arbitrées · SPF publié et vérifié | — | reste à constater `spf=pass` à l'envoi réel |
| **B2** | Photos produit — 14 **générées**, publiées | Ivan | à remplacer par les packshots presse |
| **B11** | Droits sur les logos — 14, publiés | Ivan | **documents d'autorisation à archiver** |

`TR027_FINDING_001` — collision d'un libellé allemand en Featured entre 320 et
768 px. Cosmétique, documenté, non corrigé sous gel de version. Ne bloque pas
la mise en ligne.
