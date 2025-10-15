# 🚀 Quick Start : WhatsApp Messages

## ✅ Ce qui est fait

- ✅ Route API pour envoyer des messages
- ✅ Webhook pour recevoir des messages
- ✅ Page de test interactive
- ✅ Gestion automatique des clients et conversations

## 🔧 Configuration rapide

### 1. Variables d'environnement

Vérifiez que `.env.local` contient :

```bash
EVOLUTION_API_URL="http://xamxam-evolution-evolution-api.usjniw.easypanel.host"
EVOLUTION_API_KEY="429683C4C977415CAAFCCE10F7D57E11"
NEXT_PUBLIC_BASE_URL="https://www.xamxam.io"
WEBHOOK_GLOBAL_URL="https://www.xamxam.io/api/webhooks/evolution"
```

### 2. En local : Exposer avec ngrok

```bash
# Installer ngrok
npm install -g ngrok

# Exposer le port 3000
ngrok http 3000

# Copier l'URL (ex: https://abc123.ngrok.io)
# Mettre à jour .env.local :
NEXT_PUBLIC_BASE_URL="https://abc123.ngrok.io"
WEBHOOK_GLOBAL_URL="https://abc123.ngrok.io/api/webhooks/evolution"

# Redémarrer Next.js
npm run dev
```

### 3. Connecter WhatsApp

1. Allez sur : `http://localhost:3000/dashboard/channels/connect/whatsapp`
2. Cliquez sur "Démarrer la connexion"
3. Scannez le QR code avec WhatsApp
4. Attendez la confirmation

## 🧪 Tester

### Page de test

Allez sur : `http://localhost:3000/dashboard/test-whatsapp`

Vous pouvez :
- ✅ Envoyer un message à n'importe quel numéro
- ✅ Simuler la réception d'un message
- ✅ Voir les résultats en temps réel

### Test manuel : Envoyer un message

```bash
curl -X POST http://localhost:3000/api/channels/whatsapp \
  -H "Content-Type: application/json" \
  -H "Cookie: votre-cookie-session" \
  -d '{
    "shopId": "votre-shop-id",
    "action": "send_message",
    "instanceName": "shop_votre-shop-id",
    "message": {
      "to": "5585988888888",
      "text": "Hello from API!"
    }
  }'
```

### Test manuel : Recevoir un message

**Option 1 : Simuler un webhook**

```bash
curl -X POST http://localhost:3000/api/webhooks/evolution \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.upsert",
    "instance": "shop_votre-shop-id",
    "data": {
      "key": {
        "remoteJid": "5585988888888@s.whatsapp.net",
        "fromMe": false,
        "id": "test123"
      },
      "pushName": "Test User",
      "message": {
        "conversation": "Hello!"
      },
      "messageType": "conversation",
      "messageTimestamp": 1697000000
    }
  }'
```

**Option 2 : Envoyer un vrai message**

1. Depuis un autre numéro WhatsApp
2. Envoyez un message au numéro connecté
3. Vérifiez les logs Next.js
4. Vérifiez la base de données

## 📊 Vérifier la base de données

```sql
-- Voir les derniers messages
SELECT * FROM "Message" ORDER BY "createdAt" DESC LIMIT 10;

-- Voir les conversations
SELECT * FROM "Conversation" ORDER BY "lastMessageAt" DESC;

-- Voir les clients
SELECT * FROM "Customer" ORDER BY "createdAt" DESC;
```

## 🐛 Problèmes courants

### Les webhooks ne sont pas reçus

**En local** : Utilisez ngrok et mettez à jour `NEXT_PUBLIC_BASE_URL`

**En production** : Vérifiez que l'URL webhook est accessible :
```bash
curl https://www.xamxam.io/api/webhooks/evolution
```

### Impossible d'envoyer des messages

**Vérifiez que l'instance est connectée** :
```bash
curl http://xamxam-evolution-evolution-api.usjniw.easypanel.host/instance/connectionState/shop_xxx \
  -H "apikey: 429683C4C977415CAAFCCE10F7D57E11"
```

Devrait retourner `"state": "open"`

### Format du numéro incorrect

✅ **Bon** : `5585988888888` (sans +, sans espaces, sans tirets)
❌ **Mauvais** : `+55 85 98888-8888`

## 📚 Documentation complète

Voir `WHATSAPP_MESSAGES_GUIDE.md` pour :
- Configuration détaillée Easypanel
- Gestion des médias (images, vidéos)
- Webhooks avancés
- Déploiement en production

## ✅ Checklist

- [ ] Variables d'environnement configurées
- [ ] ngrok lancé (en local)
- [ ] WhatsApp connecté (QR code scanné)
- [ ] Test d'envoi réussi
- [ ] Test de réception réussi
- [ ] Messages visibles en base de données

---

**Tout est prêt ! Commencez à tester sur `/dashboard/test-whatsapp` 🎉**
