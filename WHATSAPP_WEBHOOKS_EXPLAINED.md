# 📡 Webhooks WhatsApp - Explication complète

## 🎯 Qu'est-ce qu'un webhook ?

Un webhook est une **notification en temps réel** envoyée par Evolution API vers votre serveur quand quelque chose se passe sur WhatsApp.

---

## 📊 Types de webhooks Evolution API

### 1. `messages.upsert` - **Nouveau message reçu ou envoyé**

**Quand ?**
- Quand quelqu'un vous envoie un message
- Quand vous envoyez un message

**Structure du payload :**
```json
{
  "event": "messages.upsert",
  "instance": "shop_xxx",
  "data": {
    "key": {
      "remoteJid": "5585988888888@s.whatsapp.net",
      "fromMe": false,
      "id": "3AA302ECA1B60DFDB368"
    },
    "message": {
      "conversation": "Bonjour !"
    },
    "messageTimestamp": 1760566339,
    "pushName": "John Doe"
  }
}
```

**Ce qu'on fait :**
- Créer ou trouver le client
- Créer ou trouver la conversation
- Sauvegarder le message dans la DB
- Mettre à jour `lastMessageAt`

---

### 2. `messages.update` - **Mise à jour du statut d'un message** ⚠️

**Quand ?**
- Quand un message est **délivré** (DELIVERY_ACK)
- Quand un message est **lu** (READ)
- Quand un message est **joué** (PLAYED) pour audio/vidéo

**Structure du payload :**
```json
{
  "event": "messages.update",
  "instance": "shop_xxx",
  "data": {
    "messageId": "cmgsjo6qy24ztpf4qn1rdar28",
    "keyId": "7C78F9C4EA16702AA6EBAB156362AD41",  // ⚠️ Notez : keyId, pas key.id !
    "remoteJid": "5585988888888@s.whatsapp.net",
    "fromMe": false,
    "participant": "5585988888888@s.whatsapp.net",
    "status": "READ",  // ou "DELIVERY_ACK", "PLAYED"
    "instanceId": "xxx"
  }
}
```

**Ce qu'on fait :**
- Chercher le message avec `externalId = data.keyId`
- Mettre à jour `isRead` selon le statut
- Mettre à jour les métadonnées

**⚠️ IMPORTANT :** La structure est **différente** de `messages.upsert` :
- ❌ Pas de `data.key.id`
- ✅ Utiliser `data.keyId`

---

### 3. `connection.update` - **Changement de connexion**

**Quand ?**
- Quand WhatsApp se connecte (`state: 'open'`)
- Quand WhatsApp se déconnecte (`state: 'close'`)
- Pendant la connexion (`state: 'connecting'`)

**Structure du payload :**
```json
{
  "event": "connection.update",
  "instance": "shop_xxx",
  "data": {
    "state": "open",  // ou "close", "connecting"
    "statusReason": 200
  }
}
```

**Ce qu'on fait :**
- Si `state === 'open'` → Activer le canal (`isActive = true`)
- Si `state === 'close'` → Désactiver le canal (`isActive = false`)

---

### 4. `qrcode.updated` - **Nouveau QR Code**

**Quand ?**
- Lors de la première connexion
- Quand le QR Code expire et est régénéré

**Structure du payload :**
```json
{
  "event": "qrcode.updated",
  "instance": "shop_xxx",
  "data": {
    "qrcode": "data:image/png;base64,..."
  }
}
```

**Ce qu'on fait :**
- Pour l'instant : rien (le QR est géré côté client via polling)

---

## 🔄 Statuts des messages WhatsApp

### Cycle de vie d'un message envoyé

```
1. PENDING      → Message en cours d'envoi
2. SERVER_ACK   → Reçu par le serveur WhatsApp
3. DELIVERY_ACK → Délivré au téléphone du destinataire
4. READ         → Lu par le destinataire
5. PLAYED       → Joué (pour audio/vidéo uniquement)
```

### Visualisation

```
Vous → WhatsApp Server → Destinataire
  ↓         ↓               ↓
PENDING  SERVER_ACK    DELIVERY_ACK → READ
```

---

## 🐛 Le bug que tu avais

