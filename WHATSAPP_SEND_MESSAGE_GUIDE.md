# 📤 Guide d'envoi de messages WhatsApp

## ✅ Implémentation terminée

Le système d'envoi de messages WhatsApp est maintenant **complètement fonctionnel** !

---

## 📋 Architecture

### 1. Service Evolution API (`evolutionApiService.ts`)

**Méthodes disponibles :**

#### `sendTextMessage(instanceName, data)`
Envoie un message texte simple.

```typescript
await evolutionApiService.sendTextMessage('shop_xxx', {
  number: '5585988888888',
  text: 'Bonjour ! Votre commande est prête.',
});
```

#### `sendMediaMessage(instanceName, data)`
Envoie une image, vidéo, audio ou document.

```typescript
await evolutionApiService.sendMediaMessage('shop_xxx', {
  number: '5585988888888',
  mediaType: 'image', // 'image' | 'video' | 'audio' | 'document'
  media: 'https://example.com/image.jpg', // URL ou base64
  caption: 'Voici votre facture',
  fileName: 'facture.pdf', // Optionnel
});
```

---

### 2. API Route `/api/messages/send`

**Endpoint :** `POST /api/messages/send`

**Headers :**
```
Authorization: Bearer <supabase-token>
Content-Type: application/json
```

**Body (Message texte) :**
```json
{
  "conversationId": "uuid-de-la-conversation",
  "content": "Bonjour ! Comment puis-je vous aider ?",
  "messageType": "TEXT"
}
```

**Body (Message avec média) :**
```json
{
  "conversationId": "uuid-de-la-conversation",
  "content": "Voici votre facture",
  "messageType": "IMAGE",
  "mediaUrl": "https://example.com/image.jpg"
}
```

**Réponse (succès) :**
```json
{
  "success": true,
  "message": {
    "id": "uuid",
    "conversationId": "uuid",
    "content": "Bonjour !",
    "messageType": "TEXT",
    "isFromCustomer": false,
    "isRead": true,
    "externalId": "BAE594145F4C59B4",
    "createdAt": "2025-10-15T22:00:00.000Z"
  },
  "evolutionResponse": {
    "key": {
      "remoteJid": "5585988888888@s.whatsapp.net",
      "fromMe": true,
      "id": "BAE594145F4C59B4"
    },
    "message": { ... },
    "messageTimestamp": "1760566339",
    "status": "PENDING"
  }
}
```

**Réponse (erreur) :**
```json
{
  "success": false,
  "error": "Conversation not found"
}
```

---

## 🔒 Sécurité

### Vérifications automatiques :

1. ✅ **Authentification** : L'utilisateur doit être connecté (Supabase Auth)
2. ✅ **Autorisation** : L'utilisateur doit être le propriétaire du shop
3. ✅ **Canal actif** : Un canal WhatsApp actif doit exister
4. ✅ **Validation** : `conversationId` et `content` sont obligatoires

---

## 📱 Utilisation Frontend

### Exemple avec React/Next.js

```typescript
// /components/ChatBox.tsx
async function sendMessage(conversationId: string, content: string) {
  try {
    const response = await fetch('/api/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId,
        content,
        messageType: 'TEXT',
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log('Message envoyé !', data.message);
      // Mettre à jour l'UI
    } else {
      console.error('Erreur:', data.error);
    }
  } catch (error) {
    console.error('Erreur réseau:', error);
  }
}
```

### Exemple avec envoi d'image

```typescript
async function sendImage(conversationId: string, imageUrl: string, caption: string) {
  try {
    const response = await fetch('/api/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId,
        content: caption,
        messageType: 'IMAGE',
        mediaUrl: imageUrl,
      }),
    });

    const data = await response.json();
    if (data.success) {
      console.log('Image envoyée !');
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
}
```

---

## 🧪 Tests

### Test avec cURL

```bash
# Message texte
curl -X POST https://www.xamxam.io/api/messages/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <votre-token>" \
  -d '{
    "conversationId": "uuid-conversation",
    "content": "Bonjour ! Test de message",
    "messageType": "TEXT"
  }'

# Message avec image
curl -X POST https://www.xamxam.io/api/messages/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <votre-token>" \
  -d '{
    "conversationId": "uuid-conversation",
    "content": "Voici votre facture",
    "messageType": "IMAGE",
    "mediaUrl": "https://example.com/facture.jpg"
  }'
```

