# 📱 Guide Complet : Recevoir et Envoyer des Messages WhatsApp

## ✅ Ce qui est déjà fait

- ✅ Route API WhatsApp (`/api/channels/whatsapp`)
- ✅ Route Webhook (`/api/webhooks/evolution`)
- ✅ Service Evolution API avec méthodes d'envoi
- ✅ Gestion des messages entrants (texte, images, vidéos, etc.)
- ✅ Création automatique des clients et conversations

## 🔧 Configuration requise

### 1️⃣ Variables d'environnement (.env.local)

```bash
# Evolution API
EVOLUTION_API_URL="http://xamxam-evolution-evolution-api.usjniw.easypanel.host"
EVOLUTION_API_KEY="429683C4C977415CAAFCCE10F7D57E11"

# Webhook URL (doit être accessible publiquement)
NEXT_PUBLIC_BASE_URL="https://www.xamxam.io"
# OU en local avec ngrok :
# NEXT_PUBLIC_BASE_URL="https://votre-url-ngrok.ngrok.io"

# Webhook global pour Evolution API
WEBHOOK_GLOBAL_URL="https://www.xamxam.io/api/webhooks/evolution"
```

### 2️⃣ Configuration Easypanel (Evolution API)

#### Option A : Via l'interface Manager

1. **Ouvrez le Manager Evolution API** :
   ```
   http://xamxam-evolution-evolution-api.usjniw.easypanel.host/manager
   ```

2. **Allez dans l'instance** `shop_0ca14154-a0f3-4fe7-89f0-0a1ba97546fc`

3. **Configurez le Webhook** :
   - URL : `https://www.xamxam.io/api/webhooks/evolution`
   - Events à activer :
     - ✅ `MESSAGES_UPSERT` (messages entrants)
     - ✅ `MESSAGES_UPDATE` (statut des messages)
     - ✅ `CONNECTION_UPDATE` (état de connexion)
     - ✅ `QRCODE_UPDATED` (nouveau QR code)

#### Option B : Via l'API (automatique)

Le webhook est déjà configuré automatiquement lors de la création de l'instance dans le code :

```typescript
const instanceConfig = {
  instanceName,
  integration: 'WHATSAPP-BAILEYS',
  qrcode: true,
  webhook: webhookUrl, // ✅ Configuré automatiquement
  webhook_by_events: true,
  events: [
    'MESSAGES_UPSERT',
    'MESSAGES_UPDATE',
    'CONNECTION_UPDATE',
    'QRCODE_UPDATED'
  ],
};
```

### 3️⃣ Exposer votre webhook en local (développement)

Si vous développez en local (`localhost:3000`), Evolution API ne peut pas envoyer les webhooks. Utilisez **ngrok** :

```bash
# Installer ngrok
npm install -g ngrok

# Exposer votre port 3000
ngrok http 3000
```

Vous obtiendrez une URL comme : `https://abc123.ngrok.io`

Mettez à jour `.env.local` :
```bash
NEXT_PUBLIC_BASE_URL="https://abc123.ngrok.io"
WEBHOOK_GLOBAL_URL="https://abc123.ngrok.io/api/webhooks/evolution"
```

**Redémarrez Next.js** après modification.

## 📥 Recevoir des messages

### Comment ça fonctionne ?

1. **Un client envoie un message** sur WhatsApp
2. **Evolution API reçoit le message**
3. **Evolution API envoie un webhook** à votre application :
   ```
   POST https://www.xamxam.io/api/webhooks/evolution
   ```
4. **Votre application traite le webhook** (`/api/webhooks/evolution/route.ts`) :
   - Trouve ou crée le client
   - Trouve ou crée la conversation
   - Enregistre le message dans la base de données

### Tester la réception

#### Test 1 : Vérifier que le webhook est accessible

