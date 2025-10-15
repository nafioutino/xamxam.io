# 🔧 Fix : Canal WhatsApp ne passe pas à isActive: true

## 🔴 Problème identifié

Après avoir scanné le QR code WhatsApp, le canal restait à `isActive: false` au lieu de passer à `isActive: true`.

## 🎯 Cause racine

**Le webhook n'était PAS configuré** lors de la création de l'instance Evolution API.

### Code AVANT (incorrect) :

```typescript
const instanceConfig = {
  instanceName,
  integration: 'WHATSAPP-BAILEYS' as const,
  qrcode: true,
  // ❌ MANQUE : webhook, webhook_by_events, events
};
```

**Résultat** : Evolution API ne savait pas où envoyer les événements de connexion.

## ✅ Solution appliquée

### Code APRÈS (correct) :

```typescript
const instanceConfig = {
  instanceName,
  integration: 'WHATSAPP-BAILEYS' as const,
  qrcode: true,
  webhook: webhookUrl, // ✅ URL du webhook
  webhook_by_events: true, // ✅ Activer les webhooks par événement
  events: [
    'MESSAGES_UPSERT',      // Messages entrants
    'MESSAGES_UPDATE',      // Statut des messages
    'CONNECTION_UPDATE',    // ✅ IMPORTANT : État de connexion
    'QRCODE_UPDATED'        // Nouveau QR code
  ] as const,
};
```

## 📊 Flux complet (maintenant fonctionnel)

### 1. Création de l'instance

```
Frontend → POST /api/channels/whatsapp (action: create_instance)
    ↓
Backend crée l'instance avec webhook configuré
    ↓
Evolution API instance créée
    ↓
Canal créé en DB avec isActive: false
```

### 2. Scan du QR code

```
Frontend → POST /api/channels/whatsapp (action: get_qrcode)
    ↓
Backend récupère le QR code
    ↓
Frontend affiche le QR code
    ↓
Utilisateur scanne avec WhatsApp
```

### 3. Activation automatique (NOUVEAU ✅)

```
WhatsApp connecté
    ↓
Evolution API détecte la connexion
    ↓
Evolution API envoie webhook : POST /api/webhooks/evolution
    {
      "event": "connection.update",
      "instance": "shop_xxx",
      "data": { "state": "open" }
    }
    ↓
Backend reçoit le webhook
    ↓
handleConnectionUpdate() exécuté
    ↓
Canal mis à jour : isActive = true ✅
```

### 4. Frontend détecte la connexion

```
Frontend poll toutes les 3s : POST /api/channels/whatsapp (action: check_status)
    ↓
Backend retourne : { status: "open", profileName: "..." }
    ↓
Frontend affiche : "Connecté avec succès !"
    ↓
Redirection vers /dashboard/channels
```

## 🧪 Comment tester

### 1. Supprimer l'instance existante (si elle existe)

Dans le Manager Evolution API ou via API :

```bash
curl -X DELETE http://xamxam-evolution-evolution-api.usjniw.easypanel.host/instance/delete/shop_xxx \
  -H "apikey: 429683C4C977415CAAFCCE10F7D57E11"
```

### 2. Créer une nouvelle instance

1. Allez sur : `http://localhost:3000/dashboard/channels/connect/whatsapp`
2. Cliquez sur **"Démarrer la connexion"**
3. Vérifiez les logs :

```
📤 Creating instance with config: {
  instanceName: 'shop_xxx',
  integration: 'WHATSAPP-BAILEYS',
  qrcode: true,
  webhook: 'https://www.xamxam.io/api/webhooks/evolution', ✅
  webhook_by_events: true, ✅
  events: ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'CONNECTION_UPDATE', 'QRCODE_UPDATED'] ✅
}
```

### 3. Scanner le QR code

1. Scannez le QR code avec WhatsApp
2. Attendez quelques secondes
3. **Vérifiez les logs** :

```
Evolution webhook received: { event: 'connection.update', instance: 'shop_xxx' }
Connection update: { instance: 'shop_xxx', state: 'open' }
```

