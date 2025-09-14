### **Stratégie Globale : Le Poignée de Main et la Conversation**

Il faut voir l'intégration Meta en deux phases distinctes et découplées :

1.  **La Poignée de Main (Le "Handshake" - Onboarding) :** C'est le processus **unique** où le commerçant autorise ZOBA à accéder à ses données. C'est un flux **initié par l'utilisateur** via un bouton "Connecter". L'objectif est d'obtenir un **Page Access Token** longue durée et de le stocker de manière sécurisée.

2.  **La Conversation (Le Webhook) :** C'est le flux **continu** où Meta envoie des événements (messages, etc.) à votre plateforme. C'est un flux **initié par Meta**. L'objectif est de recevoir, valider, identifier et stocker ces événements de manière fiable.

Nous allons concevoir les deux.

---

### **1. Stratégie de Connexion des Canaux (La Poignée de Main)**

Voici une méthode simple, robuste et non technique pour l'utilisateur, basée sur le flux **OAuth 2.0 de Facebook**.

**Instructions pour Claude :**

1.  **Créer une page "Connecter un canal" (`/dashboard/channels/connect`) :**
    *   Cette page contiendra un unique bouton "Connecter avec Facebook".
    *   Le clic sur ce bouton redirigera l'utilisateur vers l'URL de dialogue d'authentification de Facebook.

2.  **Construire l'URL de Redirection Facebook :**
    *   L'URL doit inclure :
        *   `client_id`: L'ID de votre application Meta.
        *   `redirect_uri`: L'URL de callback sur votre site (ex: `https://www.xamxam.io/api/auth/callback/meta`).
        *   `scope`: La liste des permissions critiques que vous demandez. C'est le point le plus important. Vous aurez besoin de :
            *   `pages_show_list` (pour lister les pages du commerçant)
            *   `pages_messaging` (pour Facebook Messenger)
            *   `instagram_basic`, `instagram_manage_messages` (pour Instagram)
            *   `whatsapp_business_management`, `whatsapp_business_messaging` (pour WhatsApp)
            *   `business_management` (pour lier le tout)
        *   `response_type`: `code`.
        *   `state`: Un token CSRF unique et aléatoire, à stocker dans le cookie de l'utilisateur pour le vérifier au retour.

3.  **Créer l'API Route de Callback (`/api/auth/callback/meta`) :**
    *   Cette route recevra la redirection de Facebook après que l'utilisateur a donné son accord.
    *   **Valider le paramètre `state`** pour prévenir les attaques CSRF.
    *   Échanger le `code` reçu de Facebook contre un **User Access Token courte durée**.
    *   Échanger immédiatement ce token courte durée contre un **User Access Token longue durée**.
    *   Avec ce token longue durée, appeler le Graph API de Meta (`/me/accounts`) pour récupérer la **liste des pages Facebook** que l'utilisateur gère.
    *   **Rediriger l'utilisateur vers une page de sélection** (`/dashboard/channels/select-page`) en affichant la liste des pages récupérées.

4.  **Créer la Page de Sélection (`/dashboard/channels/select-page`) :**
    *   L'utilisateur voit ses pages et choisit celle qu'il veut connecter à ZOBA.
    *   Lorsqu'il clique sur "Connecter cette page", un appel est fait à une nouvelle API Route (`/api/channels/finalize`).

5.  **Créer l'API Route de Finalisation (`/api/channels/finalize`) :**
    *   Elle reçoit l'ID de la page sélectionnée.
    *   Utilise le User Access Token longue durée pour obtenir un **Page Access Token longue durée** pour cette page spécifique.
    *   **Stocker de manière sécurisée** (chiffré !) ce Page Access Token et le Page ID dans votre table `Channel`, en les liant au `shopId` du commerçant connecté.
    *   **Programmatiquement, souscrire cette page aux webhooks.** Utiliser le Page Access Token pour faire un appel `POST` à `/{page-id}/subscribed_apps` et activer les `fields` dont vous avez besoin (`messages`, `messaging_postbacks`, etc.).
    *   Rediriger l'utilisateur vers la page des canaux (`/dashboard/channels`) avec un message de succès.

---

### **2. Instructions pour l'API Route du Webhook (La Conversation)**

**Fichier :** `/app/api/webhooks/meta/route.ts`

**Instructions pour Claude :**
Le fichier doit gérer deux types de requêtes HTTP : `GET` pour la vérification et `POST` pour les événements.

#### **A. Gérer la Requête de Vérification (Méthode `GET`)**
1.  **Lire les paramètres de la query :** Récupérer `hub.mode`, `hub.verify_token`, et `hub.challenge` depuis l'URL.
2.  **Définir un Token de Vérification :** Créer une chaîne de caractères secrète et aléatoire (ex: `ZOBA_WEBHOOK_SECRET_STRING`). Stocker cette valeur dans vos variables d'environnement. C'est la même que vous configurerez dans le dashboard de l'application Meta.
3.  **Valider :** Vérifier si `hub.mode` est égal à `"subscribe"` ET si `hub.verify_token` est égal à votre `ZOBA_WEBHOOK_SECRET_STRING`.
4.  **Répondre :**
    *   Si la validation est réussie, répondre avec un statut **`200 OK`** et renvoyer la valeur de `hub.challenge` dans le corps de la réponse.
    *   Sinon, répondre avec un statut **`403 Forbidden`**.

