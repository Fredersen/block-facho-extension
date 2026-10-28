# Fiche Chrome Web Store — textes à copier-coller

Ce dossier `store/` sert uniquement à la publication : il n'est pas inclus dans le .zip.

---

## Onglet « Fiche Play Store » (Store listing)

**Nom** (repris du manifest) : Blockfacho auto

**Résumé** (repris du manifest, 132 caractères max) :
Bloque automatiquement sur X les comptes de la liste onbloquelextremedroite.fun, à un rythme modéré.

**Catégorie** : Réseaux sociaux et communication

**Langue** : Français

**Description détaillée** :

```
Blockfacho auto bloque pour toi, sur X (Twitter), les comptes de la liste vérifiée du site onbloquelextremedroite.fun, avec l'accord de son auteur.

Comment ça marche
• Clique sur « Lancer l'assaut » : l'extension récupère la liste du site.
• Un onglet en arrière-plan ouvre chaque profil et clique sur « Bloquer », comme tu le ferais à la main.
• Chaque compte traité fait tomber une pierre de la citadelle. Objectif : l'abattre.

Un rythme maîtrisé
• Un délai aléatoire entre deux blocages, selon la cadence choisie : Prudente (30 à 100 s, par défaut), Rapide (15 à 40 s) ou Turbo (5 à 15 s).
• Une limite quotidienne réglable (20 par défaut). Une fois atteinte, l'extension reprend toute seule le lendemain.
• Arrêt automatique en cas d'erreurs répétées.

Respect de ta vie privée
• Aucune donnée collectée ni envoyée : tout reste dans ton navigateur.
• L'extension n'a pas accès à ton mot de passe et ne lit ni tes messages ni ton fil.
• Code source ouvert, sous licence MIT : https://github.com/Fredersen/block-facho-extension

À savoir
Les règles de X encadrent l'automatisation. Même à un rythme lent, X peut restreindre temporairement un compte qui bloque beaucoup de profils. Tu utilises l'extension sous ta responsabilité.
```

**Icône** : `store/icone-store-128.png` (96 × 96 px utiles + 16 px de marge transparente, comme le demandent les consignes)

**Captures d'écran** (1280 × 800) : `store/capture-clair.png`, `store/capture-sombre.png`

**Petite vignette promotionnelle** (440 × 280) : `store/vignette-440x280.png` ou `.jpg`

**Image promotionnelle du haut de page** (1400 × 560, facultative) : `store/banniere-1400x560.png` ou `.jpg`

**Site web** : https://github.com/Fredersen/block-facho-extension

**URL d'assistance** : https://github.com/Fredersen/block-facho-extension/issues

---

## Onglet « Pratiques de confidentialité » (Privacy practices)

**Objectif unique** (Single purpose) :
```
Bloquer automatiquement sur X (Twitter), à la demande de l'utilisateur et à un rythme modéré, les comptes de la liste publique et vérifiée du site onbloquelextremedroite.fun. L'utilisateur lance et met en pause les blocages depuis le popup, et règle une limite quotidienne.
```

**Justification des autorisations** :

| Autorisation | Justification à coller |
|---|---|
| `storage` | Enregistrer localement la liste des comptes, le résultat pour chaque compte, le compteur du jour et la limite quotidienne choisie. |
| `alarms` | Espacer les blocages selon la cadence choisie par l'utilisateur et reprendre automatiquement le lendemain quand la limite quotidienne est atteinte. |
| `scripting` | Exécuter, uniquement sur la page du profil X à bloquer, le script inclus dans l'extension qui clique sur « Bloquer » puis sur « Confirmer », comme le ferait l'utilisateur. |
| Accès à l'hôte | `https://x.com/*` : ouvrir dans un onglet en arrière-plan le profil X de chaque compte de la liste et y exécuter le script de blocage, avec la session X déjà ouverte de l'utilisateur. `https://onbloquelextremedroite.fun/*` : télécharger la liste publique des comptes à bloquer. Aucun autre site n'est concerné et aucune donnée n'est envoyée. |

**Code distant** (Remote code) : **Non**, je n'utilise pas de code distant.
La liste téléchargée est lue comme du texte, et les données en sont extraites avec `JSON.parse` : elle n'est jamais exécutée. Les comptes validés de `/api/accounts` sont du JSON, lu de la même façon.

**Utilisation des données** : ne cocher **aucune** catégorie de données collectées, puis cocher les 3 attestations :
- je ne vends ni ne transfère les données des utilisateurs à des tiers, hors cas autorisés ;
- je n'utilise ni ne transfère les données à des fins sans rapport avec l'objectif unique ;
- je n'utilise ni ne transfère les données pour déterminer la solvabilité ou accorder des prêts.

**URL de la politique de confidentialité** :
https://github.com/Fredersen/block-facho-extension/blob/main/PRIVACY.md

---

## Onglet « Distribution »

- **Visibilité** : Public
- **Régions** : toutes, ou seulement la France et les pays francophones
- **Tarif** : gratuit
