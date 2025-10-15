# 🔧 Fix : Configuration Webhook Evolution API

## 🔴 Problème

L'instance ne se créait pas avec l'erreur :
```
Error connecting to instance: Error: Instance not found - Please create the instance first
```

## 🎯 Cause

La structure du webhook était **incorrecte**. Evolution API attend un **objet webhook**, pas des propriétés séparées.

### ❌ AVANT (incorrect)

```typescript
const instanceConfig = {
  instanceName,
  integration: 'WHATSAPP-BAILEYS',
  qrcode: true,
  webhook: webhookUrl, // ❌ String au lieu d'objet
  webhook_by_events: true, // ❌ Propriété séparée
  events: [...], // ❌ Propriété séparée
};
```

### ✅ APRÈS (correct selon la doc Evolution API)

```typescript
const instanceConfig = {
  instanceName,
  integration: 'WHATSAPP-BAILEYS',
  qrcode: true,
  webhook: {
    url: webhookUrl, // ✅ Objet avec url
    byEvents: true, // ✅ Propriété dans l'objet
    base64: false,
    events: [
      'MESSAGES_UPSERT',
      'MESSAGES_UPDATE',
      'CONNECTION_UPDATE',
      'QRCODE_UPDATED'
    ],
  },
};
```

## 📚 Documentation Evolution API

Selon https://doc.evolution-api.com/v2/api-reference/instance-controller/create-instance-basic :

```json
{
  "instanceName": "test",
  "integration": "WHATSAPP-BAILEYS",
  "qrcode": true,
  "webhook": {
    "url": "https://example.com/webhook",
    "byEvents": true,
    "base64": false,
    "headers": {
      "authorization": "Bearer token"
    },
    "events": [
      "MESSAGES_UPSERT",
      "CONNECTION_UPDATE"
    ]
  }
}
```

## ✅ Corrections appliquées

### 1. Type `WebhookConfig` ajouté

**Fichier** : `src/types/evolution-api.ts`

```typescript
export interface WebhookConfig {
  url: string;
  byEvents?: boolean;
  base64?: boolean;
  headers?: Record<string, string>;
  events?: EvolutionWebhookEvent[];
}

export interface CreateInstanceRequest {
  instanceName: string;
  integration: 'WHATSAPP-BAILEYS' | 'WHATSAPP-BUSINESS';
  qrcode?: boolean;
  webhook?: WebhookConfig; // ✅ Objet au lieu de string
  // ...
}
```

### 2. Route API mise à jour

**Fichier** : `src/app/api/channels/whatsapp/route.ts`

```typescript
const instanceConfig: CreateInstanceRequest = {
  instanceName,
  integration: 'WHATSAPP-BAILEYS',
  qrcode: true,
  webhook: {
    url: webhookUrl,
    byEvents: true,
    base64: false,
    events: [
      'MESSAGES_UPSERT',
      'MESSAGES_UPDATE',
      'CONNECTION_UPDATE',
      'QRCODE_UPDATED'
    ],
  },
};
```

### 3. Service Evolution API nettoyé

**Fichier** : `src/services/whatsapp/evolutionApiService.ts`

Suppression des propriétés `webhook_by_events` et `events` séparées, car elles sont maintenant dans l'objet `webhook`.

## 🧪 Comment tester

### 1. Supprimer l'instance existante (si elle existe)

```bash
curl -X DELETE http://xamxam-evolution-evolution-api.usjniw.easypanel.host/instance/delete/shop_xxx \
  -H "apikey: 429683C4C977415CAAFCCE10F7D57E11"
```

### 2. Créer une nouvelle instance

1. Allez sur : `http://localhost:3000/dashboard/channels/connect/whatsapp`
2. Cliquez sur **"Démarrer la connexion"**
3. **Vérifiez les logs** :

```
📤 Creating instance with config: {
  instanceName: 'shop_xxx',
  integration: 'WHATSAPP-BAILEYS',
  qrcode: true,
  webhook: {
    url: 'https://www.xamxam.io/api/webhooks/evolution',
    byEvents: true,
    base64: false,
    events: ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'CONNECTION_UPDATE', 'QRCODE_UPDATED']
  }
}
✅ Evolution instance created successfully: { ... }
```

### 3. Vérifier que l'instance est créée

