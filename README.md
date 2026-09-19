# EMOM Track — version web

Application de suivi de séances EMOM, circuits et pyramides.
Site statique **autonome** : aucun serveur, aucune base de données, aucun CDN.
Les données sont stockées dans le `localStorage` du navigateur.

## Mettre en ligne

Déposer le contenu de ce dossier à la racine de l'hébergement (ou dans un
sous-dossier — tous les chemins sont relatifs).

**HTTPS obligatoire.** Sans certificat, le service worker ne s'enregistre pas :
plus de notifications de fin de chrono ni d'installation sur l'écran d'accueil.
Le son de reprise, lui, continue de fonctionner.

### GitHub Pages

1. Pousser ce dossier sur un dépôt
2. Settings → Pages → Source : `Deploy from a branch`, branche `main`, dossier `/ (root)`
3. L'URL apparaît après une minute environ

## Installer sur téléphone

Ouvrir l'URL, puis :

- **Android / Chrome** — menu ⋮ → « Installer l'application »
- **iOS / Safari** — bouton Partager → « Sur l'écran d'accueil »

L'app s'ouvre alors en plein écran, sans barre de navigateur.

## Contenu

| | |
|---|---|
| `index.html` | Page unique |
| `src/` | Code applicatif (JSX **déjà compilé** en JS) |
| `vendor/` | React, Chart.js, Lucide, QRCode, police DM Sans — copies locales |
| `icons/` | Icônes PWA |
| `manifest.json` | Manifeste d'installation |
| `sw.js` | Service worker (notifications uniquement, pas de cache hors ligne) |

## Modifier le code

Ce dossier est **généré** : ne pas y éditer les fichiers, ils sont écrasés à
chaque build. Les sources vivent dans le projet `Emom Track`, et se
reconstruisent avec :

```
npm run site
```
