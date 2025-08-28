# Prérequis Facebook pour l'intégration Zoba

## 🔧 Configuration Facebook Developer

### 1. Application Facebook (Meta for Developers)

**Ce que vous devez créer/obtenir :**

#### A. Créer une App Facebook
1. Aller sur [developers.facebook.com](https://developers.facebook.com)
2. Créer une nouvelle app de type "Business"
3. Ajouter les produits suivants :
   - **Facebook Login** (pour l'authentification)
   - **Webhooks** (pour recevoir les messages)
   - **Messenger Platform** (pour Facebook Messenger)
   - **Instagram Basic Display** (pour Instagram)
   - **WhatsApp Business Platform** (pour WhatsApp)

#### B. Informations à récupérer
```env
# Variables d'environnement nécessaires
NEXT_PUBLIC_FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_WEBHOOK_VERIFY_TOKEN=your_custom_verify_token
```

### 2. Permissions Facebook requises

#### Pour Facebook Messenger :
- `pages_show_list` - Lister les pages gérées
- `pages_messaging` - Envoyer/recevoir des messages
- `business_management` - Gestion business

#### Pour Instagram :
- `instagram_basic` - Accès de base Instagram
- `instagram_manage_messages` - Gestion des messages Instagram
- `pages_show_list` - Lister les pages liées
- `business_management` - Gestion business

#### Pour WhatsApp Business :
- `whatsapp_business_management` - Gestion WhatsApp Business
- `whatsapp_business_messaging` - Envoi de messages WhatsApp
- `business_management` - Gestion business

### 3. Configuration des URLs de redirection

#### Dans Facebook Login > Settings :
```
Valid OAuth Redirect URIs:
- https://zoba.com/api/auth/callback/meta
- http://localhost:3000/api/auth/callback/meta (pour développement)
```

### 4. Configuration des Webhooks

#### URL du Webhook :
```
https://zoba.com/api/webhooks/meta
```

#### Events à souscrire :

**Pour Messenger :**
- `messages` - Nouveaux messages
- `messaging_postbacks` - Boutons cliqués
- `messaging_deliveries` - Confirmations de livraison
- `messaging_reads` - Messages lus

**Pour Instagram :**
- `messages` - Messages directs
- `messaging_postbacks` - Interactions

**Pour WhatsApp :**
- `messages` - Messages WhatsApp
- `message_deliveries` - Statuts de livraison

### 5. Processus d'approbation Meta

#### Permissions nécessitant une révision :
- `pages_messaging` - Révision requise
- `instagram_manage_messages` - Révision requise
- `whatsapp_business_messaging` - Révision requise

#### Documents à préparer :
1. **Politique de confidentialité** de votre site
2. **Conditions d'utilisation**
3. **Vidéo de démonstration** montrant l'utilisation des permissions
4. **Description détaillée** de l'usage des données

## 🔐 Sécurité et Tokens

### Types de tokens utilisés :

1. **User Access Token (courte durée)** - 1 heure
   - Obtenu lors de l'authentification initiale
   - Échangé immédiatement contre un token longue durée

2. **User Access Token (longue durée)** - 60 jours
   - Utilisé pour récupérer les pages de l'utilisateur
   - Échangé contre des Page Access Tokens

3. **Page Access Token (longue durée)** - Permanent
   - Token spécifique à chaque page
   - Utilisé pour envoyer/recevoir des messages
   - **DOIT ÊTRE CHIFFRÉ** avant stockage en base

### Stockage sécurisé :
```sql
-- Table Channel avec chiffrement
CREATE TABLE channels (
  id VARCHAR PRIMARY KEY,
  shop_id VARCHAR NOT NULL,
  platform VARCHAR NOT NULL, -- 'messenger', 'instagram', 'whatsapp'
  page_id VARCHAR NOT NULL,
  page_name VARCHAR,
  access_token_encrypted TEXT NOT NULL, -- Token chiffré
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🛠️ APIs Meta à utiliser

### 1. Authentification OAuth
```
GET https://www.facebook.com/v18.0/dialog/oauth
```

### 2. Échange de tokens
```
GET https://graph.facebook.com/v18.0/oauth/access_token
```

### 3. Récupération des pages
```
GET https://graph.facebook.com/v18.0/me/accounts
```

### 4. Obtention du Page Access Token
```
GET https://graph.facebook.com/v18.0/{page-id}?fields=access_token
```

### 5. Souscription aux webhooks
```
POST https://graph.facebook.com/v18.0/{page-id}/subscribed_apps
```

### 6. Envoi de messages
```
POST https://graph.facebook.com/v18.0/me/messages
```

## 📋 Checklist avant implémentation

- [ ] App Facebook créée avec tous les produits
- [ ] App ID et App Secret récupérés
- [ ] URLs de redirection configurées
- [ ] Webhook URL configurée
- [ ] Token de vérification webhook défini
- [ ] Permissions demandées (en attente d'approbation si nécessaire)
- [ ] Politique de confidentialité publiée
- [ ] Variables d'environnement configurées
- [ ] Base de données préparée pour le stockage chiffré

## 🚀 Prochaines étapes

1. Créer l'API Route de callback (`/api/auth/callback/meta`)
2. Implémenter la validation CSRF
3. Gérer l'échange de tokens
4. Créer la page de sélection des pages Facebook
5. Implémenter le stockage sécurisé des tokens
6. Configurer les webhooks programmatiquement
7. Tester le flux complet

---

**Important :** Gardez vos App Secret et tokens en sécurité. Ne les commitez jamais dans votre repository Git !