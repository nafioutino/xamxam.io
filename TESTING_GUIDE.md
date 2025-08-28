# Guide de Test - Flux d'Authentification Meta

## Prérequis avant les tests

### 1. Configuration Facebook App
- Créer une application Facebook de type "Business" sur [Meta for Developers](https://developers.facebook.com/)
- Ajouter les produits : Facebook Login, Webhooks, Messenger Platform, Instagram Basic Display, WhatsApp Business Platform
- Configurer les URLs de redirection OAuth :
  - Production : `https://zoba.com/api/auth/callback/meta`
  - Développement : `http://localhost:3000/api/auth/callback/meta`

### 2. Variables d'environnement
Copier `.env.example` vers `.env.local` et remplir :
```bash
NEXT_PUBLIC_FACEBOOK_APP_ID="votre_app_id_facebook"
FACEBOOK_APP_SECRET="votre_app_secret_facebook"
FACEBOOK_WEBHOOK_VERIFY_TOKEN="votre_token_webhook"
ENCRYPTION_SECRET_KEY="votre-clé-de-32-caractères-ici!"
```

### 3. Base de données
- Vérifier que PostgreSQL est en cours d'exécution
- Exécuter les migrations Prisma : `npx prisma migrate dev`
- Générer le client Prisma : `npx prisma generate`

## Flux de Test Complet

### Étape 1 : Démarrer l'application
```bash
npm run dev
```
L'application devrait être accessible sur `http://localhost:3000`

### Étape 2 : Accéder à la page des canaux
1. Naviguer vers `http://localhost:3000/dashboard/channels`
2. Vérifier que les trois cartes de connexion sont affichées :
   - Facebook Messenger
   - Instagram
   - WhatsApp Business

### Étape 3 : Tester la connexion Messenger
1. Cliquer sur "Connecter" pour Facebook Messenger
2. Vérifier la redirection vers `/dashboard/channels/connect/messenger`
3. Cliquer sur "Connecter Facebook Messenger"
4. **Redirection vers Facebook** :
   - URL doit contenir `facebook.com/v18.0/dialog/oauth`
   - Paramètres attendus :
     - `client_id` : votre App ID Facebook
     - `redirect_uri` : `http://localhost:3000/api/auth/callback/meta`
     - `scope` : `pages_show_list,pages_messaging,business_management`
     - `state` : token CSRF généré
     - `extras` : `{"setup":{"channel":"messenger"}}`

### Étape 4 : Autorisation Facebook
1. Se connecter avec un compte Facebook ayant des pages
2. Autoriser l'application à accéder aux pages
3. **Redirection automatique** vers `/api/auth/callback/meta`

### Étape 5 : Traitement du callback
L'API callback devrait :
1. Valider le token CSRF
2. Échanger le code contre un User Access Token
3. Échanger le token courte durée contre un token longue durée
4. Récupérer la liste des pages Facebook
5. Rediriger vers `/dashboard/channels/select-page`

### Étape 6 : Sélection de page
1. Vérifier l'affichage de la liste des pages Facebook
2. Chaque page doit afficher :
   - Nom de la page
   - Catégorie
   - ID de la page
   - Permissions (messaging, manage)
3. Cliquer sur "Connecter cette page" pour une page

### Étape 7 : Finalisation
L'API de finalisation devrait :
1. Obtenir un Page Access Token permanent
2. Chiffrer et stocker le token en base de données
3. Souscrire aux webhooks Facebook
4. Rediriger vers `/dashboard/channels` avec un message de succès

### Étape 8 : Vérification en base de données
```sql
-- Vérifier que le canal a été créé
SELECT id, type, "externalId", "isActive", "createdAt" 
FROM "Channel" 
WHERE type = 'FACEBOOK_PAGE';

-- Le accessToken doit être chiffré (format: iv:encrypted:tag)
SELECT "accessToken" FROM "Channel" WHERE type = 'FACEBOOK_PAGE';
```

## Tests pour Instagram et WhatsApp

### Instagram
- Suivre les mêmes étapes en cliquant sur Instagram
- Vérifier les scopes : `instagram_basic,instagram_manage_messages,pages_show_list,business_management`
- Type de canal créé : `INSTAGRAM_DM`

### WhatsApp Business
- Suivre les mêmes étapes en cliquant sur WhatsApp
- Vérifier les scopes : `whatsapp_business_management,whatsapp_business_messaging,business_management`
- Type de canal créé : `WHATSAPP`

## Vérifications de sécurité

### 1. Protection CSRF
- Tenter d'accéder directement à `/api/auth/callback/meta` sans paramètre `state`
- Résultat attendu : Erreur 400 "Invalid or missing CSRF token"

### 2. Chiffrement des tokens
- Vérifier en base que les `accessToken` ne sont pas en clair
- Format attendu : `[hex]:[hex]:[hex]` (iv:encrypted:tag)

### 3. Gestion des erreurs
- Tester avec un App ID invalide
- Tester avec un App Secret invalide
- Vérifier que les erreurs sont loggées mais pas exposées à l'utilisateur

## Débogage

### Logs à surveiller
```bash
# Démarrer avec logs détaillés
DEBUG=* npm run dev

# Ou surveiller les logs spécifiques
tail -f .next/trace
```

### Erreurs communes
1. **"Invalid redirect_uri"** : Vérifier la configuration dans Facebook App
2. **"Invalid client_id"** : Vérifier `NEXT_PUBLIC_FACEBOOK_APP_ID`
3. **"Encryption error"** : Vérifier `ENCRYPTION_SECRET_KEY` (32 caractères minimum)
4. **"Database connection error"** : Vérifier `DATABASE_URL`

### Outils de débogage
- [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Webhook Tester](https://webhook.site/) pour tester les webhooks
- Prisma Studio : `npx prisma studio`

## Nettoyage après tests

```sql
-- Supprimer les canaux de test
DELETE FROM "Channel" WHERE "shopId" = 'default-shop-id';

-- Ou réinitialiser complètement
TRUNCATE TABLE "Channel" CASCADE;
```

## Prochaines étapes

1. **Implémentation de la session utilisateur** : Remplacer `'default-shop-id'` par le vrai `shopId`
2. **Gestion des webhooks entrants** : Créer `/api/webhooks/meta`
3. **Interface de gestion des canaux** : Permettre la déconnexion/reconnexion
4. **Tests d'intégration** : Envoyer/recevoir des messages via les APIs Meta
5. **Monitoring** : Logs et métriques pour la production

## Support

En cas de problème :
1. Vérifier les logs de l'application
2. Consulter la [documentation Meta for Developers](https://developers.facebook.com/docs/)
3. Vérifier les permissions de l'application Facebook
4. Tester avec le Graph API Explorer