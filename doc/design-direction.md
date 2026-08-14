# DIRECTION ARTISTIQUE — IVAN ARSENOV

> Référence créative. Aucune décision visuelle d'implémentation ne doit contredire ce document.
> En attente de validation SPEC CHECK.

---

## 1. Positionnement visuel

### **THE SPECIMEN CATALOGUE**
*Le luxe éditorial appliqué au négoce industriel.*

L'idée directrice naît d'une tension, et cette tension **est** le concept :

> Une identité de marque **austère, noire, sérif, silencieuse** —
> confrontée à des produits **vifs, saturés, populaires, bruyants**.

Le site est un **catalogue de spécimens** : chaque boisson est traitée comme un objet
inventorié — cadrée avec rigueur, indexée, numérotée, légendée en petites capitales,
posée sur un fond profond, séparée par des filets d'un demi-pixel. Le vocabulaire visuel
est celui du catalogue de vente aux enchères et de la revue d'architecture, appliqué à
une canette de Fanta.

**Pourquoi c'est juste pour ce client**
- La retenue **est** le signal premium. Tous les grossistes du secteur sont blancs, saturés, chargés de badges promotionnels. Le noir éditorial crée une rupture instantanée et catégorielle.
- Ivan Arsenov ne vend pas ses propres produits : il vend son **discernement**. Une mise en scène de conservateur exprime précisément cela.
- Le fond sombre laisse les couleurs de marque exploser sans qu'aucune couleur du site ne rivalise avec elles. **La seule couleur du site vient des produits** — exactement la demande du client.
- Un traitement uniforme et rigoureux rend cohérents des visuels d'origines hétérogènes. C'est aussi la réponse pragmatique au risque R1.

**Ce que ce n'est pas** — un site SaaS sombre. Pas de glow, pas de gradient violet, pas de
glassmorphism, pas de carte arrondie, pas de badge, pas de bordure lumineuse.
La profondeur vient de **l'échelle, du blanc tournant et du filet**, jamais de l'effet.

---

## 2. Design tokens

### 2.1 Couleur

**Base — neutres**

| Token | Valeur | Rôle |
|---|---|---|
| `--ink-900` | `#0A0A0B` | Fond principal. Noir légèrement froid, jamais `#000` |
| `--ink-800` | `#101012` | Surface — sections alternées |
| `--ink-700` | `#17171A` | Surface élevée — champs de formulaire, stage produit |
| `--ink-600` | `#232327` | Graphite — séparateurs appuyés |
| `--paper` | `#F2F0EC` | Off-white chaud. Sections inversées, catalogue clair |
| `--paper-alt` | `#E8E5DF` | Off-white secondaire |

**Texte**

| Token | Valeur | Sur | Contraste |
|---|---|---|---|
| `--text-primary` | `#F2F0EC` | `--ink-900` | **18,2:1** ✅ AAA |
| `--text-secondary` | `#A0A0A8` | `--ink-900` | **7,4:1** ✅ AAA |
| `--text-muted` | `#77777E` | `--ink-900` | **4,6:1** ✅ AA |
| `--text-on-paper` | `#0A0A0B` | `--paper` | **17,6:1** ✅ AAA |
| `--text-on-paper-sec` | `#54545C` | `--paper` | **7,1:1** ✅ AAA |

`--text-muted` est le plancher absolu : aucun gris plus clair n'est autorisé pour du texte.

**Filets** — l'élément structurel signature du site.

| Token | Valeur |
|---|---|
| `--rule` | `rgba(242, 240, 236, 0.14)` |
| `--rule-strong` | `rgba(242, 240, 236, 0.28)` |
| `--rule-on-paper` | `rgba(10, 10, 11, 0.16)` |

Épaisseur : `1px` en réel (`0.5px` sur écrans à densité ≥ 2 via `hairline`).

**Accent — dynamique, piloté par la famille de boissons**

Il n'existe **aucune couleur d'accent fixe** dans le design system. L'accent est une variable
contextuelle qui prend la teinte de la famille de produits affichée. C'est la traduction
systématique de la demande client : *« changement subtil de l'environnement visuel selon
les familles de boissons »*.

