# Publication de Contenu Facebook - XAMXAM-MAJ

## Vue d'ensemble

Cette fonctionnalité permet de publier du contenu texte directement sur les pages Facebook connectées depuis l'interface XAMXAM.

## Fonctionnalités implémentées

### ✅ Publication de texte
- Publication de messages texte sur Facebook
- Aperçu en temps réel du post
- Validation des données avant publication
- Gestion des erreurs et messages de succès

### 🔧 Architecture technique

```
/src/app/api/facebook/publish/route.ts    # API de publication
/src/services/facebook/publishService.ts  # Service métier
/src/app/dashboard/content/page.tsx       # Interface utilisateur
```

## Utilisation

### Interface utilisateur
1. Aller sur `/dashboard/content`
2. Sélectionner la page Facebook connectée
3. Écrire le message dans la zone de texte
4. Voir l'aperçu en temps réel
5. Cliquer sur "Publier maintenant"

### API
```typescript
POST /api/facebook/publish
{
  "message": "Votre message ici",
  "pageId": "ID_DE_LA_PAGE_FACEBOOK"
}
```

## Sécurité

- ✅ Authentification utilisateur requise
- ✅ Vérification des permissions sur la page
- ✅ Tokens d'accès chiffrés en base
- ✅ Validation des données d'entrée

## Prochaines étapes

### 🚧 À implémenter
- [ ] Publication d'images
- [ ] Publication de vidéos
- [ ] Programmation de posts
- [ ] Statistiques de publication
- [ ] Support Instagram
- [ ] Carrousels d'images

### 📋 Tests
- [ ] Tests unitaires du service
- [ ] Tests d'intégration API
- [ ] Tests E2E interface

## Configuration requise

### Variables d'environnement
```env
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
ENCRYPTION_SECRET_KEY=your_encryption_key
```

### Permissions Facebook
- `pages_show_list` - Lister les pages
- `pages_manage_posts` - Publier sur les pages
- `pages_read_engagement` - Lire les statistiques

## Limites actuelles

- Texte uniquement (pas d'images/vidéos)
- Une page à la fois
- Pas de programmation
- Pas de statistiques

## Dépannage

### Erreurs courantes
1. **"Canal Facebook non trouvé"** → Vérifier que la page est bien connectée
2. **"Token expiré"** → Reconnecter la page Facebook
3. **"Permissions insuffisantes"** → Vérifier les permissions de l'app Facebook