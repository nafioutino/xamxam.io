# 🚀 Fix WhatsApp Evolution API - Guide Rapide

## ✅ Votre test manuel fonctionne !

Vous avez confirmé que l'API Key est **correcte** avec le test `node test-evolution.js`.

Le problème est que **Next.js ne charge pas les variables d'environnement**.

## 🔧 Solution en 4 étapes

### Étape 1 : Arrêter Next.js

Dans le terminal où `npm run dev` tourne :
```bash
# Appuyez sur Ctrl+C
```

### Étape 2 : Vérifier votre fichier .env.local

**Option A : Si .env.local existe déjà**

Ouvrez `.env.local` et vérifiez qu'il contient :
```bash
EVOLUTION_API_URL="http://xamxam-evolution-evolution-api.usjniw.easypanel.host"
EVOLUTION_API_KEY="429683C4C977415CAAFCCE10F7D57E11"
WEBHOOK_GLOBAL_URL="https://www.xamxam.io/api/webhooks/evolution"
NEXT_PUBLIC_BASE_URL="https://www.xamxam.io"
```

**Option B : Si .env.local n'existe pas**

Créez-le :
```bash
# Dans Git Bash
cp .env.example .env.local

# Puis éditez .env.local et ajoutez :
EVOLUTION_API_URL="http://xamxam-evolution-evolution-api.usjniw.easypanel.host"
EVOLUTION_API_KEY="429683C4C977415CAAFCCE10F7D57E11"
```

### Étape 3 : Vérifier que les variables sont chargées

```bash
node check-env.js
```

Vous devriez voir :
```
✅ EVOLUTION_API_URL: http://xamxam-evolution-evolution-api.usjniw.easypanel.host
✅ EVOLUTION_API_KEY: 429683C4C9...
✅ NEXT_PUBLIC_BASE_URL: https://www.xamxam.io
🎉 Toutes les variables sont configurées !
```

### Étape 4 : Redémarrer Next.js

```bash
npm run dev
```

## 🧪 Tester que ça fonctionne

### Test 1 : Vérifier les variables dans l'app

Ouvrez dans votre navigateur :
```
http://localhost:3000/api/debug/env
```

Vous devriez voir :
```json
{
  "evolutionApiUrl": "http://xamxam-evolution-evolution-api.usjniw.easypanel.host",
  "evolutionApiKey": "SET",
  "evolutionApiKeyLength": 32,
  "evolutionApiKeyPreview": "429683C4C9..."
}
```

### Test 2 : Tester Evolution API depuis l'app

```
http://localhost:3000/api/debug/evolution
```

Vous devriez voir :
```json
{
  "tests": [
    { "name": "API Ping", "success": true },
    { "name": "Fetch Instances", "success": true },
    { "name": "Authentication Test", "success": true }
  ],
  "summary": {
    "allPassed": true
  }
}
```

### Test 3 : Créer une instance WhatsApp

Allez sur votre interface et cliquez sur "Connecter WhatsApp".

Les logs devraient maintenant afficher :
```
✅ Evolution instance created successfully
```

## 🎯 Pourquoi ça ne marchait pas ?

**Next.js charge les variables d'environnement UNIQUEMENT au démarrage.**

Si vous modifiez `.env` ou `.env.local` pendant que le serveur tourne, les changements ne sont **pas pris en compte**.

Il faut **toujours redémarrer** après avoir modifié les variables d'environnement.

## 📝 Checklist finale

- [ ] Arrêter Next.js (Ctrl+C)
- [ ] Vérifier que .env.local contient EVOLUTION_API_KEY="429683C4C977415CAAFCCE10F7D57E11"
- [ ] Exécuter `node check-env.js` → Tout doit être ✅
- [ ] Redémarrer avec `npm run dev`
- [ ] Tester `/api/debug/env` → evolutionApiKey doit être "SET"
- [ ] Tester `/api/debug/evolution` → allPassed doit être true
- [ ] Tester la connexion WhatsApp sur l'interface

## 🚨 Si ça ne marche toujours pas

### Problème : .env.local n'est pas lu

Next.js lit les fichiers dans cet ordre :
1. `.env.local` (priorité)
2. `.env.development` (en mode dev)
3. `.env`

**Solution** : Mettez vos variables dans `.env.local` pour être sûr.

### Problème : Variables avec espaces

❌ Mauvais :
```bash
EVOLUTION_API_KEY= 429683C4C977415CAAFCCE10F7D57E11
EVOLUTION_API_KEY=429683C4C977415CAAFCCE10F7D57E11 
```

✅ Bon :
```bash
EVOLUTION_API_KEY="429683C4C977415CAAFCCE10F7D57E11"
```

### Problème : Cache Next.js

Supprimez le cache :
```bash
rm -rf .next
npm run dev
```

## 🎉 Une fois que ça marche

1. **Commitez vos changements** (SANS .env.local) :
```bash
git add .
git commit -m "fix: WhatsApp Evolution API configuration"
git push
```

2. **Configurez les variables sur Vercel** :
```bash
# Via Vercel Dashboard
1. vercel.com → Votre projet
2. Settings → Environment Variables
3. Ajoutez :
   - EVOLUTION_API_URL
   - EVOLUTION_API_KEY
   - WEBHOOK_GLOBAL_URL
4. Redéployez
```

3. **Testez en production** :
```
https://www.xamxam.io/api/debug/evolution
```

---

**Vous êtes prêt ! 🚀**
