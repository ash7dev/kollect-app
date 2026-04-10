'use client';

import { useEffect, useState } from 'react';
import { FONT_FAMILY_INTER } from '@/styles/typography';

const LAST_UPDATED = '9 avril 2026';

const SECTIONS = [
  {
    title: '1. Présentation de la plateforme',
    content: `Kollect est une plateforme en ligne dédiée aux créateurs et marques de streetwear sénégalais. Elle met en relation des créateurs (vendeurs) et des acheteurs pour la vente de produits de mode, d'accessoires et d'articles liés à la culture streetwear locale.

La plateforme est éditée par Kollect SN, dont le siège est basé à Dakar, Sénégal.`,
  },
  {
    title: '2. Acceptation des conditions',
    content: `En accédant à la plateforme Kollect et en utilisant ses services, vous acceptez pleinement et sans réserve les présentes conditions générales d'utilisation (CGU). Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.

Ces conditions peuvent être modifiées à tout moment. La date de dernière mise à jour est indiquée en haut de cette page.`,
  },
  {
    title: '3. Inscription et compte utilisateur',
    content: `Pour utiliser certaines fonctionnalités de Kollect, vous devez créer un compte utilisateur. Vous vous engagez à :

• Fournir des informations exactes, complètes et à jour lors de votre inscription
• Maintenir la confidentialité de vos identifiants de connexion
• Notifier immédiatement Kollect de toute utilisation non autorisée de votre compte
• Être responsable de toutes les activités réalisées depuis votre compte

Kollect se réserve le droit de suspendre ou de supprimer tout compte ne respectant pas ces conditions.`,
  },
  {
    title: '4. Utilisation de la plateforme',
    content: `Vous vous engagez à utiliser Kollect de manière légale et dans le respect des présentes CGU. Il est notamment interdit de :

• Utiliser la plateforme à des fins frauduleuses ou illicites
• Publier des contenus faux, trompeurs ou portant atteinte aux droits de tiers
• Tenter de pirater, perturber ou surcharger les serveurs de Kollect
• Collecter des données d'autres utilisateurs sans leur consentement
• Reproduire, copier ou distribuer le contenu de la plateforme sans autorisation`,
  },
  {
    title: '5. Transactions et paiements',
    content: `Les transactions réalisées sur Kollect sont effectuées directement entre acheteurs et créateurs. Kollect agit en tant qu'intermédiaire de confiance.

Les prix affichés sont en Francs CFA (FCFA) et incluent toutes les taxes applicables. Kollect prélève une commission sur chaque vente réalisée par les créateurs.

Tout paiement est définitif. En cas de litige, contactez notre service client dans les 48 heures suivant la transaction.`,
  },
  {
    title: '6. Livraison et retours',
    content: `Les modalités de livraison varient selon les créateurs. Chaque créateur est responsable de l'expédition de ses produits dans les délais annoncés.

Vous disposez d'un délai de 14 jours à compter de la réception de votre commande pour effectuer un retour, sous réserve que le produit soit dans son état d'origine et non porté.

Kollect facilite la résolution des litiges mais n'est pas directement responsable des problèmes de livraison imputables aux créateurs ou aux services de transport.`,
  },
  {
    title: '7. Propriété intellectuelle',
    content: `L'ensemble des éléments constituant la plateforme Kollect (logo, design, textes, images, code) sont la propriété exclusive de Kollect SN et sont protégés par les lois applicables en matière de propriété intellectuelle.

Les créateurs conservent la propriété intellectuelle de leurs créations publiées sur la plateforme. En publiant sur Kollect, ils accordent à la plateforme une licence non exclusive pour afficher et promouvoir leurs produits.`,
  },
  {
    title: '8. Limitation de responsabilité',
    content: `Kollect s'efforce de maintenir la disponibilité et la fiabilité de sa plateforme. Toutefois, la plateforme peut être temporairement indisponible pour maintenance ou en raison de circonstances indépendantes de notre volonté.

Kollect ne peut être tenu responsable des dommages indirects, pertes de profit ou préjudices découlant de l'utilisation de la plateforme, dans les limites permises par la loi sénégalaise applicable.`,
  },
  {
    title: '9. Droit applicable',
    content: `Les présentes CGU sont régies par le droit sénégalais. Tout litige relatif à leur interprétation ou à leur exécution sera soumis à la compétence exclusive des tribunaux compétents de Dakar, Sénégal.`,
  },
  {
    title: '10. Contact',
    content: `Pour toute question relative aux présentes conditions d'utilisation, vous pouvez nous contacter à :

Email : legal@kollect.sn
Adresse : Dakar, Sénégal

Notre équipe s'engage à répondre dans un délai de 5 jours ouvrés.`,
  },
];

