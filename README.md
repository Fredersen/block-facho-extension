# Blockfacho auto 🐢🏰

Extension Chrome qui bloque automatiquement sur X (Twitter) les comptes de la liste
[onbloquelextremedroite.fun](https://onbloquelextremedroite.fun/site), à un rythme lent
pour ne pas se faire repérer comme un robot.

Chaque compte bloqué fait tomber une pierre de la citadelle. Objectif : l'abattre.

## ⚠️ À lire avant d'utiliser

- **Les règles de X interdisent l'automatisation.** Bloquer beaucoup de comptes peut entraîner
  une restriction temporaire de ton compte. L'extension est volontairement lente
  (30 à 100 secondes entre deux blocages, 20 par jour par défaut), mais le risque n'est pas nul.
  Tu l'utilises sous ta responsabilité.
- **L'extension clique sur les boutons du site de X.** Si X modifie son site, elle peut cesser
  de fonctionner jusqu'à la prochaine mise à jour.

## Installation

1. Télécharge ce dépôt : bouton vert **Code → Download ZIP**, puis décompresse le fichier.
2. Dans Chrome, ouvre `chrome://extensions`.
3. Active le **Mode développeur** (en haut à droite).
4. Clique sur **« Charger l'extension non empaquetée »** et choisis le dossier décompressé
   (celui qui contient `manifest.json`).
5. Épingle l'extension : icône puzzle 🧩, puis punaise 📌.

## Utilisation

1. Connecte-toi à X dans Chrome.
2. Ouvre l'extension et clique sur **« À l'assaut ! »**.
3. Un onglet s'ouvre en arrière-plan : il visite chaque profil et clique sur « Bloquer ».
   Tu peux continuer à utiliser Chrome normalement.
4. **« Trêve »** met en pause. La limite quotidienne se règle dans le popup ;
   une fois atteinte, l'extension reprend toute seule le lendemain.

## Fonctionnement et vie privée

- La liste des comptes est téléchargée depuis `onbloquelextremedroite.fun` (liste vérifiée du site),
  avec l'accord de son auteur.
- Tout le reste se passe **dans ton navigateur** : aucune donnée n'est envoyée ailleurs,
  ni sur un serveur, ni au site de la liste.
- La progression est enregistrée localement dans Chrome.

| Fichier | Rôle |
|---|---|
| `manifest.json` | Déclaration de l'extension et de ses permissions |
| `background.js` | Le moteur : récupère la liste, ouvre les profils, bloque, gère le rythme |
| `popup.html` / `popup.js` | L'interface : citadelle, citations, statistiques |

Astuce : ouvrir `popup.html` directement dans un navigateur affiche un aperçu avec des données
fictives, pratique pour retoucher le design.

## Mettre à jour

Télécharge la nouvelle version, remplace les fichiers, puis clique sur **↻ Recharger**
sur la carte de l'extension dans `chrome://extensions`. Ta progression est conservée.
