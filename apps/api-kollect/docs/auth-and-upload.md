## Authentification multi-clients et upload médias

### 1. Vue d’ensemble

Cette documentation décrit :

- **le flux d’authentification multi-clients** (mobile, web) basé sur Supabase + JWT interne,
- **les endpoints principaux** utilisés par les clients,
- **le contrat d’upload de médias** (images, vidéos) exposé par l’API.

Elle est destinée aux développeurs mobile, web et backend pour garder un contrat commun et stable.

---

### 2. Authentification multi-clients

#### 2.1. Flux global

1. **Login / signup Supabase côté client (mobile ou web)**
   - Le client utilise le SDK Supabase (`@supabase/supabase-js`) pour :
     - s’inscrire (`signUp`),
     - se connecter (`signInWithPassword`),
     - ou utiliser un provider OAuth (`signInWithOAuth`).
   - À l’issue de cette étape, le client dispose d’un **Supabase access token**.

2. **Synchronisation avec le backend**
   - Le client appelle `POST /api/v1/auth/sync` (ou `/api/auth/sync` pour compatibilité legacy) avec :
     - dans le body JSON :
       - `supabaseAccessToken: string` (obligatoire),
       - `fcmToken?: string` (optionnel, mobile uniquement).
   - Le backend :
     - vérifie le token Supabase,
     - **upsert** l’utilisateur dans la base Prisma via `supabaseId`,
     - génère un **JWT interne** contenant les rôles et métadonnées utiles.

3. **Stockage du JWT interne côté client**
   - Mobile :
     - le token est stocké dans `SecureStore` (Expo).
   - Web :
     - le token est stocké dans `localStorage` ou un storage équivalent côté navigateur.

4. **Appels API protégés**
   - Tous les appels suivants se font vers `https://<API_URL>/api/v1/...` avec l’en-tête :
     - `Authorization: Bearer <JWT_INTERNE>`.

5. **Refresh / récupération du profil**
   - Le client peut appeler `GET /api/v1/auth/me` pour :
     - récupérer le **profil utilisateur complet**,
     - obtenir un **nouveau JWT** si nécessaire.

6. **Logout**
   - Le client appelle `POST /api/v1/auth/logout`.
   - Côté client, on supprime le token des stockages (SecureStore, localStorage, etc.).

#### 2.2. Endpoints d’auth importants

- `GET /api/v1/auth/health`
  - Vérifie que l’API d’auth fonctionne.

- `POST /api/v1/auth/sync`
  - **Body JSON attendu :**
    ```json
    {
      "supabaseAccessToken": "<access_token_supabase>",
      "fcmToken": "<optionnel_token_fcm_mobile>"
    }
    ```
  - **Réponse :** `AuthResponseWithToken`
    - contient :
      - `access_token`: JWT interne à utiliser dans `Authorization: Bearer`,
      - `user`: objet utilisateur avec les champs principaux (`id`, `email`, `isClient`, `isCEO`, `isAdmin`, `has_seen_creator_prompt`, infos de profil, etc.).

- `GET /api/v1/auth/me`
  - **Headers :**
    - `Authorization: Bearer <JWT_INTERNE>`
  - **Réponse :** `AuthResponseWithToken` (même format que `/auth/sync`).

- `POST /api/v1/auth/logout`
  - **Headers :**
    - `Authorization: Bearer <JWT_INTERNE>`

- `POST /api/v1/auth/fcm-token`
  - Utilisé par le mobile pour enregistrer le token FCM.
  - **Body JSON :**
    ```json
    {
      "fcmToken": "<token_fcm>"
    }
    ```

---

### 3. Rôles et protection des routes

Les rôles principaux sont :

- `isClient`: utilisateur final (acheteur),
- `isCEO`: créateur / propriétaire de marque,
- `isAdmin`: administrateur de la plateforme.

Ils sont encodés dans le **JWT interne** et exposés dans `user.roles` côté client.

Les endpoints NestJS utilisent :

- un guard JWT (`JwtAuthGuard`) pour vérifier le token,
- un guard de rôles (`RolesGuard`) + décorateur `@Roles(...)` pour restreindre l’accès.

#### 3.1. Exemples de restrictions

- Endpoints accessibles à tout utilisateur authentifié (client ou CEO) :
  - `GET /api/v1/auth/me`
  - `POST /api/v1/auth/logout`

