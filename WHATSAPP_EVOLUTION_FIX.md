# 🔧 Fix WhatsApp Evolution API - Erreur 401 Unauthorized

## 🔴 Problème identifié

Vous obtenez une erreur **401 Unauthorized** lors de la création d'une instance WhatsApp via Evolution API :

```
Error creating Evolution API instance: Request failed with status code 401
response: { message: 'Unauthorized' }
```

## 🎯 Cause

L'**API Key Evolution** est soit :
1. ❌ Incorrecte ou invalide
2. ❌ Mal configurée dans les variables d'environnement
3. ❌ Expirée ou révoquée
4. ❌ Ne correspond pas au serveur Evolution API utilisé

## ✅ Solutions (par ordre de priorité)

### Solution 1 : Vérifier la configuration de l'API Key

#### Étape 1 : Vérifier les variables d'environnement

1. **Ouvrez votre fichier `.env` ou `.env.local`**
2. **Vérifiez ces deux lignes** :
   ```bash
   EVOLUTION_API_URL="http://xamxam-evolution-evolution-api.usjniw.easypanel.host"
   EVOLUTION_API_KEY="votre_api_key_ici"
   ```

3. **Points de vérification** :
   - ✅ Pas d'espaces avant ou après les valeurs
   - ✅ Pas de guillemets doubles à l'intérieur de la valeur
   - ✅ L'URL ne se termine PAS par un `/`
   - ✅ L'API Key est complète (généralement 32+ caractères)

#### Étape 2 : Obtenir une nouvelle API Key

1. **Connectez-vous à votre panel Evolution API** :
   - URL : `http://xamxam-evolution-evolution-api.usjniw.easypanel.host`
   - Ou via votre panel EasyPanel

2. **Générez une nouvelle API Key** :
   - Dans Evolution API, allez dans **Settings** ou **API Keys**
   - Cliquez sur **Generate New Key** ou **Create API Key**
   - Copiez la clé générée

3. **Remplacez dans votre `.env`** :
   ```bash
   EVOLUTION_API_KEY="la_nouvelle_cle_generee"
   ```

4. **Redéployez sur Vercel** :
   ```bash
   # Méthode 1 : Via Vercel Dashboard
   # 1. Allez sur vercel.com
   # 2. Sélectionnez votre projet
   # 3. Settings > Environment Variables
   # 4. Modifiez EVOLUTION_API_KEY
   # 5. Redéployez

   # Méthode 2 : Via CLI
   vercel env add EVOLUTION_API_KEY
   # Collez la nouvelle clé
   vercel --prod
   ```

### Solution 2 : Tester la connexion manuellement

#### Test avec cURL

```bash
# Remplacez YOUR_API_KEY par votre vraie clé
curl -X GET http://xamxam-evolution-evolution-api.usjniw.easypanel.host/ \
  -H "apikey: YOUR_API_KEY"

# Si ça fonctionne, vous devriez voir :
# { "status": "ok", "version": "..." }

# Si vous obtenez 401, l'API Key est invalide
```

#### Test avec le script Node.js

1. **Éditez le fichier `test_evolution_connection.js`** :
   ```javascript
   const EVOLUTION_API_URL = 'http://xamxam-evolution-evolution-api.usjniw.easypanel.host';
   const EVOLUTION_API_KEY = 'VOTRE_VRAIE_API_KEY'; // ⚠️ REMPLACEZ ICI
   ```

2. **Exécutez le script** :
   ```bash
   node test_evolution_connection.js
   ```

3. **Analysez les résultats** :
   - ✅ Si tous les tests passent → Votre config est bonne, le problème vient d'ailleurs
   - ❌ Si erreur 401 → L'API Key est invalide
   - ❌ Si erreur de connexion → Le serveur n'est pas accessible

### Solution 3 : Tester via l'API de debug

1. **Déployez votre application**

2. **Testez l'endpoint de debug** :
   ```bash
   # Vérifier les variables d'environnement
   curl https://www.xamxam.io/api/debug/env

   # Tester la connexion Evolution API
   curl https://www.xamxam.io/api/debug/evolution
   ```

