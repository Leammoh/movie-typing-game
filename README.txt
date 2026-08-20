# Movie Typing Game — V2

## Lancer le projet

Ouvre `index.html` dans un navigateur moderne.

Le jeu utilise l'élément HTML `<video>` pour lire les fichiers MP4. Si la lecture automatique avec son est bloquée par le navigateur, clique sur la vidéo pour démarrer la lecture.

## Ajouter tes scènes

Chaque film possède un dossier :

- `movies/terminator1/`
- `movies/terminator2/`
- `movies/aliens/`
- `movies/robocop1/`
- `movies/robocop2/`

Dépose tes fichiers vidéo dans le dossier correspondant avec les noms :

- `scene01.mp4`
- `scene02.mp4`

Puis modifie les phrases correspondantes dans `game.js`.

Exemple :

{
  file: "scene01.mp4",
  type: "ACTION",
  hint: "Scène 1",
  text: "TON TEXTE ICI"
}

## Important

Cette archive ne contient aucun extrait de film commercial ni dialogue protégé. Ajoute uniquement des médias et textes pour lesquels tu disposes des droits ou d'une licence appropriée.

## Prochaine étape

Pour une V3, le moteur peut être transformé afin qu'une seule vidéo contienne plusieurs déclencheurs temporels : le joueur tape une phrase, puis la vidéo reprend exactement au point voulu. On pourra également ajouter niveaux, combos, WPM, sauvegarde des scores et interface mobile.