```bash
curl -X POST https://www.xamxam.io/api/webhooks/evolution \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.upsert",
    "instance": "shop_0ca14154-a0f3-4fe7-89f0-0a1ba97546fc",
    "data": {
      "key": {
        "remoteJid": "5585988888888@s.whatsapp.net",
        "fromMe": false,
        "id": "test123"
      },
      "pushName": "Test User",
      "message": {
        "conversation": "Hello from test!"
      },
      "messageType": "conversation",
      "messageTimestamp": 1697000000
    }
  }'
```

Vous devriez voir dans les logs :
```
Evolution webhook received: { event: 'messages.upsert', instance: 'shop_...' }
New message received: { instance: 'shop_...', from: '5585988888888@s.whatsapp.net', ... }
Message saved to database: { conversationId: '...', messageType: 'TEXT', ... }
```

#### Test 2 : Envoyer un vrai message WhatsApp

1. **Scannez le QR code** pour connecter votre WhatsApp
2. **Envoyez un message** depuis un autre numéro vers le numéro connecté
3. **Vérifiez les logs** de Next.js
4. **Vérifiez la base de données** :

```sql
-- Voir les conversations
SELECT * FROM "Conversation" ORDER BY "lastMessageAt" DESC;

-- Voir les messages
SELECT * FROM "Message" ORDER BY "createdAt" DESC LIMIT 10;

-- Voir les clients
SELECT * FROM "Customer" ORDER BY "createdAt" DESC;
```

## 📤 Envoyer des messages

### Méthode 1 : Via l'API REST

#### Envoyer un message texte

```typescript
// Frontend
const sendMessage = async () => {
  const response = await fetch('/api/channels/whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shopId: 'votre-shop-id',
      action: 'send_message',
      instanceName: 'shop_votre-shop-id',
      message: {
        to: '5585988888888', // Numéro au format international (sans +)
        text: 'Bonjour ! Voici votre commande.',
      },
    }),
  });

  const data = await response.json();
  console.log('Message envoyé:', data);
};
```

#### Envoyer un message avec image

```typescript
const sendImageMessage = async () => {
  // Utiliser directement le service Evolution API
  const response = await fetch(
    `${process.env.EVOLUTION_API_URL}/message/sendMedia/shop_votre-shop-id`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: '5585988888888',
        mediatype: 'image',
        media: 'https://example.com/image.jpg', // URL de l'image
        caption: 'Voici votre produit !',
      }),
    }
  );

  const data = await response.json();
  console.log('Image envoyée:', data);
};
```

### Méthode 2 : Via le service (backend)

```typescript
// Dans une route API
import { evolutionApiService } from '@/services/whatsapp/evolutionApiService';

export async function POST(request: Request) {
  const { to, text } = await request.json();

  const result = await evolutionApiService.sendTextMessage(
    'shop_votre-shop-id',
    {
      number: to,
      text: text,
    }
  );

  return NextResponse.json({ success: true, messageId: result.key.id });
}
```

### Tester l'envoi

#### Test 1 : Via curl

```bash
curl -X POST http://localhost:3000/api/channels/whatsapp \
  -H "Content-Type: application/json" \
  -H "Cookie: votre-cookie-session" \
  -d '{
    "shopId": "0ca14154-a0f3-4fe7-89f0-0a1ba97546fc",
    "action": "send_message",
    "instanceName": "shop_0ca14154-a0f3-4fe7-89f0-0a1ba97546fc",
    "message": {
      "to": "5585988888888",
      "text": "Test message from API"
    }
  }'
```

#### Test 2 : Via l'interface

Créez un composant de test :

```typescript
// src/app/dashboard/test-whatsapp/page.tsx
'use client';

import { useState } from 'react';

export default function TestWhatsAppPage() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState('');

  const sendMessage = async () => {
    const response = await fetch('/api/channels/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopId: '0ca14154-a0f3-4fe7-89f0-0a1ba97546fc',
        action: 'send_message',
        instanceName: 'shop_0ca14154-a0f3-4fe7-89f0-0a1ba97546fc',
        message: { to: phone, text: message },
      }),
    });

    const data = await response.json();
    setResult(JSON.stringify(data, null, 2));
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test WhatsApp</h1>
      
      <div className="space-y-4 max-w-md">
        <input
          type="text"
          placeholder="Numéro (ex: 5585988888888)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 border rounded"
        />
        
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 border rounded"
          rows={4}
        />
        
        <button
          onClick={sendMessage}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Envoyer
        </button>
        
        {result && (
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}
```