| Famille | `--signal` (graphique) | `--signal-text` (AA sur `--ink-900`) |
|---|---|---|
| Carbonated / Cola | `#C8102E` | `#FF6B7D` — 6,1:1 ✅ |
| Energy | `#00B8A9` | `#2FE0CF` — 9,8:1 ✅ |
| Water | `#4A9BD1` | `#7FC4EE` — 8,6:1 ✅ |
| Juices & Fruit | `#E8890C` | `#FFAE47` — 9,4:1 ✅ |
| Iced Tea & RTD | `#A8894A` | `#D9B87A` — 8,9:1 ✅ |
| Functional | `#7B68C4` | `#AB9DE8` — 7,7:1 ✅ |
| International | `#F2F0EC` | `#F2F0EC` — 18,2:1 ✅ |

**Règle d'usage stricte**
`--signal` est réservé aux éléments **non textuels** : filet actif, point d'index, soulignement,
trait de progression. `--signal-text` est la seule variante autorisée pour du texte coloré.
Aucun aplat de couleur de plus de 15 % de la surface d'un écran. Le CTA reste **achromatique**.

### 2.2 Typographie

Contraste voulu entre une sérif éditoriale à fort contraste et une grotesque contemporaine neutre.

| Rôle | Fonte | Détail |
|---|---|---|
| **Display** | **Instrument Serif** | Régulier + italique. Sérif haute tension, moderne, peu employée sur le web. Fait écho à la construction sérif du monogramme IA |
| **Interface / texte** | **Archivo** (variable) | Grotesque neutre et rigoureuse. Sa largeur variable permet de vraies petites capitales étirées pour les métadonnées de catalogue |

Auto-hébergées, sous-jeu latin + latin-ext (allemand), `font-display: swap`, préchargement
des deux fichiers critiques uniquement. Aucune requête vers Google Fonts en production.

**Échelle fluide** — `clamp()`, sans palier brutal.

| Style | Fonte | Taille | Interlignage | Interlettrage |
|---|---|---|---|---|
| `display-xl` | Instrument Serif | `clamp(3.5rem, 9vw, 8.5rem)` | 0.92 | −0.03em |
| `display-l` | Instrument Serif | `clamp(2.75rem, 6vw, 5rem)` | 0.98 | −0.025em |
| `h1` | Instrument Serif | `clamp(2.5rem, 5.5vw, 4.5rem)` | 1.02 | −0.02em |
| `h2` | Instrument Serif | `clamp(2rem, 3.6vw, 3.25rem)` | 1.08 | −0.015em |
| `h3` | Archivo 500 | `clamp(1.25rem, 1.8vw, 1.625rem)` | 1.25 | −0.01em |
| `body-l` | Archivo 400 | `clamp(1.0625rem, 1.2vw, 1.25rem)` | 1.6 | 0 |
| `body` | Archivo 400 | `1rem` | 1.65 | 0 |
| `small` | Archivo 400 | `0.875rem` | 1.55 | 0 |
| `label` | Archivo 500 expanded | `0.6875rem` | 1.2 | **0.16em**, capitales |
| `index` | Archivo 400 | `0.6875rem` | 1 | 0.08em, chiffres tabulaires |
| `cta` | Archivo 500 | `0.9375rem` | 1 | 0.06em, capitales |

`label` est la signature typographique du site : petites capitales très étirées, en
`--text-muted`, systématiquement précédées d'un filet ou d'un numéro d'index (`01 — CARBONATED`).

Longueur de ligne : 62–72 caractères. Aucun texte long en pleine largeur.

### 2.3 Espacement