- Endpoints orientés CEO (création/gestion de marque, collections, produits…) :
  - `POST /api/v1/brands`
  - `GET /api/v1/brands/my-brand`
  - `POST /api/v1/collections`
  - `POST /api/v1/produits`
  - etc.

- Endpoints admin :
  - `GET /api/v1/auth/admin/dashboard`
  - futurs endpoints de vérification/gestion des marques (`verify`, `force-delete`, etc.).

---

### 4. Contrat d’upload de médias

Les endpoints d’upload sont regroupés dans le contrôleur `UploadController` :

- Préfixe : `/api/v1/upload` (ou `/api/upload` en legacy).
- Tous les endpoints sont protégés par `JwtAuthGuard` (auth requise).

#### 4.1. Upload d’une image

- **Endpoint :** `POST /api/v1/upload/image`
- **Headers :**
  - `Authorization: Bearer <JWT_INTERNE>`
  - `Content-Type: multipart/form-data`
- **Form-data attendu :**
  - `file`: le fichier image (obligatoire).
  - Champs JSON (dans le même form-data) mappés sur `UploadImageDto` :
    - `folderType?: string` (optionnel, défaut : `products`),
    - `width?: number`,
    - `height?: number`,
    - `quality?: number`.

- **Contraintes côté backend :**
  - Taille max image : `UPLOAD_CONSTANTS.MAX_IMAGE_SIZE`.
  - Types MIME autorisés : `UPLOAD_CONSTANTS.ALLOWED_IMAGE_MIMETYPES`.

- **Réponse :**
  ```json
  {
    "success": true,
    "message": "Image uploaded successfully",
    "data": {
      "...": "données renvoyées par Cloudinary (url, public_id, etc.)"
    }
  }
  ```

#### 4.2. Upload de plusieurs images

- **Endpoint :** `POST /api/v1/upload/images`
- **Headers :**
  - `Authorization: Bearer <JWT_INTERNE>`
  - `Content-Type: multipart/form-data`
- **Form-data attendu :**
  - `files`: liste de fichiers images (max 10).
  - Champs JSON similaires à `UploadImageDto` :
    - `folderType?: string`,
    - `width?: number`,
    - `height?: number`,
    - `quality?: number`.

- **Réponse :**
  ```json
  {
    "success": true,
    "message": "<N> images uploaded successfully",
    "data": [
      {
        "...": "données de la première image"
      }
    ]
  }
  ```

#### 4.3. Upload d’une vidéo

- **Endpoint :** `POST /api/v1/upload/video`
- **Headers :**
  - `Authorization: Bearer <JWT_INTERNE>`
  - `Content-Type: multipart/form-data`
- **Form-data attendu :**
  - `file`: le fichier vidéo (obligatoire).
  - Champs JSON mappés sur `UploadVideoDto` :
    - `folderType?: string` (optionnel, défaut : `products`).

- **Contraintes :**
  - Taille max vidéo : `UPLOAD_CONSTANTS.MAX_VIDEO_SIZE`.
  - Types MIME autorisés : `UPLOAD_CONSTANTS.ALLOWED_VIDEO_MIMETYPES`.

- **Réponse :**
  ```json
  {
    "success": true,
    "message": "Video uploaded successfully",
    "data": {
      "...": "données renvoyées par Cloudinary"
    }
  }
  ```

#### 4.4. Suppression d’une ressource

- **Endpoint :** `DELETE /api/v1/upload`
- **Headers :**
  - `Authorization: Bearer <JWT_INTERNE>`
  - `Content-Type: application/json`
- **Body JSON :**
  ```json
  {
    "publicId": "<public_id_cloudinary>"
  }
  ```

---

### 5. Bonnes pratiques côté clients (mobile & web)

- Toujours utiliser les endpoints **versionnés** (`/api/v1/...`) pour les nouveaux développements.
- Centraliser la logique d’auth (login Supabase → `/auth/sync` → stockage du JWT → `/auth/me` → logout) dans un **service commun** ou un package partagé.
- Lors des uploads :
  - respecter les noms de champs (`file`, `files`, `folderType`, etc.),
  - afficher des messages d’erreur clairs en cas de rejet (taille, type MIME).
- En cas d’évolution de contrat (nouvelles propriétés, nouveaux dossiers, etc.), mettre à jour **cette doc** et, idéalement, la spec OpenAPI associée.

