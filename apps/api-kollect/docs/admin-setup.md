# 🛠️ Guide d'Installation du Système Admin Kollect

Ce guide explique comment créer un utilisateur admin et configurer le système d'administration centralisé.

## 📋 Prérequis

- Node.js 18+
- Accès à la base de données Supabase
- Variables d'environnement configurées

## 🔧 Étapes d'Installation

### 1. Créer un Utilisateur Admin

Utilisez la commande CLI pour créer un utilisateur admin :

```bash
# Créer un admin avec mot de passe généré automatiquement
npm run create-admin -- -e admin@kollect.com -f "Admin" -l "Kollect"

# Créer un admin avec mot de passe personnalisé
npm run create-admin -- -e admin@kollect.com -p "VotreMotDePasse123!" -f "Admin" -l "Kollect"
```

**Options disponibles :**
- `-e, --email` : Email de l'admin (requis)
- `-p, --password` : Mot de passe (optionnel, généré si non fourni)
- `-f, --firstName` : Prénom de l'admin (requis)
- `-l, --lastName` : Nom de l'admin (requis)

### 2. Lister les Utilisateurs Admin

```bash
npm run list-admins
```

### 3. Connexion au Portail Admin

1. Allez sur `https://votre-domaine.com/auth/login`
2. Connectez-vous avec les identifiants admin
3. Vous serez automatiquement redirigé vers `/admin`

## 🔄 Flux de Redirection

### Middleware (`middleware.ts`)
- **Non-authentifié** → Redirection vers `/auth/login`
- **Admin** → Accès aux routes `/admin/*`
- **Non-admin** → Redirection vers `/dashboard` pour les routes admin

### Page d'accueil (`page.tsx`)
- **Admin** → Redirection vers `/admin`
- **CEO** → Redirection vers `/dashboard`
- **Client** → Affichage de la landing page

## 🏗️ Architecture du Système

### Backend (API NestJS)
```
src/
├── admin/
│   ├── admin.controller.ts    # 25+ routes admin
│   ├── admin.service.ts       # Logique métier
│   ├── admin.module.ts        # Module centralisé
│   └── dto/
│       └── admin.dto.ts       # DTOs validés
├── commands/
│   ├── create-admin.command.ts # Commande CLI
│   └── commands.module.ts     # Module de commandes
└── cli.ts                     # Point d'entrée CLI
```

### Frontend (Next.js)
```
src/
├── app/
│   ├── admin/
│   │   └── page.tsx           # Portail admin
│   └── page.tsx               # Redirections
├── components/admin/
│   ├── AdminIcons.tsx         # Icônes SVG
│   ├── AdminUsersTable.tsx    # Gestion utilisateurs
│   ├── AdminReviewsTable.tsx  # Modération avis
│   └── AdminBrandsTable.tsx   # Gestion marques
├── services/
│   └── adminApi.ts            # Service API admin
└── middleware.ts              # Redirections
```

## 🛡️ Sécurité

### Rôles et Permissions
- **Admin** : Accès complet à `/admin/*`
- **CEO** : Accès à `/dashboard`
- **Client** : Accès public uniquement

### Routes Protégées
- **Admin** : `@Roles('isAdmin')` + JWT Guard
- **Auth** : `@UseGuards(JwtAuthGuard)`
- **Rate Limiting** : Protection contre les abus

## 📊 Fonctionnalités Admin

### Gestion des Utilisateurs
- 👥 Liste des utilisateurs avec filtres
- 🔧 Modification des rôles (Admin/CEO/Client)
- 📊 Statistiques utilisateurs

### Modération des Avis
- ⭐ Validation/rejet des avis
- 📝 Gestion des réponses vendeurs
- 📈 Statistiques des avis

### Gestion des Marques
- 🏪 Vérification des marques
- ✅ Activation/désactivation
- 📊 Statistiques des vendeurs

### Supervision des Commandes
- 📦 Vue globale des commandes
- ✅ Confirmation/annulation
- 📊 Analytics et rapports

## 🔧 Dépannage

### Erreurs Courantes

**1. "Commande non trouvée"**
```bash
# Assurez-vous d'être dans le bon dossier
cd apps/api-kollect
npm run create-admin -- -e admin@kollect.com -f "Admin" -l "Kollect"
```

**2. "Erreur Supabase"**
```bash
# Vérifiez vos variables d'environnement
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

**3. "Redirection incorrecte"**
- Vérifiez le middleware `middleware.ts`
- Confirmez les rôles dans la base de données
- Nettoyez les cookies du navigateur

### Logs et Debug

```bash
# Voir les logs de l'API
npm run start:dev

# Vérifier les utilisateurs en base
npm run list-admins
```

## 🚀 Déploiement

1. **Créer l'admin en production**
2. **Configurer les variables d'environnement**
3. **Déployer l'API et le frontend**
4. **Tester les redirections**

## 📞 Support

En cas de problème :
1. Vérifiez les logs de l'application
2. Confirmez les variables d'environnement
3. Testez avec un navigateur en mode privé

---

**Votre système admin Kollect est maintenant prêt !** 🎉
