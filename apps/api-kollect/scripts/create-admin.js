const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const connectionString =
  process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DIRECT_DATABASE_URL or DATABASE_URL is required');
}

const sslRequired =
  process.env.PGSSLMODE === 'require' ||
  /sslmode=require/i.test(connectionString) ||
  connectionString.includes('supabase.co');

const cleanedConnectionString = sslRequired
  ? connectionString
      .replace(/([?&])sslmode=[^&]*/i, '$1')
      .replace(/[?&]$/, '')
  : connectionString;

const pool = new Pool({
  connectionString: cleanedConnectionString,
  ...(sslRequired ? { ssl: { rejectUnauthorized: false } } : {}),
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
  log: ['error', 'warn'],
});
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generatePassword() {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

async function createAdmin() {
  const args = process.argv.slice(2);
  let email = '';
  let password = '';
  let firstName = '';
  let lastName = '';

  // Parser les arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-e' && args[i + 1]) email = args[i + 1];
    if (args[i] === '-p' && args[i + 1]) password = args[i + 1];
    if (args[i] === '-f' && args[i + 1]) firstName = args[i + 1];
    if (args[i] === '-l' && args[i + 1]) lastName = args[i + 1];
  }

  if (!email || !firstName || !lastName) {
    console.log('❌ Arguments requis: -e <email> -f <firstName> -l <lastName>');
    console.log('Optionnel: -p <password>');
    process.exit(1);
  }

  try {
    console.log("🔍 Vérification si l'utilisateur existe déjà dans la base...");

    const existingDbUser = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (existingDbUser?.isAdmin) {
      console.log("✅ L'utilisateur est déjà admin dans la base de données");
      console.log(`📊 Statuts actuels: isAdmin=${existingDbUser.isAdmin}, isCEO=${existingDbUser.isCEO}, isClient=${existingDbUser.isClient}`);
      return;
    }

    // Générer un mot de passe si non fourni
    const finalPassword = password || generatePassword();

    console.log("👤 Création de l'utilisateur dans Supabase...");

    // Créer l'utilisateur dans Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: finalPassword,
      email_confirm: true,
      user_metadata: {
        firstName,
        lastName,
        role: 'admin',
      },
    });

    if (authError) {
      if (authError.message?.toLowerCase().includes('already') || authError.message?.toLowerCase().includes('registered')) {
        console.log('⚠️  Un utilisateur avec cet email existe déjà dans Supabase');
        if (!existingDbUser) {
          console.log("❌ L'utilisateur existe dans Supabase mais pas dans la base Kollect.");
          console.log("   Il faut soit retrouver son supabaseId manuellement, soit utiliser un email neuf.");
          return;
        }

        await prisma.utilisateur.update({
          where: { id: existingDbUser.id },
          data: {
            firstName,
            lastName,
            isAdmin: true,
            isCEO: false,
            isClient: true,
            has_seen_creator_prompt: true,
            updatedAt: new Date(),
          },
        });

        console.log('✅ Rôles mis à jour: utilisateur existant promu admin');
        return;
      }

      console.error("❌ Erreur lors de la création dans Supabase:", authError.message);
      return;
    }

    if (!authData.user) {
      console.error('❌ Erreur: utilisateur non créé dans Supabase');
      return;
    }

    console.log("💾 Création de l'utilisateur dans la base de données...");

    // Créer l'utilisateur dans la base de données
    const dbUser = existingDbUser
      ? await prisma.utilisateur.update({
          where: { id: existingDbUser.id },
          data: {
            email,
            firstName,
            lastName,
            supabaseId: authData.user.id,
            isAdmin: true,
            isCEO: false,
            isClient: true,
            has_seen_creator_prompt: true,
            updatedAt: new Date(),
          },
        })
      : await prisma.utilisateur.create({
          data: {
            email,
            firstName,
            lastName,
            supabaseId: authData.user.id,
            isAdmin: true,
            isCEO: false,
            isClient: true,
            has_seen_creator_prompt: true,
          },
        });

    console.log('🎉 Utilisateur admin créé avec succès!');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Nom: ${firstName} ${lastName}`);
    console.log(`🆔 ID: ${dbUser.id}`);
    console.log(`🔑 Supabase ID: ${authData.user.id}`);

    if (!password) {
      console.log(`🔐 Mot de passe généré: ${finalPassword}`);
      console.log('⚠️  Sauvegardez ce mot de passe, il ne sera plus affiché!');
    }

  } catch (error) {
    console.error("❌ Erreur lors de la création de l'admin:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createAdmin();
