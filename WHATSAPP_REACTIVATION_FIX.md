# 🔧 Fix : Canal WhatsApp ne s'active pas après scan QR

## 🔴 Problème

Après avoir scanné le QR code WhatsApp, le canal reste à `isActive: false` au lieu de passer à `isActive: true`.

## 🎯 Cause

L'instance WhatsApp a probablement été créée **AVANT** la configuration du webhook `CONNECTION_UPDATE`. Sans ce webhook, Evolution API ne peut pas notifier votre application que la connexion est établie.

## ✅ Solution 1 : Supprimer et recréer l'instance (RECOMMANDÉ)

### Étape 1 : Supprimer l'instance existante

#### Via le Manager Evolution API

1. Allez sur : `http://xamxam-evolution-evolution-api.usjniw.easypanel.host/manager`
2. Trouvez l'instance `shop_0ca14154-a0f3-4fe7-89f0-0a1ba97546fc`
3. Cliquez sur **Supprimer**

#### Ou via API

```bash
curl -X DELETE http://xamxam-evolution-evolution-api.usjniw.easypanel.host/instance/delete/shop_0ca14154-a0f3-4fe7-89f0-0a1ba97546fc \
  -H "apikey: 429683C4C977415CAAFCCE10F7D57E11"
```

### Étape 2 : Recréer l'instance

1. Allez sur : `http://localhost:3000/dashboard/channels/connect/whatsapp`
2. Cliquez sur **"Démarrer la connexion"**
3. Scannez le nouveau QR code

### Étape 3 : Vérifier dans les logs

Après avoir scanné le QR code, vous devriez voir dans les logs Next.js :

```
Evolution webhook received: { event: 'connection.update', instance: 'shop_...' }
🔄 Connection update received: { instance: 'shop_...', state: 'open', ... }
✅ WhatsApp connected! Activating channel...
🔍 Channel found: ID: xxx, isActive: false
✅ Channel activated successfully! isActive = true
```

## ✅ Solution 2 : Activer manuellement (TEMPORAIRE)

Si vous ne voulez pas recréer l'instance, vous pouvez activer le canal manuellement dans la base de données :

### Via Prisma Studio

```bash
npx prisma studio
```

1. Ouvrez la table `Channel`
2. Trouvez le canal WhatsApp avec `externalId = 'shop_0ca14154-a0f3-4fe7-89f0-0a1ba97546fc'`
3. Changez `isActive` de `false` à `true`
4. Sauvegardez

### Ou via SQL

```sql
UPDATE "Channel"
SET "isActive" = true
WHERE "type" = 'WHATSAPP'
  AND "externalId" = 'shop_0ca14154-a0f3-4fe7-89f0-0a1ba97546fc';
```

⚠️ **Attention** : Cette solution est temporaire. Si WhatsApp se déconnecte, vous devrez réactiver manuellement le canal.

## 🧪 Vérification

### 1. Vérifier que le webhook est configuré

```bash
curl http://xamxam-evolution-evolution-api.usjniw.easypanel.host/instance/fetchInstances \
  -H "apikey: 429683C4C977415CAAFCCE10F7D57E11" | jq '.[] | select(.instance.instanceName == "shop_0ca14154-a0f3-4fe7-89f0-0a1ba97546fc") | .webhook'
```

Vous devriez voir :
```json
{
  "url": "https://www.xamxam.io/api/webhooks/evolution",
  "byEvents": true,
  "events": ["MESSAGES_UPSERT", "MESSAGES_UPDATE", "CONNECTION_UPDATE", "QRCODE_UPDATED"]
}
```

Si le webhook n'est pas configuré, l'instance a été créée avec l'ancien code.

### 2. Vérifier que le canal est activé

```sql
SELECT * FROM "Channel" WHERE "type" = 'WHATSAPP';
```

Devrait retourner :
```
isActive: true  ✅
```

### 3. Tester l'envoi d'un message

Allez sur `http://localhost:3000/dashboard/test-whatsapp` et envoyez un message de test.

## 📊 Comparaison avec Instagram/Facebook

**Instagram/Facebook** : Le canal est activé **immédiatement** après connexion OAuth :
```typescript
update: { accessToken: encryptedToken, isActive: true },
create: { ..., isActive: true }
```

**WhatsApp** : Le canal attend le webhook `connection.update` de Evolution API :
```typescript
// Création
create: { ..., isActive: false }  // ❌ False au début

// Activation via webhook
if (data.state === 'open') {
  update: { isActive: true }  // ✅ True après connexion
}
```

## 🚀 Résultat attendu

Après avoir appliqué la solution :

1. ✅ L'instance a le webhook configuré
2. ✅ Après le scan du QR code, le webhook `connection.update` est reçu
3. ✅ Le canal passe automatiquement à `isActive: true`
4. ✅ Le frontend affiche "Connecté avec succès !"
5. ✅ Vous pouvez envoyer et recevoir des messages

---

**Statut** : ✅ Logs ajoutés pour diagnostiquer
**Action recommandée** : Supprimer et recréer l'instance