3. **Analysez la réponse** :
   ```json
   {
     "config": {
       "url": "http://...",
       "keyLength": 32,
       "keyPreview": "abc123..."
     },
     "tests": [
       {
         "name": "API Ping",
         "success": true/false,
         "status": 200/401
       }
     ],
     "summary": {
       "allPassed": true/false
     }
   }
   ```

### Solution 4 : Vérifier le serveur Evolution API

#### Vérifier que le serveur est en ligne

```bash
# Ping simple
curl http://xamxam-evolution-evolution-api.usjniw.easypanel.host/

# Devrait retourner quelque chose, même sans API key
```

#### Vérifier les logs du serveur

1. **Connectez-vous à EasyPanel**
2. **Allez dans votre service Evolution API**
3. **Consultez les logs** :
   - Recherchez des erreurs d'authentification
   - Vérifiez que l'API Key est bien configurée côté serveur

### Solution 5 : Format alternatif du header

Certaines versions d'Evolution API utilisent un format différent. Essayez :

#### Option A : Header `Authorization`

Modifiez `src/services/whatsapp/evolutionApiService.ts` :

```typescript
this.apiClient = axios.create({
  baseURL: this.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.apiKey}`, // Au lieu de 'apikey'
  },
  timeout: 60000,
});
```

#### Option B : Header `api-key` (avec tiret)

```typescript
this.apiClient = axios.create({
  baseURL: this.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'api-key': this.apiKey, // Au lieu de 'apikey'
  },
  timeout: 60000,
});
```

## 🔍 Diagnostic complet

### Checklist de vérification

- [ ] Variables d'environnement définies dans `.env`
- [ ] Variables d'environnement définies dans Vercel
- [ ] API Key copiée correctement (pas d'espaces)
- [ ] URL Evolution API correcte (pas de `/` à la fin)
- [ ] Serveur Evolution API accessible
- [ ] API Key valide (testée avec cURL)
- [ ] Redéploiement effectué après modification
- [ ] Logs Vercel vérifiés

### Commandes de diagnostic

```bash
# 1. Vérifier les variables localement
cat .env | grep EVOLUTION

# 2. Vérifier sur Vercel
vercel env ls

# 3. Tester la connexion
curl -X GET http://xamxam-evolution-evolution-api.usjniw.easypanel.host/ \
  -H "apikey: VOTRE_API_KEY"

# 4. Tester la création d'instance
curl -X POST http://xamxam-evolution-evolution-api.usjniw.easypanel.host/instance/create \
  -H "Content-Type: application/json" \
  -H "apikey: VOTRE_API_KEY" \
  -d '{
    "instanceName": "test_manual",
    "integration": "WHATSAPP-BAILEYS",
    "qrcode": true
  }'
```

## 📝 Logs à surveiller

Dans Vercel, recherchez ces logs :

```
✅ BON SIGNE :
Evolution API Service initialized: { apiUrl: '...', apiKeySet: true }
Evolution instance created successfully

❌ MAUVAIS SIGNE :
Error creating Evolution API instance: Request failed with status code 401
Evolution API Authentication Failed
```

## 🆘 Si rien ne fonctionne

1. **Vérifiez la documentation de votre serveur Evolution API**
   - Chaque installation peut avoir des configurations différentes

2. **Contactez le support EasyPanel**
   - Ils peuvent vérifier la configuration côté serveur

3. **Essayez une nouvelle installation d'Evolution API**
   - Parfois, une réinstallation propre résout les problèmes

4. **Utilisez une alternative**
   - WhatsApp Business API officielle
   - Baileys directement (sans Evolution API)
   - Twilio WhatsApp API

## 📚 Ressources

- [Evolution API Documentation](https://doc.evolution-api.com/)
- [Evolution API GitHub](https://github.com/EvolutionAPI/evolution-api)
- [EasyPanel Documentation](https://easypanel.io/docs)

## ✅ Une fois résolu

1. **Supprimez les fichiers de test** :
   ```bash
   rm test_evolution_connection.js
   ```

2. **Supprimez les routes de debug** (en production) :
   ```bash
   rm -rf src/app/api/debug
   ```

3. **Testez le flux complet** :
   - Créer une instance
   - Obtenir le QR code
   - Scanner avec WhatsApp
   - Envoyer/recevoir des messages

---

**Bonne chance ! 🚀**
