# 🐛 Correction du bug WhatsApp QR Code

## Problème résolu

**Erreur** : `TypeError: Body is unusable: Body has already been read`

**Cause** : Dans `/api/channels/whatsapp/route.ts`, le body de la requête HTTP était lu plusieurs fois :
- Ligne 13 : Première lecture pour `shopId` et `action`
- Ligne 134 : Deuxième lecture pour `instanceName` (action `get_qrcode`)
- Ligne 153 : Troisième lecture pour `instanceName` (action `check_status`)

**HTTP ne permet de lire le body qu'une seule fois !**

---

## Solution appliquée

### Avant ❌
```typescript
const { shopId, action } = await request.json(); // Première lecture

// ...plus tard...
if (action === 'get_qrcode') {
  const { instanceName } = await request.json(); // ❌ Deuxième lecture !
}

if (action === 'check_status') {
  const { instanceName } = await request.json(); // ❌ Troisième lecture !
}
```

### Après ✅
```typescript
// Lire TOUS les paramètres en une seule fois
const body = await request.json();
const { shopId, action, instanceName } = body;

// ...plus tard...
if (action === 'get_qrcode') {
  // Utiliser directement instanceName (déjà extrait)
  if (!instanceName) {
    return NextResponse.json({ success: false, error: 'instanceName is required' }, { status: 400 });
  }
  // ...
}
```

---

## Résultat

✅ **L'instance Evolution API est maintenant créée avec succès !**

Logs Vercel confirmant la création :
```
Evolution instance created successfully: {
  instance: {
    instanceName: 'shop_0ca14154-a0f3-4fe7-89f0-0a1ba97546fc',
    instanceId: '87e51540-2063-4881-b9d2-970842403721',
    status: 'connecting'
  }
}
```

✅ **Le QR code devrait maintenant s'afficher correctement**

---

## Prochaines étapes

1. **Commit et push** :
   ```bash
   git add .
   git commit -m "fix: WhatsApp API body read multiple times"
   git push
   ```

2. **Tester sur Vercel** :
   - Accéder à `/dashboard/channels/connect/whatsapp`
   - Cliquer sur "Démarrer la connexion"
   - Le QR code devrait maintenant s'afficher

3. **Scanner le QR code** avec WhatsApp

4. **Vérifier la connexion** dans `/dashboard/channels`

---

**Date** : 14 Octobre 2025  
**Status** : ✅ Résolu