### 4. Vérifier la base de données

```sql
SELECT * FROM "Channel" WHERE type = 'WHATSAPP';
```

Vous devriez voir :
```
id | shopId | type     | externalId | isActive | ...
---|--------|----------|------------|----------|----
1  | xxx    | WHATSAPP | shop_xxx   | true     | ... ✅
```

### 5. Vérifier dans l'interface

Le frontend devrait afficher :
```
✅ Connecté avec succès ! (Votre Nom WhatsApp)
```

Puis rediriger vers `/dashboard/channels`.

## 🐛 Dépannage

### Le canal ne passe toujours pas à isActive: true

**Vérification 1 : Le webhook est-il configuré ?**

Vérifiez dans le Manager Evolution API ou via API :

```bash
curl http://xamxam-evolution-evolution-api.usjniw.easypanel.host/instance/fetchInstances \
  -H "apikey: 429683C4C977415CAAFCCE10F7D57E11"
```

Cherchez votre instance et vérifiez :
```json
{
  "webhook": {
    "url": "https://www.xamxam.io/api/webhooks/evolution",
    "webhook_by_events": true,
    "events": ["MESSAGES_UPSERT", "MESSAGES_UPDATE", "CONNECTION_UPDATE", "QRCODE_UPDATED"]
  }
}
```

**Vérification 2 : Le webhook est-il accessible ?**

```bash
curl -X POST https://www.xamxam.io/api/webhooks/evolution \
  -H "Content-Type: application/json" \
  -d '{
    "event": "connection.update",
    "instance": "shop_xxx",
    "data": { "state": "open" }
  }'
```

Devrait retourner `200 OK`.

**Vérification 3 : En local, utilisez-vous ngrok ?**

Si vous développez en local, Evolution API ne peut pas envoyer les webhooks à `localhost`.

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

**Vérification 4 : Les logs montrent-ils le webhook ?**

Dans les logs Next.js, vous devriez voir :

```
Evolution webhook received: { event: 'connection.update', instance: 'shop_xxx' }
Connection update: { instance: 'shop_xxx', state: 'open' }
```

Si vous ne voyez pas ces logs, le webhook n'est pas reçu.

### Le webhook est reçu mais le canal ne s'active pas

**Vérifiez que le canal existe** :

```sql
SELECT * FROM "Channel" WHERE "externalId" = 'shop_xxx';
```

Si le canal n'existe pas, le webhook ne peut pas le mettre à jour.

**Vérifiez les logs d'erreur** :

```
Error in handleConnectionUpdate: ...
```

## 📝 Fichiers modifiés

1. **`src/app/api/channels/whatsapp/route.ts`** (ligne 89-102)
   - Ajout de la configuration webhook lors de la création d'instance

## ✅ Checklist de vérification

- [x] Webhook configuré dans `instanceConfig`
- [x] Events `CONNECTION_UPDATE` inclus
- [x] Route webhook `/api/webhooks/evolution` existe
- [x] Fonction `handleConnectionUpdate()` met à jour `isActive`
- [ ] Tester : Créer une nouvelle instance
- [ ] Tester : Scanner le QR code
- [ ] Vérifier : Webhook reçu dans les logs
- [ ] Vérifier : Canal à `isActive: true` en DB
- [ ] Vérifier : Interface affiche "Connecté avec succès"

## 🎯 Résultat attendu

Maintenant, **dès que vous scannez le QR code** :

1. ✅ Evolution API envoie un webhook `connection.update`
2. ✅ Votre application reçoit le webhook
3. ✅ Le canal passe à `isActive: true` automatiquement
4. ✅ Le frontend détecte la connexion et affiche le succès
5. ✅ Redirection vers `/dashboard/channels`

**Exactement comme les autres canaux (Instagram, Facebook, etc.) !** 🎉

---

**Statut** : ✅ Fix appliqué
**Prochaine étape** : Supprimer l'instance existante et retester