## 🔍 Déboguer les problèmes

### Problème 1 : Les webhooks ne sont pas reçus

**Vérifications** :

1. **L'URL webhook est-elle accessible ?**
   ```bash
   curl https://www.xamxam.io/api/webhooks/evolution
   ```
   Devrait retourner `405 Method Not Allowed` (normal, il faut POST)

2. **Le webhook est-il configuré dans Evolution API ?**
   - Allez dans le Manager
   - Vérifiez la configuration de l'instance

3. **En local, utilisez-vous ngrok ?**
   ```bash
   ngrok http 3000
   ```

4. **Vérifiez les logs Evolution API** dans Easypanel

### Problème 2 : Les messages ne s'enregistrent pas en DB

**Vérifications** :

1. **Le canal existe-t-il ?**
   ```sql
   SELECT * FROM "Channel" WHERE type = 'WHATSAPP';
   ```

2. **Les logs montrent-ils des erreurs ?**
   ```
   Evolution webhook received: ...
   New message received: ...
   Message saved to database: ...
   ```

3. **Le schéma Prisma est-il à jour ?**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Problème 3 : Impossible d'envoyer des messages

**Vérifications** :

1. **L'instance est-elle connectée ?**
   ```bash
   curl http://xamxam-evolution-evolution-api.usjniw.easypanel.host/instance/connectionState/shop_xxx \
     -H "apikey: 429683C4C977415CAAFCCE10F7D57E11"
   ```
   Devrait retourner `state: 'open'`

2. **Le format du numéro est-il correct ?**
   - ✅ Bon : `5585988888888` (sans +, sans espaces)
   - ❌ Mauvais : `+55 85 98888-8888`

3. **L'API Key est-elle valide ?**
   ```bash
   echo $EVOLUTION_API_KEY
   ```

## 📊 Flux complet

### Réception d'un message

```
Client WhatsApp
    ↓ Envoie un message
Evolution API
    ↓ Webhook POST /api/webhooks/evolution
Votre Application
    ↓ handleMessageUpsert()
    ├─ Trouve/Crée le Customer
    ├─ Trouve/Crée la Conversation
    └─ Crée le Message en DB
```

### Envoi d'un message

```
Votre Application (Frontend)
    ↓ POST /api/channels/whatsapp
Votre Application (Backend)
    ↓ evolutionApiService.sendTextMessage()
Evolution API
    ↓ Envoie via WhatsApp
Client WhatsApp
    ↓ Reçoit le message
Evolution API
    ↓ Webhook messages.update (statut)
Votre Application
    └─ Met à jour le statut en DB
```

## ✅ Checklist finale

### Configuration
- [ ] Variables d'environnement configurées
- [ ] Webhook URL accessible publiquement (ou via ngrok)
- [ ] Instance WhatsApp créée et connectée
- [ ] Webhook configuré dans Evolution API

### Tests
- [ ] Recevoir un message texte
- [ ] Recevoir une image
- [ ] Envoyer un message texte
- [ ] Envoyer une image
- [ ] Vérifier que les messages sont en DB
- [ ] Vérifier que les clients sont créés
- [ ] Vérifier que les conversations sont créées

### Production
- [ ] Déployer sur Vercel
- [ ] Configurer les variables d'environnement sur Vercel
- [ ] Tester les webhooks en production
- [ ] Monitorer les logs

## 🚀 Prochaines étapes

1. **Créer une interface de chat** pour voir les conversations
2. **Ajouter la gestion des médias** (images, vidéos, documents)
3. **Implémenter les réponses automatiques**
4. **Ajouter des templates de messages**
5. **Créer un système de notifications** pour les nouveaux messages

---

**Vous êtes prêt à recevoir et envoyer des messages WhatsApp ! 🎉**
