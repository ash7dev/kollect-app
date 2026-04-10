import { Command, Console } from 'nestjs-console';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
@Console()
export class CreateAdminCommand {
  private supabase: SupabaseClient;

  constructor(private prisma: PrismaService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    ) as SupabaseClient;
  }

  @Command({
    command: 'create-admin',
    description: 'Créer un utilisateur admin avec Supabase',
    options: [
      {
        flags: '-e, --email <email>',
        required: true,
        description: "Email de l'admin",
      },
      {
        flags: '-p, --password <password>',
        required: false,
        description: 'Mot de passe (généré si non fourni)',
      },
      {
        flags: '-f, --firstName <firstName>',
        required: true,
        description: "Prénom de l'admin",
      },
      {
        flags: '-l, --lastName <lastName>',
        required: true,
        description: "Nom de l'admin",
      },
    ],
  })
  async createAdmin(options: {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
  }) {
    const { email, password, firstName, lastName } = options;

    try {
      console.log("🔍 Vérification si l'utilisateur existe déjà...");

      // Vérifier si l'utilisateur existe déjà dans Supabase
      const { data: existingUsers, error: listError } =
        await this.supabase.auth.admin.listUsers();

      if (listError) {
        console.error(
          '❌ Erreur lors de la vérification des utilisateurs:',
          listError.message,
        );
        return;
      }

      const existingUser = existingUsers.users.find((u) => u.email === email);

      if (existingUser) {
        console.log(
          '⚠️  Un utilisateur avec cet email existe déjà dans Supabase',
        );

        // Vérifier s'il existe déjà dans la base de données
        const dbUser = await this.prisma.utilisateur.findUnique({
          where: { email },
        });

        if (dbUser) {
          console.log("ℹ️  L'utilisateur existe déjà dans la base de données");
          console.log(
            `📊 Statuts actuels: isAdmin=${dbUser.isAdmin}, isCEO=${dbUser.isCEO}, isClient=${dbUser.isClient}`,
          );

          // Mettre à jour les rôles si nécessaire
          if (!dbUser.isAdmin) {
            await this.prisma.utilisateur.update({
              where: { id: dbUser.id },
              data: {
                isAdmin: true,
                isCEO: false,
                isClient: true,
                updatedAt: new Date(),
              },
            });
            console.log(
              '✅ Rôles mis à jour: utilisateur est maintenant admin',
            );
          } else {
            console.log("✅ L'utilisateur est déjà admin");
          }
        } else {
          // Créer l'utilisateur dans la base de données
          await this.prisma.utilisateur.create({
            data: {
              email,
              firstName,
              lastName,
              supabaseId: existingUser.id,
              isAdmin: true,
              isCEO: false,
              isClient: true,
              has_seen_creator_prompt: true,
            },
          });
          console.log(
            '✅ Utilisateur créé dans la base de données avec les rôles admin',
          );
        }

        return;
      }

      // Générer un mot de passe si non fourni
      const finalPassword = password || this.generatePassword();

      console.log("👤 Création de l'utilisateur dans Supabase...");

      // Créer l'utilisateur dans Supabase
      const { data: authData, error: authError } =
        await this.supabase.auth.admin.createUser({
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
        console.error(
          '❌ Erreur lors de la création dans Supabase:',
          authError.message,
        );
        return;
      }

      if (!authData.user) {
        console.error('❌ Erreur: utilisateur non créé dans Supabase');
        return;
      }

      console.log("💾 Création de l'utilisateur dans la base de données...");

      // Créer l'utilisateur dans la base de données
      const dbUser = await this.prisma.utilisateur.create({
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
        console.log(
          '⚠️  Sauvegardez ce mot de passe, il ne sera plus affiché!',
        );
      }
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'admin:", error);
    }
  }

  @Command({
    command: 'list-admins',
    description: 'Lister tous les utilisateurs admin',
  })
  async listAdmins() {
    try {
      const admins = await this.prisma.utilisateur.findMany({
        where: { isAdmin: true },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isAdmin: true,
          isCEO: true,
          isClient: true,
          createdAt: true,
        },
      });

      if (admins.length === 0) {
        console.log('ℹ️  Aucun utilisateur admin trouvé');
        return;
      }

      console.log(`📋 Liste des utilisateurs admin (${admins.length}):`);
      console.log('');

      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.firstName} ${admin.lastName}`);
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   🆔 ID: ${admin.id}`);
        console.log(
          `   📊 Rôles: Admin=${admin.isAdmin}, CEO=${admin.isCEO}, Client=${admin.isClient}`,
        );
        console.log(
          `   📅 Créé le: ${admin.createdAt.toLocaleDateString('fr-FR')}`,
        );
        console.log('');
      });
    } catch (error) {
      console.error('❌ Erreur lors de la liste des admins:', error);
    }
  }

  private generatePassword(): string {
    const length = 12;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }
}
