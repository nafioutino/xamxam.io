# 🔧 Debug WhatsApp Evolution API

## Problème: Timeout lors de la création d'instance

### Erreur rencontrée:
```
{"success":false,"error":"timeout of 30000ms exceeded"}
POST /api/channels/whatsapp 500 (Internal Server Error)
```

---

## ✅ Étapes de diagnostic

### 1. Vérifier la configuration des variables d'environnement

Ouvrez votre terminal et exécutez :

```bash
# Afficher les variables (sans les valeurs sensibles)
node -e "console.log('EVOLUTION_API_URL:', process.env.EVOLUTION_API_URL ? 'SET' : 'NOT SET')"
node -e "console.log('EVOLUTION_API_KEY:', process.env.EVOLUTION_API_KEY ? 'SET' : 'NOT SET')"
```

**Dans votre fichier `.env` (PAS `.env.example`), vérifiez que vous avez :**

```bash
EVOLUTION_API_URL="https://evolution-api-latest-k396.onrender.com"
EVOLUTION_API_KEY="bd7711f6500e08ef7b0a6c6b077493ca"
WEBHOOK_GLOBAL_URL="https://www.xamxam.io/api/webhooks/evolution"
NEXT_PUBLIC_BASE_URL="https://www.xamxam.io"
```

⚠️ **IMPORTANT** : Assurez-vous que ces variables sont dans `.env` ou `.env.local`, PAS SEULEMENT dans `.env.example`

### 2. Tester la connexion à Evolution API

Accédez à cette URL dans votre navigateur ou avec curl :

```
https://www.xamxam.io/api/channels/whatsapp/test
```

OU avec curl :

```bash
curl https://www.xamxam.io/api/channels/whatsapp/test
```

**Réponse attendue** :
```json
{
  "status": "success",
  "message": "Evolution API is reachable",
  "config": {
    "evolutionApiUrl": "https://evolution-api-latest-k396.onrender.com",
    "evolutionApiUrlSet": true,
    "evolutionApiKeySet": true,
    ...
  },
  "testConnection": {
    "success": true,
    "status": 200
  }
}
```

### 3. Vérifier que Evolution API est accessible

Testez directement Evolution API :

```bash
curl -X GET https://evolution-api-latest-k396.onrender.com/ \
  -H "apikey: bd7711f6500e08ef7b0a6c6b077493ca"
```

**Si ça ne fonctionne pas**, votre serveur Evolution API est peut-être :
- ❌ Éteint
- ❌ En cours de démarrage (Render.com met les services gratuits en veille)
- ❌ Inaccessible

### 4. Vérifier les logs du serveur

Dans votre terminal où Next.js tourne, vous devriez voir :

```
Evolution API Service initialized: {
  apiUrl: 'https://evolution-api-latest-...',
  apiKeySet: true
}
```

Si vous voyez `apiUrl: 'NOT SET'` ou `apiKeySet: false`, les variables ne sont pas chargées.

---

## 🔥 Solutions aux problèmes courants

### Problème 1: Variables d'environnement non chargées

**Solution** :

1. Vérifiez que le fichier s'appelle exactement `.env` ou `.env.local` (pas `.env.example`)
2. Redémarrez complètement votre serveur Next.js :
   ```bash
   # Arrêtez le serveur (Ctrl+C)
   # Puis relancez
   npm run dev
   ```

### Problème 2: Evolution API en veille (Render.com free tier)

**Solution** :

Les services gratuits Render.com se mettent en veille après 15 minutes d'inactivité.

1. Réveillez le service en accédant à l'URL :
   ```bash
   curl https://evolution-api-latest-k396.onrender.com/
   ```
2. Attendez 30-60 secondes que le service démarre
3. Réessayez la connexion WhatsApp

### Problème 3: Timeout trop court

**Solution déjà appliquée** :
- Le timeout a été augmenté de 30s à 60s dans `evolutionApiService.ts`
- Si ça ne suffit pas, on peut l'augmenter encore

### Problème 4: Instance déjà existante

**Solution déjà appliquée** :
- Le code vérifie maintenant si l'instance existe déjà
- Si oui, il réutilise l'instance existante

### Problème 5: URL Evolution API incorrecte

Vérifiez que l'URL n'a **PAS** de slash `/` à la fin :

✅ **Correct** :
```
EVOLUTION_API_URL="https://evolution-api-latest-k396.onrender.com"
```

❌ **Incorrect** :
```
EVOLUTION_API_URL="https://evolution-api-latest-k396.onrender.com/"
```

---

## 📝 Checklist de vérification

- [ ] Le fichier `.env` existe à la racine du projet
- [ ] Les variables `EVOLUTION_API_URL` et `EVOLUTION_API_KEY` sont définies
- [ ] Le serveur Next.js a été redémarré après modification du `.env`
- [ ] L'endpoint `/api/channels/whatsapp/test` retourne `success`
- [ ] Evolution API répond à `curl https://evolution-api-latest-k396.onrender.com/`
- [ ] L'URL Evolution API n'a pas de slash final
- [ ] La clé API est correcte (32 caractères hexadécimaux)

---

## 🧪 Test manuel de création d'instance

Si tout le reste fonctionne, testez manuellement la création d'instance :

```bash
curl -X POST https://evolution-api-latest-k396.onrender.com/instance/create \
  -H "Content-Type: application/json" \
  -H "apikey: bd7711f6500e08ef7b0a6c6b077493ca" \
  -d '{
    "instanceName": "test_manual",
    "integration": "WHATSAPP-BAILEYS",
    "qrcode": true
  }'
```

**Si ça fonctionne**, le problème vient de la configuration Next.js.
**Si ça ne fonctionne pas**, le problème vient d'Evolution API.

---

## 📞 Support

Si après toutes ces étapes le problème persiste :

1. Exécutez l'endpoint de test : `/api/channels/whatsapp/test`
2. Copiez la réponse complète
3. Vérifiez les logs de votre console Next.js
4. Partagez ces informations pour obtenir de l'aide

---

## 🔄 Alternative : Utiliser une instance locale

Si le serveur Render.com est trop lent, vous pouvez lancer Evolution API en local :

```bash
# Avec Docker
docker run -d \
  --name evolution-api \
  -p 8000:8000 \
  -e AUTHENTICATION_API_KEY=test123 \
  atendai/evolution-api:latest

# Puis modifiez votre .env
EVOLUTION_API_URL="http://localhost:8000"
EVOLUTION_API_KEY="test123"
```

---

**Créé le**: 14 Octobre 2025
**Dernière mise à jour**: 14 Octobre 2025
