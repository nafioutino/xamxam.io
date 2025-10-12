# Configuration du Webhook Instagram

## Vue d'ensemble

Ce guide explique comment configurer le webhook Instagram dédié pour la messagerie, séparé du webhook Meta/Facebook existant.

## Problème résolu

Le webhook Meta existant (`/api/webhooks/meta`) causait des erreurs de signature `Invalid signature` lors de la réception de messages Instagram car :
- Instagram envoie `"object": "instagram"` dans le payload
- Facebook/Meta envoie `"object": "page"` dans le payload
- Bien qu'ils utilisent le même App Secret, les formats différents causaient des conflits

## Solution

Création d'un webhook Instagram dédié : `/api/webhooks/instagram`

## Configuration requise

### 1. Variables d'environnement

Ajoutez ces variables à votre fichier `.env` :

```env
# Instagram Webhook Configuration
INSTAGRAM_CLIENT_SECRET="d4f889dad537fc4c8e20d64708a44dad"  # Client Secret spécifique à Instagram
INSTAGRAM_WEBHOOK_VERIFY_TOKEN="XamXam_IG_W3bH0oK_S3cr3T_2025"  # Token unique pour Instagram
```

### 2. Configuration Meta Developer Console

1. **Accédez à votre App Instagram dans Meta Developer Console**
2. **Configurez le webhook Instagram :**
   - URL du webhook : `https://votre-domaine.com/api/webhooks/instagram`
   - Token de vérification : `XamXam_IG_W3bH0oK_S3cr3T_2025`
   - Événements à souscrire :
     - `messages` (pour recevoir les messages)
     - `messaging_postbacks` (pour les boutons/actions)
     - `messaging_optins` (pour les opt-ins)

### 3. Permissions requises

Assurez-vous que votre app Instagram a les permissions suivantes :
- `instagram_basic`
- `instagram_manage_messages` (nécessite une révision Meta)
- `pages_messaging` (si connecté à une page Facebook)

## Fonctionnalités du webhook Instagram

### Vérification de signature
- Utilise HMAC SHA256 avec `INSTAGRAM_CLIENT_SECRET`
- Vérifie l'en-tête `x-hub-signature-256`
- Protection contre les requêtes non autorisées

### Gestion des messages
- **Format spécifique Instagram** : `"object": "instagram"`
- **Types de messages supportés :**
  - Messages texte
  - Images
  - Vidéos
  - Audio
  - Reels Instagram
  - Mentions dans les Stories
  - Partages

### Traitement des données
- **Identification du client** : Utilise l'Instagram-scoped ID (IGSID)
- **Récupération des infos utilisateur** : Via l'API Instagram Graph
- **Sauvegarde en base** : Messages, conversations, clients
- **Gestion des pièces jointes** : Support des médias Instagram

## Structure du payload Instagram

```json
{
  "object": "instagram",
  "entry": [
    {
      "id": "instagram_business_account_id",
      "time": 1234567890,
      "messaging": [
        {
          "sender": {
            "id": "instagram_scoped_user_id"
          },
          "recipient": {
            "id": "instagram_business_account_id"
          },
          "timestamp": 1234567890,
          "message": {
            "mid": "message_id",
            "text": "Contenu du message",
            "attachments": [
              {
                "type": "image",
                "payload": {
                  "url": "https://..."
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

## Test du webhook

### 1. Test de vérification
```bash
curl -X GET "https://votre-domaine.com/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=XamXam_IG_W3bH0oK_S3cr3T_2025&hub.challenge=test_challenge"
```

### 2. Test de réception de message
Envoyez un message DM à votre compte Instagram Business depuis un compte personnel.

### 3. Vérification des logs
Surveillez les logs Vercel pour :
```
[Instagram Webhook] Received a POST request.
[Instagram Webhook] Signature validated successfully.
[Instagram Webhook] Processing Instagram message event...
```

## Différences avec le webhook Meta/Facebook

| Aspect | Instagram Webhook | Meta/Facebook Webhook |
|--------|------------------|----------------------|
| **URL** | `/api/webhooks/instagram` | `/api/webhooks/meta` |
| **Object Type** | `"instagram"` | `"page"` |
| **User ID** | Instagram-scoped ID (IGSID) | Page-scoped ID (PSID) |
| **Permissions** | `instagram_manage_messages` | `pages_messaging` |
| **API** | Instagram Graph API | Messenger API |

## Dépannage

### Erreur "Invalid signature"
- Vérifiez que `INSTAGRAM_CLIENT_SECRET` est correctement configuré
- Assurez-vous que le Client Secret correspond à celui de votre app Instagram

### Erreur "Webhook verification failed"
- Vérifiez que `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` correspond au token configuré dans Meta Developer Console

### Messages non reçus
- Vérifiez que les permissions `instagram_manage_messages` sont approuvées
- Assurez-vous que le webhook est correctement configuré dans Meta Developer Console
- Vérifiez que l'URL du webhook est accessible publiquement

### Erreur "No Instagram channel found"
- Assurez-vous qu'un canal Instagram est configuré dans votre base de données
- Vérifiez que l'`externalId` du canal correspond à l'Instagram Business Account ID

## Sécurité

- **Validation de signature** : Toutes les requêtes sont vérifiées avec HMAC SHA256
- **Logs sécurisés** : Les tokens ne sont jamais loggés en clair
- **Gestion d'erreurs** : Les erreurs sont loggées sans exposer de données sensibles
- **Rate limiting** : Meta applique automatiquement des limites de taux

## Monitoring

Surveillez ces métriques :
- Nombre de messages traités avec succès
- Erreurs de signature
- Erreurs de traitement des messages
- Temps de réponse du webhook

Les logs incluent des statistiques détaillées :
```json
{
  "status": "success",
  "processed": 5,
  "errors": 0,
  "timestamp": "2025-01-06T10:30:00.000Z",
  "platform": "instagram"
}
```