Base 4 px, progression non linéaire (rythme éditorial, pas grille mécanique) :
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 176 · 240`

Espacement vertical des sections : `clamp(96px, 12vw, 240px)`.
Le blanc tournant est un matériau, pas un reste — les sections respirent largement,
y compris sur mobile (jamais moins de 72 px entre deux sections).

### 2.4 Rayons

**`--radius: 0` partout.** Aucune carte arrondie.
Seules exceptions justifiées : `--radius-full` pour l'indicateur de sélection (pastille de
comptage) et les points d'index. Les boutons sont des rectangles nets à large empattement
intérieur. L'angle droit est un choix de positionnement, pas un oubli.

### 2.5 Grille

| | Desktop ≥ 1280 | Laptop 1024–1279 | Tablet 768–1023 | Mobile < 768 |
|---|---|---|---|---|
| Colonnes | 12 | 12 | 8 | 4 |
| Gouttière | 24 px | 24 px | 20 px | 16 px |
| Marge | 64 px | 48 px | 32 px | 20 px |
| Largeur max contenu | 1440 px | — | — | — |
| Largeur max texte | 68ch | 68ch | 100 % | 100 % |

Compositions **asymétriques** par défaut (5/7, 4/8, 3/9). Le bloc centré symétrique est
l'exception réservée aux moments de rupture. Échappement pleine largeur disponible pour
les stages produits.

---

## 3. Expérience du Hero

**Nom de code : `THE STAGE`**

Un plan-séquence, pas une image d'accueil.

### État initial (0 s)
Fond `--ink-900` pleine hauteur (`100svh`, jamais `100vh` — évite le saut de barre d'URL mobile).
Le monogramme **IA** occupe environ 45 % de la hauteur, centré, en `rgba(242,240,236,0.04)` :
présent comme un filigrane de papier, pas comme un logo posé.

Trois plans de profondeur superposés, contenant des produits détourés :
- **Plan arrière** — 4 à 6 objets, `blur(6px)`, opacité 0,35, échelle 0,7
- **Plan médian** — 3 à 4 objets, nets, échelle 1
- **Plan avant** — 1 à 2 objets, `blur(2px)`, échelle 1,35, partiellement hors-cadre

Chaque objet est posé sur son ombre portée, ancré au sol par un filet horizontal —
il ne « flotte » pas, il est **exposé**.

Par-dessus, à gauche, sur 5 colonnes : le label d'index, le H1 en Instrument Serif,
une ligne de bénéfice en Archivo, puis le CTA primaire et le CTA secondaire subordonné.

### Entrée en scène (0 → 1,4 s)
Le H1 apparaît par mots, décalés de 40 ms, en montée de 18 px avec masque de débordement
(*mask reveal*, pas un simple fondu). Les plans entrent du plus lointain au plus proche,
décalés de 90 ms. Le filet de sol se trace horizontalement de 0 à 100 %.
Courbe : `cubic-bezier(0.16, 1, 0.3, 1)`. Aucun rebond, aucune élasticité.

### Réactivité au pointeur (continue, desktop uniquement)
Les trois plans se déplacent en sens inverse du curseur — **amplitude maximale 14 px**,
amortie, jamais 1:1. Suffisant pour que l'image respire, invisible en tant qu'effet.
Désactivé sur pointeur grossier et sous `prefers-reduced-motion`.

### Sortie au scroll (0 → 1 écran)
Le hero est épinglé sur ~120 % de la hauteur d'écran. Pendant ce parcours :
les plans se stratifient à des vitesses différentes, le monogramme croît de 4 %,
le H1 s'élève et s'estompe, la section suivante remonte par-dessus.
Aucun défilement détourné : le scroll natif reste maître, aucun *smooth scroll* n'est appliqué.

### Dérive chromatique
`--signal` prend la teinte de la famille dominante affichée et pilote le filet de sol,
le point d'index et le soulignement du lien. Le changement s'opère sur 800 ms. Il se
remarque après coup, jamais pendant.

### Dégradations (non négociables)
| Condition | Rendu |
|---|---|
| `prefers-reduced-motion: reduce` | Composition finale immédiate, statique. Aucun mouvement, aucun épinglage, aucun parallaxe. Le hero reste beau — il est composé pour l'être |
| JavaScript absent ou en échec | Composition statique complète en HTML/CSS. Contenu et CTA intégralement fonctionnels |
| Mobile < 768 px | Pas d'épinglage, pas de pointeur, 2 plans au lieu de 3, composition recadrée verticalement. Le H1 passe avant le visuel |
| Connexion lente | Le texte s'affiche d'abord ; les objets apparaissent progressivement sans décalage de mise en page (dimensions réservées) |

---

## 4. Catalogue et marques

**Brand Wall** — grille de filets d'un pixel, sans carte, sans ombre. Chaque marque occupe une
cellule ; au survol, la cellule s'assombrit, le logo passe à pleine opacité et une métadonnée
en `label` apparaît en bas de cellule. Un balayage lent traverse la grille au repos —
imperceptible, il empêche la grille d'être morte.

**Product Showcase** — séquence horizontale épinglée (une seule sur tout le site, sur la
homepage). Les familles défilent latéralement pendant un scroll vertical, chacune imposant
sa `--signal` à l'environnement. Sur mobile : défilement horizontal natif à points d'ancrage,
sans épinglage.

**Catalogue** — sections claires sur `--paper` : le catalogue se lit, il ne se contemple pas.
Rupture volontaire avec le noir de la homepage — le passage du théâtre à l'inventaire est
un geste éditorial, et il rend le catalogue plus lisible et plus imprimable.
Chaque produit : index numéroté, visuel, nom, marque, format. Filtres en colonne latérale
sur desktop, en tiroir plein écran sur mobile.

---

## 5. Mouvement — principes

1. **Toute animation doit répondre à une question** : où suis-je, qu'est-ce qui a changé, qu'est-ce qui est lié.
2. **Durées** — micro 120–180 ms · transitions 240–320 ms · scène 600–900 ms. Rien au-delà de 1 s sauf le hero.
3. **Courbes** — entrée `cubic-bezier(0.16,1,0.3,1)`, sortie `cubic-bezier(0.7,0,0.84,0)`. Aucun `ease-in-out` par défaut, aucun rebond.
4. **Uniquement `transform` et `opacity`** pour tout ce qui est animé en continu.
5. **Décalage (stagger)** ≤ 60 ms, sur 6 éléments maximum : au-delà, l'attente devient perceptible.
6. **Aucune animation ne bloque** la lecture, la navigation, le focus ou la conversion.
7. **`prefers-reduced-motion` est une exigence de conception**, pas un correctif de fin de projet.

---

## 6. États interactifs

Aucun état par défaut du navigateur n'est conservé.

| Élément | Repos | Survol | Focus visible | Actif |
|---|---|---|---|---|
| CTA primaire | Aplat `--paper`, texte `--ink-900`, angles nets | Inversion vers `--ink-900` / bordure `--paper`, 200 ms | Contour 2 px `--paper` + décalage 3 px | Échelle 0,985 |
| CTA secondaire | Texte `--text-primary`, filet inférieur | Le filet passe à `--signal`, se trace de gauche à droite | Contour 2 px | — |
| Lien de navigation | `--text-secondary` | `--text-primary` + filet | Contour 2 px | — |
| Cellule de marque | Filet `--rule` | Fond `--ink-800`, logo à 100 % | Contour 2 px intérieur | — |
| Champ de saisie | Fond `--ink-700`, filet inférieur | Filet `--rule-strong` | Filet `--signal` 2 px + contour | — |
| Champ en erreur | — | — | — | Filet `#FF6B7D` + message lié |

Le focus n'est **jamais** identique au survol : il est toujours plus contrasté.

---

## 7. Interdits explicites

Gradient violet · glow · glassmorphism · cartes arrondies uniformes · icônes génériques ·
hero SaaS avec image à droite · badges décoratifs · carrousel automatique · photo d'entrepôt
en banque d'images · visuels générés par IA · animation démonstrative · titre creux
(« Réinventez votre avenir ») · émojis · ombres portées diffuses · `#000` pur · `#FFF` pur ·
défilement détourné (*smooth scroll* JS) · texte sur image sans garantie de contraste.
