/**
 * GÉNÉRATEUR DU SITE DE REDIRECTION.
 *
 * Le client possède deux domaines et n'en sert qu'un. L'autre ne doit pas
 * rester en l'air : laissé tel quel, il servirait le MÊME contenu sous une
 * autre adresse et les deux se concurrenceraient à l'indexation — c'est
 * exactement le piège que ce fichier existe pour fermer.
 *
 * Ce script produit un `public_html` minuscule à déposer sur le domaine
 * SECONDAIRE. Il ne contient aucune page : tout y renvoie vers le domaine
 * principal, en UNE seule redirection permanente, chemin et chaîne de
 * requête préservés.
 *
 * Les deux hôtes sont LUS DEPUIS `site.config.mjs`, jamais saisis ici. Écrits
 * en dur, ils cesseraient de suivre le jour où le domaine principal change,
 * et la redirection pointerait vers l'ancien site — en 301, donc mise en
 * cache par les navigateurs, donc très difficile à rattraper.
 *
 * Exécution : node scripts/build-redirect.mjs
 * Sortie    : release/redirect-<domaine secondaire>/public_html/
 */

import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { FOREIGN_APEX, SITE_HOST } from '../site.config.mjs';

if (FOREIGN_APEX === null) {
  console.error(
    'Aucun domaine secondaire : `SITE_HOST` ne correspond à aucun des ' +
      'domaines connus du client. Rien à rediriger.',
  );
  process.exit(1);
}

const OUT = resolve(process.cwd(), 'release', `redirect-${FOREIGN_APEX}`, 'public_html');

/**
 * Une seule règle, sans condition.
 *
 * Inutile de tester le schéma ou l'hôte : sur ce domaine, TOUT doit partir.
 * La condition combinée du site principal n'a de sens que là où certaines
 * requêtes doivent être servies ; ici, aucune ne l'est.
 *
 * `$1` reprend le chemin ; mod_rewrite réattache seul la chaîne de requête
 * puisque la substitution n'en porte pas. `R=301` est permanent : c'est lui
 * qui transfère l'autorité acquise par l'ancien domaine, un 302 ne le ferait
 * pas.
 */
const htaccess = `# ==========================================================================
# ${FOREIGN_APEX} — DOMAINE SECONDAIRE, REDIRECTION INTÉGRALE
#
# ⚠️ FICHIER GÉNÉRÉ — ne pas éditer à la main.
#    Source : scripts/build-redirect.mjs, hôtes lus dans site.config.mjs
#
# Ce domaine ne sert AUCUN contenu. Tout part vers ${SITE_HOST},
# en une seule redirection permanente, chemin et paramètres préservés.
#
# ⚠️ Le certificat SSL de ce domaine doit RESTER valide : sans lui, un
#    visiteur arrivant en https ne verra pas la redirection mais une erreur
#    de certificat, ce qui est pire que l'ancien site.
# ==========================================================================

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteRule ^(.*)$ https://${SITE_HOST}/$1 [R=301,L]
</IfModule>

# Repli si mod_rewrite est absent : au moins la racine part au bon endroit.
<IfModule !mod_rewrite.c>
  Redirect 301 / https://${SITE_HOST}/
</IfModule>

# PAS de X-Robots-Tag « noindex » ici, et c'est délibéré.
#
# L'intuition dit l'inverse : ce domaine ne doit pas être indexé, donc
# « noindex ». Mais une 301 ne demande pas à être désindexée, elle demande à
# être SUIVIE : elle dit « cette page vit désormais là-bas, reporte dessus ce
# que tu lui accordais ». Les deux instructions se contredisent, et quand un
# moteur fusionne l'ancienne URL avec la nouvelle — c'est précisément ce que
# la 301 lui demande — le « noindex » peut suivre la fusion et s'appliquer à
# la cible. On désindexerait le site principal pour protéger un domaine qui
# ne sert rien.
#
# La 301 suffit : l'ancienne URL sort de l'index d'elle-même une fois le
# transfert constaté, et elle en sort en ayant transmis son autorité au lieu
# de la perdre.
`;

/**
 * Page de repli, servie uniquement si Apache n'applique pas le `.htaccess`.
 *
 * Elle ne contient aucun contenu éditorial — une page de redirection qui
 * raconte quelque chose finirait par être indexée, ce qui est précisément ce
 * qu'on évite. Le `canonical` désigne la cible ; le lien reste cliquable pour
 * qui a désactivé le rafraîchissement automatique.
 *
 * Pas de `noindex` non plus, pour la même raison que dans le `.htaccess` :
 * un rafraîchissement immédiat est lu comme une redirection, et le
 * `canonical` demande la fusion avec la cible. Y ajouter « noindex » ferait
 * porter l'interdiction sur la page avec laquelle on demande la fusion.
 */
const index = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="0; url=https://${SITE_HOST}/">
<link rel="canonical" href="https://${SITE_HOST}/">
<title>Ivan Arsenov</title>
</head>
<body>
<p>This site has moved to <a href="https://${SITE_HOST}/">${SITE_HOST}</a>.</p>
</body>
</html>
`;

await rm(resolve(OUT, '..'), { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, '.htaccess'), htaccess);
await writeFile(join(OUT, 'index.html'), index);

console.log(`  ${FOREIGN_APEX}  →  ${SITE_HOST}`);
console.log(`  écrit dans ${OUT}`);