```bash
curl http://xamxam-evolution-evolution-api.usjniw.easypanel.host/instance/fetchInstances \
  -H "apikey: 429683C4C977415CAAFCCE10F7D57E11"
```

Cherchez votre instance et vérifiez que le webhook est configuré :

```json
{
  "instanceName": "shop_xxx",
  "webhook": {
    "url": "https://www.xamxam.io/api/webhooks/evolution",
    "enabled": true,
    "events": ["MESSAGES_UPSERT", "MESSAGES_UPDATE", "CONNECTION_UPDATE", "QRCODE_UPDATED"]
  }
}
```

### 4. Scanner le QR code

1. Le QR code devrait s'afficher
2. Scannez avec WhatsApp
3. **Vérifiez les logs** pour le webhook :

```
Evolution webhook received: { event: 'connection.update', instance: 'shop_xxx' }
Connection update: { instance: 'shop_xxx', state: 'open' }
```

### 5. Vérifier que le canal est actif

```sql
SELECT * FROM "Channel" WHERE type = 'WHATSAPP';
```

Devrait afficher :
```
isActive: true ✅
```

## 🐛 Dépannage

### L'instance ne se crée toujours pas

**Vérifiez les variables d'environnement** :

```bash
# .env.local
EVOLUTION_API_URL="http://xamxam-evolution-evolution-api.usjniw.easypanel.host"
EVOLUTION_API_KEY="429683C4C977415CAAFCCE10F7D57E11"
NEXT_PUBLIC_BASE_URL="https://www.xamxam.io"
WEBHOOK_GLOBAL_URL="https://www.xamxam.io/api/webhooks/evolution"
```

**Testez l'API directement** :

```bash
curl -X POST http://xamxam-evolution-evolution-api.usjniw.easypanel.host/instance/create \
  -H "Content-Type: application/json" \
  -H "apikey: 429683C4C977415CAAFCCE10F7D57E11" \
  -d '{
    "instanceName": "test_manual",
    "integration": "WHATSAPP-BAILEYS",
    "qrcode": true,
    "webhook": {
      "url": "https://www.xamxam.io/api/webhooks/evolution",
      "byEvents": true,
      "base64": false,
      "events": ["MESSAGES_UPSERT", "CONNECTION_UPDATE"]
    }
  }'
```

Si ça fonctionne, le problème vient de votre code. Si ça ne fonctionne pas, le problème vient de l'API Evolution.

### Le webhook ne fonctionne pas en local

**Utilisez ngrok** :

```bash
ngrok http 3000
# Copier l'URL (ex: https://abc123.ngrok.io)
```

Mettez à jour `.env.local` :
```bash
NEXT_PUBLIC_BASE_URL="https://abc123.ngrok.io"
WEBHOOK_GLOBAL_URL="https://abc123.ngrok.io/api/webhooks/evolution"
```

**Redémarrez Next.js** et recréez l'instance.

## 📝 Fichiers modifiés

1. **`src/types/evolution-api.ts`**
   - Ajout de `WebhookConfig` interface
   - Modification de `CreateInstanceRequest.webhook` : `string` → `WebhookConfig`

2. **`src/app/api/channels/whatsapp/route.ts`**
   - Configuration webhook avec objet au lieu de propriétés séparées

3. **`src/services/whatsapp/evolutionApiService.ts`**
   - Suppression de `webhook_by_events` et `events` séparés

## ✅ Checklist

- [x] Type `WebhookConfig` créé
- [x] `CreateInstanceRequest.webhook` mis à jour
- [x] Route API corrigée
- [x] Service Evolution API nettoyé
- [ ] Tester : Créer une instance
- [ ] Vérifier : Instance créée avec webhook
- [ ] Tester : Scanner le QR code
- [ ] Vérifier : Webhook reçu
- [ ] Vérifier : Canal à `isActive: true`

## 🎯 Résultat attendu

Maintenant, l'instance devrait se créer **avec le webhook configuré** et :

1. ✅ Instance créée avec succès
2. ✅ QR code affiché
3. ✅ Scan du QR code
4. ✅ Webhook `connection.update` reçu
5. ✅ Canal passe à `isActive: true`

**Exactement comme prévu ! 🎉**

---

**Statut** : ✅ Fix appliqué
**Prochaine étape** : Supprimer l'instance existante et retester
