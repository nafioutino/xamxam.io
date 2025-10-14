# Intégration WhatsApp avec Evolution API (Baileys)

## 📋 Vue d'ensemble

Ce document décrit l'intégration de WhatsApp dans XAMXAM en utilisant **Evolution API** avec la méthode **Baileys**. Cette implémentation remplace l'ancienne intégration directe avec Baileys.js.

## 🏗️ Architecture

```
Frontend (Next.js Page)
    ↓ HTTP REST
Backend (Next.js API Routes)
    ↓ HTTP REST
Evolution API (avec Baileys)
    ↓ WebHooks
Backend (Webhook Handler)
    ↓ Database Update
Supabase PostgreSQL
```

## 📁 Fichiers créés/modifiés

### 1. **Types TypeScript**
- `src/types/evolution-api.ts` - Types complets pour Evolution API

### 2. **Service Layer**
- `src/services/whatsapp/evolutionApiService.ts` - Service d'abstraction pour Evolution API

### 3. **API Routes**
- `src/app/api/channels/whatsapp/route.ts` - Endpoint pour gérer les instances WhatsApp
  - Actions: `create_instance`, `get_qrcode`, `check_status`
  
### 4. **Webhook Handler**
- `src/app/api/webhooks/evolution/route.ts` - Réception des événements Evolution API
  - Gère: QR Code, Connexion, Messages entrants, Mises à jour de statut

### 5. **Frontend**
- `src/app/dashboard/channels/connect/whatsapp/page.tsx` - Page de connexion WhatsApp avec QR Code

### 6. **Configuration**
- `.env.example` - Variables d'environnement ajoutées

## ⚙️ Configuration

### Variables d'environnement requises

```bash
# Evolution API Configuration
EVOLUTION_API_URL="https://your-evolution-api-url.com"
EVOLUTION_API_KEY="your_evolution_api_key"
WEBHOOK_GLOBAL_URL="https://your-domain.com/api/webhooks/evolution"
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
```

### Configuration Evolution API

Assurez-vous que votre instance Evolution API est configurée avec :
- **Integration**: `WHATSAPP-BAILEYS`
- **Webhooks activés** vers votre endpoint

## 🚀 Flux d'utilisation

### 1. Connexion d'un compte WhatsApp

1. L'utilisateur accède à `/dashboard/channels/connect/whatsapp`
2. Click sur "Démarrer la connexion"
3. Le système:
   - Crée une instance Evolution API (`shop_{shopId}`)
   - Génère un QR code
   - Affiche le QR code à l'utilisateur
4. L'utilisateur scanne le QR code avec WhatsApp
5. Polling automatique vérifie le statut toutes les 3 secondes
6. Une fois connecté, redirection vers `/dashboard/channels`

### 2. Réception de messages

Quand un message est reçu :

1. **Evolution API** détecte le message
2. Envoie un webhook `messages.upsert` à `/api/webhooks/evolution`
3. Le webhook handler:
   - Trouve/crée le **Customer** (basé sur le numéro de téléphone)
   - Trouve/crée la **Conversation**
   - Crée le **Message** dans la base de données
   - Met à jour `lastMessageAt` et `unreadCount`

### 3. Envoi de messages

Pour envoyer un message:

```typescript
import { evolutionApiService } from '@/services/whatsapp/evolutionApiService';

await evolutionApiService.sendTextMessage('shop_123', {
  number: '5585988888888', // Format: country code + number (no + or spaces)
  text: 'Bonjour ! Comment puis-je vous aider ?',
  delay: 1000,
  linkPreview: true,
});
```

## 📊 Modèle de données

### Table `Channel`
```prisma
{
  id: uuid
  type: 'WHATSAPP'
  externalId: 'shop_{shopId}' // Instance name
  isActive: boolean
  shopId: uuid
}
```

### Table `WhatsAppSession`
```prisma
{
  id: uuid
  sessionId: string
  sessionData: json
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Table `Conversation`
```prisma
{
  id: uuid
  platform: 'WHATSAPP'
  externalId: '5585988888888@s.whatsapp.net' // remoteJid
  shopId: uuid
  customerId: uuid
  lastMessageAt: timestamp
  unreadCount: integer
}
```

### Table `Message`
```prisma
{
  id: uuid
  conversationId: uuid
  content: string
  messageType: MessageType
  mediaUrl: string?
  isFromCustomer: boolean
  isRead: boolean
  externalId: string // Message ID from WhatsApp
  metadata: json
  createdAt: timestamp
}
```

## 🔌 API Endpoints

### POST `/api/channels/whatsapp`

**Actions disponibles:**

#### 1. Créer une instance
```json
{
  "shopId": "uuid",
  "action": "create_instance"
}
```

**Response:**
```json
{
  "success": true,
  "instanceName": "shop_uuid",
  "message": "Instance created successfully"
}
```

#### 2. Obtenir le QR code
```json
{
  "shopId": "uuid",
  "action": "get_qrcode",
  "instanceName": "shop_uuid"
}
```

**Response:**
```json
{
  "success": true,
  "qrcode": "data:image/png;base64,...",
  "pairingCode": "ABCD1234"
}
```

#### 3. Vérifier le statut
```json
{
  "shopId": "uuid",
  "action": "check_status",
  "instanceName": "shop_uuid"
}
```

**Response:**
```json
{
  "success": true,
  "status": "open",
  "profileName": "My WhatsApp Business"
}
```

## 📨 Événements Webhook

### `qrcode.updated`
QR code mis à jour (géré côté client)

### `connection.update`
Statut de connexion modifié
- `state: 'open'` → Met à jour `isActive: true` dans la DB
- `state: 'close'` → Met à jour `isActive: false` dans la DB

### `messages.upsert`
Nouveau message reçu
- Crée/trouve le customer
- Crée/trouve la conversation
- Enregistre le message dans la DB

### `messages.update`
Statut du message mis à jour (READ, DELIVERED, etc.)

## 🛠️ Service Methods

### `evolutionApiService`

```typescript
// Créer une instance
createInstance(data: CreateInstanceRequest): Promise<CreateInstanceResponse>

