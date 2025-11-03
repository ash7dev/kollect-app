Module d'Upload - Documentation Complète
======================================

📁 Structure du Module
---------------------
1. upload.controller.ts     # Contrôleur des routes API
2. cloudinary.service.ts    # Service d'intégration Cloudinary
3. upload.service.ts        # Logique métier
4. dto/
   - upload.dto.ts         # Types et constantes partagés
   - upload-image.dto.ts   # Validation des images
   - upload-video.dto.ts   # Validation des vidéos
5. types/upload.types.ts   # Définitions TypeScript

🔧 Fonctionnement
----------------
1. Le client envoie une requête avec un fichier
2. Le contrôleur valide les entrées (DTOs)
3. Le service métier traite la requête
4. Le service Cloudinary gère l'upload
5. La réponse est renvoyée au client

🚀 Endpoints
-----------
1. POST /upload/image
   - Upload une image unique
   - Paramètres : file, folderType, width, height, quality

2. POST /upload/images
   - Upload multiple d'images
   - Paramètres : files[], folderType, transformations

3. POST /upload/video
   - Upload une vidéo
   - Paramètres : file, folderType, tags, context

4. DELETE /upload
   - Supprime une ressource
   - Paramètres : publicId, resourceType

⚙️ Configuration
--------------
- Dossiers disponibles :
  - kollect/avatars
  - kollect/brands
  - kollect/products
  - kollect/collections
  - kollect/teasers

- Limites :
  - Images : 5MB max (jpg, jpeg, png, webp, gif)
  - Vidéos : 100MB max (mp4, webm, mov)

🛡️ Gestion des Erreurs
--------------------
1. Validation des entrées :
   - Vérification des types de fichiers
   - Validation des tailles
   - Vérification des champs requis

2. Codes d'erreur HTTP :
   - 400 : Requête invalide
   - 401 : Non authentifié
   - 403 : Accès refusé
   - 404 : Ressource non trouvée
   - 413 : Fichier trop volumineux
   - 415 : Type de média non supporté
   - 500 : Erreur serveur

3. Journalisation :
   - Toutes les erreurs sont loguées
   - Stack trace en développement
   - Messages clairs en production

📝 Exemple d'utilisation
----------------------
```typescript
// Upload d'image
const formData = new FormData();
formData.append('file', imageFile);
formData.append('folderType', 'PRODUCTS');
formData.append('width', '800');
formData.append('quality', 'auto');

// Requête API
const response = await fetch('/upload/image', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
```

🔍 Bonnes Pratiques
-----------------
1. Toujours vérifier la réponse du serveur
2. Gérer les erreurs côté client
3. Utiliser les types TypeScript fournis
4. Respecter les limites de taille
5. Utiliser des dossiers appropriés
