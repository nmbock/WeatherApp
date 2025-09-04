# Application Météo

## Description
Cette application web simple, construite avec Node.js, vous permet d'obtenir les conditions météorologiques actuelles pour n'importe quelle ville. Elle utilise l'API gratuite d'Open-Meteo pour récupérer les données.

## Fonctionnalités
- Saisie du nom d'une ville
- Affichage de la température actuelle, de la vitesse du vent et de la description du ciel
- Design simple et réactif grâce à Tailwind CSS

## Installation
1.  **Clonez le dépôt :**
    ```bash
    git clone <URL de votre dépôt>
    cd <nom de votre dossier>
    ```

2.  **Installez les dépendances :**
    ```bash
    npm install
    ```
    *Note : Le projet n'a pas de dépendance, car tout est géré nativement avec Node.js et les modules intégrés (`http`, `url`, `https`, `fs`, `path`). Le fichier `package.json` est inclus pour respecter les bonnes pratiques et faciliter la gestion des dépendances futures.*

## Utilisation
Pour démarrer le serveur de l'application, exécutez la commande suivante :
```bash
npm start