#### **B. Gérer les Notifications d'Événements (Méthode `POST`)**
C'est le cœur de la logique. L'ordre des opérations est **critique pour la sécurité et la performance**.

1.  **Sécurité d'Abord : Valider la Signature de la Requête.** C'est **non négociable**.
    *   Récupérer la signature depuis le header `X-Hub-Signature-256`. Le format est `sha256=...`.
    *   Lire le **corps brut (raw body)** de la requête POST. **Ne pas le parser en JSON tout de suite.**
    *   Utiliser la bibliothèque `crypto` de Node.js pour calculer un HMAC SHA256 du corps brut, en utilisant votre **App Secret** Meta comme clé.
    *   Comparer le hash calculé avec la signature reçue dans le header.
    *   **Si les signatures ne correspondent pas, arrêter immédiatement le traitement et répondre `403 Forbidden`**.

2.  **Répondre Immédiatement à Meta :**
    *   Dès que la signature est validée, envoyer une réponse **`200 OK`** à Meta. **N'attendez PAS** d'avoir traité le message. Les webhooks de Meta ont un timeout court. Si vous ne répondez pas rapidement, ils considéreront l'envoi comme un échec et réessaieront, pouvant mener à des doublons ou à la désactivation de votre webhook.

3.  **Traitement Asynchrone (Après avoir répondu `200 OK`) :**
    *   Parser le corps de la requête en JSON.
    *   Le corps est un objet contenant un champ `entry`, qui est un tableau. Itérer sur chaque `entry`.
    *   Chaque `entry` contient un tableau `messaging`. Itérer sur chaque `event` dans `messaging`.

4.  **Logique Multi-Tenant : Identifier le Commerçant :**
    *   Dans chaque `event`, il y a un objet `recipient` qui contient `id`. Cet `id` est le **Page ID** de la page Facebook qui a reçu le message.
    *   **C'est la clé de votre système multi-tenant.**
    *   Faire une requête à votre base de données : `SELECT shopId FROM "Channel" WHERE "externalId" = {pageId} AND type = 'FACEBOOK_PAGE'`.
    *   Si aucun `shopId` n'est trouvé, ignorer l'événement (logguer une erreur).

5.  **Stocker et Préparer pour n8n :**
    *   Une fois le `shopId` trouvé, extraire les informations pertinentes de l'événement (`sender.id`, `message.text`, `timestamp`, etc.).
    *   Créer une nouvelle entrée dans votre table `Message`, en la liant à la bonne `Conversation` et au bon `shopId`.
    *   **Le traitement s'arrête ici pour cette API Route.**

---

### **3. Organisation Technique pour n8n et l'IA**

**Instruction pour Claude :**
La communication entre l'API Route et n8n doit être **asynchrone et pilotée par la base de données**.

1.  **Mettre en place un Trigger PostgreSQL :**
    *   Créer une fonction et un trigger dans PostgreSQL.
    *   Le trigger doit s'activer `AFTER INSERT ON public."Message"` pour chaque ligne où `isFromCustomer` est `true`.
    *   La fonction doit faire une requête HTTP (via `pg_net` ou un équivalent) vers un **Webhook de n8n**.

2.  **Concevoir le Payload pour n8n :**
    *   Le payload envoyé au webhook n8n doit être minimaliste et sécurisé.
    *   Exemple : `{ "messageId": "uuid-du-nouveau-message", "eventType": "NEW_MESSAGE" }`.
    *   **Ne pas envoyer** d'informations sensibles comme le contenu du message ou les tokens.

3.  **Concevoir le Workflow n8n :**
    *   Le workflow est déclenché par ce webhook.
    *   **Étape 1 :** Utiliser le `messageId` reçu pour faire une requête à la base de données ZOBA (via le noeud Postgres ou une API Route sécurisée) et récupérer tous les détails du message, l'historique de la conversation, et les informations de configuration de la boutique (FAQ, adresse, etc.).
    *   **Étape 2 :** Formater ces informations dans un prompt pour l'agent IA.
    *   **Étape 3 :** Appeler l'API de l'IA (OpenAI, Claude, etc.).
    *   **Étape 4 :** Utiliser le Graph API de Meta pour envoyer la réponse de l'IA au client. Les informations nécessaires (Page Access Token, ID du client) auront été récupérées à l'étape 1.

---

### **4. Points de Vigilance Cruciaux**

*   **Gestion des Tokens :** Les Page Access Tokens longue durée expirent après ~60 jours. Prévoir un **cron job** (via n8n ou Vercel Cron Jobs) qui s'exécute chaque semaine pour vérifier la validité des tokens et les rafraîchir si nécessaire.
*   **App Review Meta :** Votre application devra passer l'**App Review** de Meta pour fonctionner en production. C'est un processus exigeant qui requiert une politique de confidentialité claire et des démonstrations du fonctionnement de votre app. Préparez-vous à ce processus long. En mode "Développement", seuls les admins/testeurs de l'app peuvent utiliser l'intégration.
*   **Permissions (Scopes) :** Si vous manquez une permission dans le flux OAuth, certains événements n'arriveront jamais au webhook. Testez exhaustivement.
*   **Sécurité du Webhook :** La validation de la signature `X-Hub-Signature-256` est votre seule protection contre les requêtes malveillantes. Elle est **obligatoire**.
*   **Idempotence :** Meta peut (rarement) envoyer le même webhook deux fois. Votre logique de stockage doit pouvoir gérer cela sans créer de doublons (ex: en utilisant l'ID externe du message comme contrainte unique).