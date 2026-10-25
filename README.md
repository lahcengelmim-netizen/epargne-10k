# Épargne 10K

Application personnelle mobile-first pour suivre revenus, dépenses et versements d'épargne avec un objectif de 10 000 DH.

## Démarrer sur votre ordinateur
1. Installer Node.js (version 20 ou récente).
2. Dans ce dossier, exécuter `npm install`.
3. Exécuter `npm run dev -- --host 0.0.0.0`.
4. Ouvrir l'adresse locale affichée par Vite.

## Installer sur un téléphone ou un ordinateur
Pour rendre l'application accessible partout, publiez d'abord le dossier `dist` sur un hébergement web en HTTPS (par exemple Netlify, Vercel ou GitHub Pages) :

1. Exécutez `npm install`, puis `npm run build`.
2. Publiez le contenu du dossier `dist` sur votre hébergement HTTPS.
3. Ouvrez le lien publié sur le téléphone.
4. Sur Android/Chrome, touchez **Installer l'application** si le bouton apparaît, ou le menu ⋮ puis **Installer l'application** / **Ajouter à l'écran d'accueil**.
5. Sur iPhone/iPad, ouvrez le lien dans Safari, touchez **Partager**, puis **Sur l'écran d'accueil**.

Le site doit rester publié pour être accessible partout. Après une première visite, le service worker met en cache l'application pour permettre son ouverture hors ligne. L'installation n'est pas disponible depuis `file://`; utilisez un hébergement HTTPS.

## Fonctionnalités
- Revenus, dépenses et versements d'épargne (ajout, modification, suppression)
- Calculs automatiques du solde, des dépenses, revenus et de l'épargne cumulée
- Objectif configurable et durée de 2 à 12 mois
- Graphique mensuel, filtres et historique
- Export de sauvegarde JSON
- Icône d'application, manifeste PWA et cache hors ligne

## Données et confidentialité
Les données sont conservées dans `localStorage` du navigateur utilisé. Il n'y a pas de compte, serveur ou synchronisation cloud. Exportez vos données régulièrement. Si le stockage du navigateur est effacé, les données locales peuvent être perdues.

## Avant une utilisation importante
Testez les calculs et la sauvegarde. L'application n'est pas un service bancaire et ne se connecte pas à un compte bancaire. La configuration PWA et les icônes devront être complétées avant une distribution publique.
