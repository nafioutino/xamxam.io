# 🔍 Debug Signature Instagram Webhook

## Problème actuel
La signature Instagram webhook est toujours incorrecte malgré l'utilisation de la même méthode que Meta.

## Signatures observées
- **Reçue**: `sha256=f02f49e75ff5e210e096bb2d774b9023c11ab5ace5a10037315790c332592ec3`
- **Calculée**: `sha256=50747560f62806b0d99d4e5a9d3f5702ed1feea1000ac40d84784e2180abf272`

## Causes possibles

### 1. App Secret différent
- Instagram utilise peut-être un App Secret différent de Facebook
- Vérifier dans Meta Developer Console si Instagram a son propre secret

### 2. Encodage du payload
- Meta pourrait envoyer le payload avec un encodage différent pour Instagram
- Différences dans les caractères spéciaux ou l'UTF-8

### 3. Configuration Vercel
- Variables d'environnement mal configurées
- `INSTAGRAM_APP_SECRET` vs `FACEBOOK_APP_SECRET`

### 4. Webhook URL différente
- Meta pourrait utiliser une signature différente selon l'URL du webhook
- `/api/webhooks/instagram` vs `/api/webhooks/meta`

## Solutions à tester

### ✅ Solution 1: Utiliser verifyWebhookSignature()
J'ai modifié le code pour utiliser la fonction `verifyWebhookSignature()` d'encryption.ts qui:
- Supprime automatiquement le préfixe `sha256=`
- Utilise `timingSafeEqual` avec des buffers hex
- Gère mieux les différences d'encodage

### 🔄 Solution 2: Vérifier l'App Secret
1. Aller dans Meta Developer Console
2. Vérifier si Instagram a un App Secret séparé
3. Comparer avec `FACEBOOK_APP_SECRET`

### 🔄 Solution 3: Test avec FACEBOOK_APP_SECRET uniquement
Forcer l'utilisation de `FACEBOOK_APP_SECRET` seulement:
```typescript
const appSecret = process.env.FACEBOOK_APP_SECRET;
```

### 🔄 Solution 4: Logs détaillés
Le nouveau code inclut des logs pour comparer:
- La méthode encryption.ts
- La méthode directe
- L'App Secret utilisé
- La longueur du payload

## Prochaines étapes
1. Tester avec les nouveaux logs
2. Comparer les résultats des deux méthodes
3. Vérifier la configuration Vercel
4. Si nécessaire, utiliser uniquement `FACEBOOK_APP_SECRET`