# XAMXAM - Plateforme de Commerce Conversationnel avec IA Intégrée

XAMXAM est une plateforme tout-en-un qui transforme la façon dont les entreprises vendent en ligne en intégrant messagerie unifiée, gestion de catalogue et intelligence artificielle dans une seule solution puissante.

## Fonctionnalités Principales

- **Messagerie Unifiée** : Gérez toutes vos conversations (WhatsApp, Facebook, Instagram, Telegram, TikTok, Email) depuis une seule interface.
- **Gestion de Catalogue** : Créez et gérez facilement votre catalogue de produits avec import/export CSV et synchronisation multi-plateforme.
- **Assistant IA** : Automatisez les réponses aux questions fréquentes et générez du contenu marketing avec notre assistant IA intégré.
- **Suivi des Commandes** : Suivez toutes vos commandes en temps réel et gérez efficacement votre processus de vente de bout en bout.
- **Analyses et Statistiques** : Obtenez des insights précieux sur vos performances commerciales avec des tableaux de bord intuitifs.
- **Personnalisation Complète** : Adaptez la plateforme à vos besoins spécifiques avec des options de personnalisation étendues.

## Technologies Utilisées

- **Frontend** : Next.js 14, React, Tailwind CSS
- **Backend** : Next.js API Routes, Prisma ORM
- **Base de Données** : PostgreSQL avec PGVector pour la recherche vectorielle
- **Authentification** : NextAuth.js avec support pour Google, Facebook
- **IA** : OpenAI GPT-4/Mistral, DALL·E 3, Runway ML
- **Messagerie** : Intégrations avec WhatsApp Business API, Pages Facebook (Messenger), Instagram Direct, Telegram, TikTok, Email

## Prérequis

- Node.js 18.0.0 ou supérieur
- PostgreSQL 14 ou supérieur
- Comptes développeur pour les plateformes de messagerie que vous souhaitez intégrer

## Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/votre-utilisateur/xamxam.git
   cd xamxam
   ```

2. Installez les dépendances :
   ```bash
   npm install --legacy-peer-deps
   ```

3. Configurez les variables d'environnement :
   ```bash
   cp .env.example .env.local
   ```
   Puis modifiez le fichier `.env.local` avec vos propres clés API et configurations.

4. Initialisez la base de données :
   ```bash
   npx prisma migrate dev --name init
   ```

5. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

6. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir l'application.

## Structure du Projet

```
/src
  /app                 # Routes et pages Next.js
    /(auth)            # Pages d'authentification
    /(dashboard)       # Pages du tableau de bord
    /api               # Routes API
  /components          # Composants React réutilisables
  /lib                 # Bibliothèques et utilitaires
  /hooks               # Hooks React personnalisés
  /utils               # Fonctions utilitaires
  /types               # Définitions de types TypeScript
  /styles              # Styles globaux
  /services            # Services externes (API, etc.)
  /config              # Fichiers de configuration
/prisma                # Schéma Prisma et migrations
/public                # Fichiers statiques
```

## Déploiement

ZOBA peut être déployé sur n'importe quelle plateforme supportant Next.js, comme Vercel, Netlify, ou un serveur personnalisé.

```bash
# Pour construire l'application pour la production
npm run build

# Pour démarrer l'application en production
npm start
```

## Licence

Ce projet est sous licence [MIT](LICENSE).

## Contact

Pour toute question ou suggestion, veuillez contacter l'équipe ZOBA à support@zoba.app.