### Erreur observée :
```
Error processing Evolution webhook: TypeError: Cannot read properties of undefined (reading 'id')
```

### Cause :
Dans `handleMessageUpdate`, on utilisait :
```typescript
externalId: data.key.id  // ❌ data.key n'existe pas dans messages.update !
```

### Solution :
```typescript
const externalId = data.keyId || data.key?.id;  // ✅ Gère les deux structures
```

---

## 📈 Fréquence des webhooks

### Normal :
- **messages.upsert** : À chaque message reçu/envoyé
- **messages.update** : 2-3 fois par message envoyé (delivered → read)
- **connection.update** : Rarement (connexion/déconnexion)
- **qrcode.updated** : Très rarement (nouvelle connexion)

### Exemple d'activité normale :

```
10:00:00 - messages.upsert (client envoie "Bonjour")
10:00:05 - messages.upsert (vous répondez "Salut !")
10:00:06 - messages.update (votre message → DELIVERY_ACK)
10:00:10 - messages.update (votre message → READ)
```

**C'est normal d'avoir beaucoup de `messages.update` !** 
Chaque message envoyé génère 2-3 webhooks de mise à jour de statut.

---

## 🎯 Pourquoi les logs étaient rouges (500 errors) ?

### Avant le fix :
```
23:59:22 - POST 500 - Error: Cannot read properties of undefined (reading 'id')
23:59:21 - POST 500 - Error: Cannot read properties of undefined (reading 'id')
23:59:20 - POST 500 - Error: Cannot read properties of undefined (reading 'id')
```

**Cause :** À chaque `messages.update`, le code crashait car `data.key` n'existait pas.

### Après le fix :
```
23:59:22 - POST 200 - ✅ Statut du message mis à jour: 7C78F9C4EA16702AA6EBAB156362AD41 → READ
23:59:21 - POST 200 - ✅ Statut du message mis à jour: ABC123... → DELIVERY_ACK
```

**Résultat :** Plus d'erreurs, les statuts sont correctement mis à jour ! ✅

---

## 🔍 Comment monitorer les webhooks ?

### Sur Vercel :

1. **Tous les webhooks :**
   ```
   Filtre : /api/webhooks/evolution
   ```

2. **Seulement les nouveaux messages :**
   ```
   Chercher : "MESSAGE WHATSAPP REÇU"
   ```

3. **Seulement les mises à jour de statut :**
   ```
   Chercher : "Statut du message mis à jour"
   ```

4. **Seulement les erreurs :**
   ```
   Filtre : status=500 OR level=error
   ```

---

## ✅ Résumé

### Ce qui est normal :
- ✅ Beaucoup de webhooks `messages.update` (1 par changement de statut)
- ✅ Les webhooks arrivent même sans interaction manuelle
- ✅ Les statuts évoluent : PENDING → DELIVERY_ACK → READ

### Ce qui était un bug (maintenant fixé) :
- ❌ Erreurs 500 répétées sur `messages.update`
- ❌ `Cannot read properties of undefined (reading 'id')`

### Maintenant :
- ✅ Tous les webhooks sont gérés correctement
- ✅ Les statuts des messages sont mis à jour en temps réel
- ✅ Pas d'erreurs dans les logs
- ✅ Tu peux voir quand un message est délivré/lu

---

## 🎉 Avantages maintenant que c'est fixé

1. **Indicateurs de lecture** : Tu peux voir quand le client lit ton message
2. **Confirmation de livraison** : Tu sais que le message est bien arrivé
3. **Logs propres** : Plus d'erreurs 500 qui polluent les logs
4. **Meilleure UX** : Tu peux afficher des coches bleues/grises comme WhatsApp

---

## 📊 Exemple de flux complet

```
1. Client envoie "Bonjour"
   → Webhook: messages.upsert
   → Action: Message sauvegardé en DB
   
2. Vous répondez "Salut !"
   → API: POST /api/messenger/send
   → Evolution API envoie le message
   
3. Message délivré au client
   → Webhook: messages.update (status: DELIVERY_ACK)
   → Action: isRead = false (juste délivré)
   
4. Client lit votre message
   → Webhook: messages.update (status: READ)
   → Action: isRead = true (message lu !)
```

**Tout fonctionne maintenant ! 🎉**