// Connecter et obtenir le QR code
connectInstance(instanceName: string): Promise<ConnectInstanceResponse>

// Vérifier le statut
getInstanceStatus(instanceName: string): Promise<InstanceStatusResponse>

// Envoyer un message texte
sendTextMessage(instanceName: string, data: SendTextMessageRequest): Promise<SendMessageResponse>

// Envoyer une image
sendImageMessage(instanceName: string, data: {...}): Promise<SendMessageResponse>

// Marquer un message comme lu
markMessageAsRead(instanceName: string, data: {...}): Promise<void>

// Redémarrer une instance
restartInstance(instanceName: string): Promise<void>

// Déconnecter une instance
logoutInstance(instanceName: string): Promise<void>

// Supprimer une instance
deleteInstance(instanceName: string): Promise<void>
```

## 🔒 Sécurité

1. **Authentification** : Toutes les routes API vérifient l'authentification Supabase
2. **Autorisation** : Vérification que l'utilisateur est propriétaire du shop
3. **Webhook** : Les webhooks sont sécurisés par l'URL secrète
4. **HTTPS** : Toutes les communications utilisent HTTPS

## 🧪 Tests

### Test de connexion
1. Accéder à `/dashboard/channels/connect/whatsapp`
2. Cliquer sur "Démarrer la connexion"
3. Scanner le QR code avec WhatsApp
4. Vérifier la redirection vers `/dashboard/channels`

### Test d'envoi de message
```bash
# Via REST Client (test_messenger_send.rest)
POST {{baseUrl}}/api/channels/whatsapp
Content-Type: application/json

{
  "shopId": "your_shop_id",
  "action": "send_message",
  "instanceName": "shop_your_shop_id",
  "number": "5585988888888",
  "text": "Test message"
}
```

### Test de réception
1. Envoyer un message depuis WhatsApp vers le numéro connecté
2. Vérifier que le message apparaît dans `/dashboard/inbox`
3. Vérifier dans la DB que le message est bien enregistré

## 📝 Notes importantes

### Format des numéros
- **Toujours utiliser le format international** : `5585988888888`
- **Pas de symbole +** ni d'espaces
- Le remoteJid sera automatiquement : `5585988888888@s.whatsapp.net`

### Gestion des sessions
- Une instance = un compte WhatsApp
- Le nom de l'instance est `shop_{shopId}`
- Les sessions sont gérées automatiquement par Evolution API

### Limitations
- **5 minutes max** pour scanner le QR code
- **Polling toutes les 3 secondes** pour vérifier le statut
- **Messages multimédias** : URL fournie par WhatsApp (temporaire)

## 🐛 Dépannage

### Le QR code ne s'affiche pas
1. Vérifier que `EVOLUTION_API_URL` est correct
2. Vérifier que `EVOLUTION_API_KEY` est valide
3. Consulter les logs de Evolution API

### Les messages ne sont pas reçus
1. Vérifier que le webhook est configuré dans Evolution API
2. Vérifier que `WEBHOOK_GLOBAL_URL` est accessible publiquement
3. Consulter `/api/webhooks/evolution` logs

### L'instance ne se connecte pas
1. Vérifier le statut via `check_status`
2. Redémarrer l'instance via `restartInstance()`
3. Supprimer et recréer l'instance

## 📚 Ressources

- [Evolution API Documentation](https://doc.evolution-api.com/)
- [Baileys Library](https://github.com/WhiskeySockets/Baileys)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)

## 🔄 Migration depuis l'ancienne implémentation

L'ancienne implémentation avec Socket.IO et Baileys direct a été commentée dans le code.
Pour supprimer complètement :

```bash
# Supprimer socket.io-client du package.json
npm uninstall socket.io-client

# Nettoyer les commentaires dans whatsapp/page.tsx (lignes 1-163)
```

---

**Version**: 1.0.0  
**Date**: Octobre 2025  
**Auteur**: XAMXAM Team
