# Politique de confidentialité — Blockfacho auto

Dernière mise à jour : 28 octobre 2026

## En résumé

Blockfacho auto **ne collecte, ne transmet et ne vend aucune donnée personnelle**.
Tout se passe dans ton navigateur.

## Ce que fait l'extension

- Elle télécharge la liste publique des comptes depuis
  `https://onbloquelextremedroite.fun/accounts.js` (liste de base) et
  `https://onbloquelextremedroite.fun/api/accounts` (comptes validés depuis).
  Ces requêtes ne contiennent aucune information te concernant.
- Elle ouvre les profils de cette liste sur `x.com`, dans un onglet de ton navigateur,
  et clique sur « Bloquer » avec ta session X déjà ouverte.

## Données enregistrées

L'extension enregistre **uniquement dans ton navigateur** (`chrome.storage.local`) :

- la liste des comptes téléchargée ;
- le résultat pour chaque compte (bloqué, déjà bloqué, introuvable, erreur) ;
- le nombre de blocages du jour et ta limite quotidienne.

Ces données ne quittent jamais ton ordinateur. Elles sont supprimées si tu désinstalles l'extension.

## Ce que l'extension ne fait pas

- Elle ne lit pas tes messages, ton fil, tes abonnés ni aucune autre donnée de ton compte X.
- Elle n'a pas accès à ton mot de passe X.
- Elle n'envoie aucune donnée à un serveur, ni au site de la liste, ni à un tiers.
- Elle n'utilise ni publicité, ni outil de mesure d'audience.

## Contact

Pour toute question : ouvre une issue sur
[github.com/Fredersen/block-facho-extension](https://github.com/Fredersen/block-facho-extension/issues).