export function TermsContent() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  return (
    <>
      {/* Hero */}
      <section
        style={{
          backgroundColor: '#0a0a0a',
          marginTop: 72,
          padding: '80px 40px 72px',
          borderRadius: '0 0 40px 40px',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: FONT_FAMILY_INTER,
        }}
      >
        <div aria-hidden style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse, rgba(255,59,48,0.10) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <style>{`
          @keyframes termsUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
          .terms-in { animation: termsUp 0.7s ease-out both; }
        `}</style>

        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className={visible ? 'terms-in' : ''} style={{ opacity: visible ? 1 : 0 }}>
            <p style={{
              fontSize: 11, fontWeight: 900, letterSpacing: '4px',
              textTransform: 'uppercase', color: '#FF3B30', margin: '0 0 20px',
            }}>
              Légal
            </p>
            <h1 style={{
              fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
              fontWeight: 900, letterSpacing: '-3px', lineHeight: 0.95,
              color: '#fff', textTransform: 'uppercase', margin: '0 0 24px',
            }}>
              Conditions d&apos;utilisation
            </h1>
            <p style={{
              fontSize: 14, color: 'rgba(255,255,255,0.35)',
              lineHeight: 1.6, margin: 0,
            }}>
              Dernière mise à jour : {LAST_UPDATED}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section
        style={{
          backgroundColor: '#fff',
          padding: '80px 40px 120px',
          fontFamily: FONT_FAMILY_INTER,
        }}
      >
        <div style={{
          maxWidth: 860,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}>
          {/* Intro note */}
          <div style={{
            padding: '20px 24px',
            backgroundColor: 'rgba(255,59,48,0.04)',
            border: '1px solid rgba(255,59,48,0.15)',
            borderRadius: 16,
            marginBottom: 56,
          }}>
            <p style={{
              fontSize: 14, lineHeight: 1.7,
              color: 'rgba(0,0,0,0.6)', margin: 0,
            }}>
              <strong style={{ color: '#FF3B30', fontWeight: 800 }}>Note importante.</strong>{' '}
              Ces conditions générales d&apos;utilisation régissent l&apos;accès et l&apos;utilisation de la plateforme Kollect. Nous vous encourageons à les lire attentivement.
            </p>
          </div>

          {/* Sections */}
          {SECTIONS.map((section, i) => (
            <div
              key={i}
              style={{
                borderTop: '1.5px solid rgba(0,0,0,0.07)',
                padding: '40px 0',
              }}
            >
              <h2 style={{
                fontSize: '1.1rem',
                fontWeight: 900,
                color: '#0a0a0a',
                letterSpacing: '-0.3px',
                lineHeight: 1.3,
                margin: '0 0 16px',
              }}>
                {section.title}
              </h2>
              <div style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: 'rgba(0,0,0,0.55)',
                whiteSpace: 'pre-line',
              }}>
                {section.content}
              </div>
            </div>
          ))}

          {/* Footer note */}
          <div style={{
            borderTop: '1.5px solid rgba(0,0,0,0.07)',
            paddingTop: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              backgroundColor: 'rgba(255,59,48,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.4)', margin: 0, lineHeight: 1.6 }}>
              Document mis à jour le {LAST_UPDATED}. En cas de modification substantielle, nous informerons les utilisateurs par email ou notification dans l&apos;application.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
