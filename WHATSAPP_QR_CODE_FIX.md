# 🔧 Fix QR Code WhatsApp - Erreur "Cannot read properties of undefined"

## 🔴 Problème identifié

Erreur dans la console du navigateur :
```
Error fetching QR code: TypeError: Cannot read properties of undefined (reading 'startsWith')
at fetchQRCode (page.tsx:112:42)
```

## 🎯 Cause

**Incohérence entre les données retournées par Evolution API et ce que le frontend attend.**

- Evolution API retourne : `{ code: "...", base64: "data:image/png;base64,...", pairingCode: null }`
- Le frontend essayait d'accéder à : `qrData.qrcode` (qui n'existe pas)

## ✅ Solution appliquée

### 1. Mise à jour de l'API Route (`/api/channels/whatsapp`)

**Avant** :
```typescript
const qrData = await evolutionApiService.connectInstance(instanceName);
return NextResponse.json({
  success: true,
  qrcode: qrData.code, // ❌ Retournait seulement le code texte
  pairingCode: qrData.pairingCode,
});
```

**Après** :
```typescript
const qrData = await evolutionApiService.connectInstance(instanceName);

console.log('QR Data from Evolution API:', qrData);

// Evolution API retourne { code, pairingCode, base64 }
// On utilise base64 si disponible, sinon code
const qrCodeValue = qrData.base64 || qrData.code;

if (!qrCodeValue) {
  throw new Error('No QR code available from Evolution API');
}

return NextResponse.json({
  success: true,
  qrcode: qrCodeValue, // ✅ Retourne le base64 complet
  pairingCode: qrData.pairingCode,
});
```

### 2. Mise à jour du Frontend (`page.tsx`)

**Avant** :
```typescript
const qrData = await qrResponse.json();

// ❌ Pas de vérification si qrData.qrcode existe
const qrCodeBase64 = qrData.qrcode.startsWith('data:') 
  ? qrData.qrcode 
  : `data:image/png;base64,${qrData.qrcode}`;
```

**Après** :
```typescript
const qrData = await qrResponse.json();

console.log('QR Data received:', qrData);

// ✅ Vérifier que le QR code existe
if (!qrData.success || !qrData.qrcode) {
  throw new Error('QR code not available in response');
}

// Le QR code est en base64 avec le préfixe data:image/png;base64,
const qrCodeBase64 = qrData.qrcode.startsWith('data:') 
  ? qrData.qrcode 
  : `data:image/png;base64,${qrData.qrcode}`;
```

### 3. Mise à jour des Types TypeScript

**Avant** :
```typescript
export interface ConnectInstanceResponse {
  pairingCode?: string;
  code: string; // QR code en base64
  count: number;
}
```

**Après** :
```typescript
export interface ConnectInstanceResponse {
  pairingCode?: string | null;
  code: string; // QR code text
  base64?: string; // QR code en base64 (data:image/png;base64,...)
  count?: number;
}
```

## 🧪 Comment tester

### 1. Redémarrer Next.js

```bash
# Arrêter le serveur (Ctrl+C)
npm run dev
```

### 2. Tester la connexion WhatsApp

1. Allez sur : `http://localhost:3000/dashboard/channels/connect/whatsapp`
2. Cliquez sur **"Démarrer la connexion"**
3. Le QR code devrait s'afficher correctement

### 3. Vérifier les logs

**Dans le terminal Next.js**, vous devriez voir :
```
QR Data from Evolution API: {
  code: "2@...",
  base64: "data:image/png;base64,iVBORw0KG...",
  pairingCode: null
}
```

**Dans la console du navigateur**, vous devriez voir :
```
QR Data received: {
  success: true,
  qrcode: "data:image/png;base64,iVBORw0KG...",
  pairingCode: null
}
```

## 📝 Checklist de vérification

- [x] API retourne `qrData.base64` au lieu de `qrData.code`
- [x] Frontend vérifie que `qrData.qrcode` existe avant de l'utiliser
- [x] Types TypeScript mis à jour
- [x] Logs ajoutés pour debug
- [ ] Tester la création d'instance
- [ ] Tester l'affichage du QR code
- [ ] Scanner le QR code avec WhatsApp
- [ ] Vérifier que la connexion fonctionne

## 🎯 Résultat attendu

Après ces modifications, vous devriez voir :

1. ✅ **Création d'instance réussie**
2. ✅ **QR code affiché** (image PNG)
3. ✅ **Pas d'erreur dans la console**
4. ✅ **Scanner le QR code fonctionne**
5. ✅ **Connexion WhatsApp établie**

## 🐛 Si le problème persiste

### Problème : QR code ne s'affiche toujours pas

**Solution 1** : Vérifier les logs
```bash
# Dans le terminal Next.js
# Recherchez : "QR Data from Evolution API:"
# Vérifiez que base64 est présent
```

**Solution 2** : Tester l'API directement
```bash
curl -X POST http://localhost:3000/api/channels/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "shopId": "VOTRE_SHOP_ID",
    "action": "get_qrcode",
    "instanceName": "shop_VOTRE_SHOP_ID"
  }'
```

**Solution 3** : Vérifier Evolution API
```bash
# Tester directement Evolution API
curl -X GET http://xamxam-evolution-evolution-api.usjniw.easypanel.host/instance/connect/shop_VOTRE_SHOP_ID \
  -H "apikey: 429683C4C977415CAAFCCE10F7D57E11"
```

### Problème : L'instance n'est pas créée

Vérifiez que l'instance a bien été créée :
```bash
curl -X GET http://xamxam-evolution-evolution-api.usjniw.easypanel.host/instance/fetchInstances \
  -H "apikey: 429683C4C977415CAAFCCE10F7D57E11"
```

## 📚 Fichiers modifiés

1. `src/app/api/channels/whatsapp/route.ts` - API route
2. `src/app/dashboard/channels/connect/whatsapp/page.tsx` - Frontend
3. `src/types/evolution-api.ts` - Types TypeScript

---

**Statut** : ✅ Fix appliqué, prêt à tester