### Test avec Postman

1. **Méthode :** POST
2. **URL :** `https://www.xamxam.io/api/messages/send`
3. **Headers :**
   - `Content-Type: application/json`
   - `Authorization: Bearer <token>`
4. **Body (raw JSON) :**
   ```json
   {
     "conversationId": "uuid-conversation",
     "content": "Test de message",
     "messageType": "TEXT"
   }
   ```

---

## 📊 Types de messages supportés

| Type | messageType | Exemple d'utilisation |
|------|-------------|----------------------|
| Texte | `TEXT` | Messages simples |
| Image | `IMAGE` | Factures, photos produits |
| Vidéo | `VIDEO` | Tutoriels, démos |
| Audio | `AUDIO` | Messages vocaux |
| Document | `DOCUMENT` | PDFs, fichiers |

---

## 🔄 Workflow complet

### 1. Client envoie un message WhatsApp
```
Client WhatsApp → Evolution API → Webhook → /api/webhooks/evolution
→ Prisma DB (message créé, conversation mise à jour)
→ Frontend (temps réel via polling/websocket)
```

### 2. Agent répond via le dashboard
```
Frontend → /api/messages/send → Evolution API → WhatsApp du client
→ Prisma DB (message sauvegardé)
→ Frontend (message affiché)
```

---

## 🎯 Fonctionnalités

✅ **Envoi de messages texte**
✅ **Envoi d'images**
✅ **Envoi de vidéos**
✅ **Envoi d'audio**
✅ **Envoi de documents**
✅ **Sauvegarde automatique en DB**
✅ **Logs pour monitoring**
✅ **Gestion d'erreurs complète**
✅ **Vérification de sécurité**
✅ **Support multi-shops**

---

## 🚀 Prochaines étapes (optionnelles)

1. **Temps réel** : Ajouter WebSockets ou Supabase Realtime pour mettre à jour l'UI instantanément
2. **Indicateurs de frappe** : Afficher "en train d'écrire..." quand l'agent tape
3. **Messages lus** : Marquer les messages comme lus automatiquement
4. **Pièces jointes** : Upload de fichiers depuis le dashboard
5. **Emojis** : Support complet des emojis
6. **Messages programmés** : Envoyer des messages à une heure précise
7. **Réponses rapides** : Templates de messages fréquents
8. **Assignation** : Assigner des conversations à des agents spécifiques

---

## 📝 Logs

Les logs sont visibles sur Vercel :

### Messages envoyés
```bash
[info] 📤 Envoi de message WhatsApp: {
  "conversationId": "uuid",
  "phoneNumber": "5585988888888",
  "messageType": "TEXT",
  "instance": "shop_xxx"
}
[info] ✅ Message envoyé avec succès: {
  "messageId": "uuid",
  "externalId": "BAE594145F4C59B4"
}
```

### Messages reçus
```bash
[info] 🔔 Webhook Evolution reçu: messages.upsert
[info] 📩 MESSAGE WHATSAPP REÇU: {
  "de": "5585988888888@s.whatsapp.net",
  "type": "conversation",
  "texte": "Bonjour !",
  "timestamp": "15/10/2025 22:12:19"
}
```

---

## ✅ Checklist de déploiement

- [x] Service Evolution API avec méthodes d'envoi
- [x] Route API `/api/messages/send`
- [x] Validation et sécurité
- [x] Gestion d'erreurs
- [x] Logs pour monitoring
- [x] Support de tous les types de messages
- [x] Sauvegarde en DB
- [x] Documentation complète

**Status : ✅ Système d'envoi de messages complètement fonctionnel !**

---

## 🎉 Félicitations !

Votre système de messagerie WhatsApp bidirectionnel est maintenant **100% opérationnel** :

- ✅ Réception de messages (webhook)
- ✅ Affichage dans l'inbox
- ✅ Envoi de messages (API)
- ✅ Tous les types de médias supportés
- ✅ Logs et monitoring
- ✅ Sécurité et validation

**Déployez et testez ! 🚀**
