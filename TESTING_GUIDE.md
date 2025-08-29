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

## 🔗 Test des Webhooks Meta

### Configuration des Webhooks

1. **Variables d'environnement requises** :
   Assurez-vous que votre fichier `.env` contient :
   ```env
   FACEBOOK_WEBHOOK_VERIFY_TOKEN="ZobA_W3bH0oK_S3cr3T_Str1n9_2025"
   FACEBOOK_APP_SECRET="votre_app_secret"
   NEXT_PUBLIC_FACEBOOK_APP_ID="votre_app_id"
   ```

2. **URL du Webhook** :
   ```
   https://votre-domaine.com/api/webhooks/meta
   ```

3. **Token de Vérification** :
   - Utiliser la valeur de `FACEBOOK_WEBHOOK_VERIFY_TOKEN`
   - Doit correspondre à celle configurée dans l'App Facebook

3. **Événements à Souscrire** :
   - `messages` : Messages entrants
   - `messaging_postbacks` : Clics sur boutons
   - `message_deliveries` : Confirmations de livraison
   - `message_reads` : Confirmations de lecture

### Test de Vérification du Webhook

```bash
# Test GET pour vérification
curl "https://votre-domaine.com/api/webhooks/meta?hub.mode=subscribe&hub.verify_token=VOTRE_TOKEN&hub.challenge=test123"

# Réponse attendue : "test123"
```

### Test de Réception de Messages

1. **Envoyer un message** à votre page Facebook depuis un compte test
2. **Vérifier les logs** de l'application :
   ```bash
   # Logs attendus
   Message traité: m_xxx de 1234567890
   ```

3. **Vérifier en base de données** :
   ```sql
   -- Nouveau client créé
   SELECT * FROM "Customer" WHERE phone = 'FACEBOOK_USER_ID';
   
   -- Nouvelle conversation
   SELECT * FROM "Conversation" WHERE "externalId" = 'FACEBOOK_USER_ID';
   
   -- Nouveau message
   SELECT * FROM "Message" WHERE "externalId" = 'FACEBOOK_MESSAGE_ID';
   ```

### Types de Messages Supportés

| Type | Description | Traitement |
|------|-------------|------------|
| **Texte** | Message texte simple | Stocké dans `content` |
| **Image** | Photo envoyée | URL dans `mediaUrl`, type `IMAGE` |
| **Audio** | Message vocal | URL dans `mediaUrl`, type `AUDIO` |
| **Vidéo** | Vidéo envoyée | URL dans `mediaUrl`, type `VIDEO` |
| **Document** | Fichier joint | URL dans `mediaUrl`, type `DOCUMENT` |
| **Postback** | Clic sur bouton | Traité comme message système |

### Structure des Données Webhook

```json
{
  "object": "page",
  "entry": [
    {
      "id": "PAGE_ID",
      "time": 1234567890,
      "messaging": [
        {
          "sender": { "id": "USER_ID" },
          "recipient": { "id": "PAGE_ID" },
          "timestamp": 1234567890,
          "message": {
            "mid": "MESSAGE_ID",
            "text": "Hello World"
          }
        }
      ]
    }
  ]
}
```

### Débogage des Webhooks

1. **Vérifier la signature** :
   ```bash
   # Header attendu
   X-Hub-Signature-256: sha256=xxx
   ```

2. **Logs d'erreur courants** :
   - `Signature webhook invalide` : Vérifier `FACEBOOK_APP_SECRET`
   - `Canal non trouvé` : Page non connectée dans l'application
   - `FACEBOOK_APP_SECRET non configuré` : Variable d'environnement manquante

3. **Test avec ngrok** (développement local) :
   ```bash
   # Installer ngrok
   npm install -g ngrok
   
   # Exposer le port local
   ngrok http 3000
   
   # Utiliser l'URL ngrok dans Facebook
   https://xxx.ngrok.io/api/webhooks/meta
   ```

### Monitoring en Production

1. **Métriques à surveiller** :
   - Nombre de webhooks reçus
   - Temps de traitement
   - Erreurs de signature
   - Messages non traités

2. **Logs recommandés** :
   ```javascript
   console.log(`Webhook reçu: ${payload.entry.length} entrées`);
   console.log(`Message traité: ${message.mid} de ${sender.id}`);
   console.error(`Erreur traitement: ${error.message}`);
   ```

## Prochaines étapes

1. **Implémentation de la session utilisateur** : Remplacer `'default-shop-id'` par le vrai `shopId`
2. **Interface de gestion des canaux** : Permettre la déconnexion/reconnexion
3. **Tests d'intégration** : Envoyer/recevoir des messages via les APIs Meta
4. **Monitoring** : Logs et métriques pour la production
5. **Optimisations** : Cache, rate limiting, retry logic

## Support

En cas de problème :
1. Vérifier les logs de l'application
2. Consulter la [documentation Meta for Developers](https://developers.facebook.com/docs/)
3. Vérifier les permissions de l'application Facebook
4. Tester avec le Graph API Explorer