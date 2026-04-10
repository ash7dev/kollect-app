'use client';

import { useEffect, useState } from 'react';
import { FONT_FAMILY_INTER } from '@/styles/typography';

const LAST_UPDATED = '9 avril 2026';

const SECTIONS = [
  {
    title: '1. Identité du responsable du traitement',
    content: `Kollect SN est le responsable du traitement de vos données personnelles dans le cadre de l'utilisation de la plateforme Kollect.

Contact du délégué à la protection des données : privacy@kollect.sn`,
  },
  {
    title: '2. Données collectées',
    content: `Lors de votre inscription et utilisation de Kollect, nous collectons les données suivantes :

Données d'identification : nom, prénom, adresse email, numéro de téléphone.
Données de profil : photo de profil, préférences de marques et de style.
Données de transaction : historique des commandes, adresses de livraison, informations de paiement (tokenisées, jamais stockées en clair).
Données de navigation : pages visitées, clics, durée des sessions, adresse IP, type d'appareil et navigateur.
Données de communication : messages échangés avec notre support client.`,
  },
  {
    title: '3. Finalités du traitement',
    content: `Vos données personnelles sont utilisées pour les finalités suivantes :

• Création et gestion de votre compte utilisateur
• Traitement et suivi de vos commandes
• Personnalisation de votre expérience (recommandations de produits, alertes de drops)
• Communication transactionnelle (confirmations de commande, notifications de livraison)
• Communication marketing (avec votre consentement)
• Amélioration de nos services et analyses statistiques
• Détection et prévention des fraudes
• Respect de nos obligations légales`,
  },
  {
    title: '4. Base légale du traitement',
    content: `Nous traitons vos données sur les bases légales suivantes :

Exécution du contrat : pour traiter vos commandes et gérer votre compte.
Intérêt légitime : pour améliorer nos services, prévenir les fraudes et assurer la sécurité de la plateforme.
Consentement : pour les communications marketing et les cookies non essentiels. Vous pouvez retirer votre consentement à tout moment.
Obligation légale : pour respecter nos obligations fiscales et réglementaires.`,
  },
  {
    title: '5. Partage des données',
    content: `Vos données personnelles peuvent être partagées avec :

Les créateurs (vendeurs) : pour la bonne exécution de vos commandes (nom, adresse de livraison, numéro de téléphone).
Nos prestataires techniques : hébergement, paiement, service client, analytics — tous soumis à des engagements contractuels de confidentialité.
Les autorités compétentes : uniquement sur demande légale.

Vos données ne sont jamais vendues à des tiers à des fins commerciales.`,
  },
  {
    title: '6. Durée de conservation',
    content: `Vos données sont conservées pour les durées suivantes :

• Données de compte : jusqu'à la suppression de votre compte, puis 3 ans pour des raisons légales
• Données de transaction : 10 ans (obligations comptables et fiscales)
• Données de navigation : 13 mois maximum
• Données marketing : jusqu'au retrait de votre consentement

À l'expiration de ces délais, vos données sont supprimées ou anonymisées de manière sécurisée.`,
  },
  {
    title: '7. Vos droits',
    content: `Conformément à la réglementation applicable, vous disposez des droits suivants :

Droit d'accès : obtenir une copie de vos données personnelles.
Droit de rectification : corriger des données inexactes ou incomplètes.
Droit à l'effacement : demander la suppression de vos données ("droit à l'oubli").
Droit à la portabilité : recevoir vos données dans un format lisible par machine.
Droit d'opposition : vous opposer au traitement de vos données à des fins marketing.
Droit à la limitation : demander la suspension temporaire du traitement.

Pour exercer ces droits, contactez-nous à privacy@kollect.sn. Nous vous répondrons dans un délai de 30 jours.`,
  },
  {
    title: '8. Cookies et traceurs',
    content: `Kollect utilise des cookies pour améliorer votre expérience et analyser l'utilisation de la plateforme.

Cookies essentiels : nécessaires au fonctionnement de la plateforme (authentification, panier). Ils ne nécessitent pas votre consentement.
Cookies analytiques : mesure d'audience anonymisée pour améliorer nos services. Nécessitent votre consentement.
Cookies marketing : publicités ciblées. Nécessitent votre consentement.

Vous pouvez gérer vos préférences de cookies via notre bandeau de consentement ou les paramètres de votre navigateur.`,
  },
  {
    title: '9. Sécurité des données',
    content: `Kollect met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, altération, divulgation ou destruction :

• Chiffrement des données sensibles (HTTPS, chiffrement en base)
• Authentification à deux facteurs disponible pour les comptes créateurs
• Accès aux données restreint aux seuls employés qui en ont besoin
• Audits de sécurité réguliers`,
  },
  {
    title: '10. Contact et réclamations',
    content: `Pour toute question relative à cette politique ou pour exercer vos droits :

Email : privacy@kollect.sn
Adresse : Dakar, Sénégal

Si vous estimez que vos droits ne sont pas respectés, vous pouvez également déposer une réclamation auprès de la Commission de Protection des Données Personnelles (CDP) du Sénégal.`,
  },
];

export function PrivacyContent() {
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
          @keyframes privacyUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
          .privacy-in { animation: privacyUp 0.7s ease-out both; }
        `}</style>

        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className={visible ? 'privacy-in' : ''} style={{ opacity: visible ? 1 : 0 }}>
            <p style={{
              fontSize: 11, fontWeight: 900, letterSpacing: '4px',
              textTransform: 'uppercase', color: '#FF3B30', margin: '0 0 20px',
            }}>
              Légal
            </p>
            <h1 style={{
              fontSize: 'clamp(2rem, 5.5vw, 4.2rem)',
              fontWeight: 900, letterSpacing: '-3px', lineHeight: 0.95,
              color: '#fff', textTransform: 'uppercase', margin: '0 0 24px',
            }}>
              Politique de<br />confidentialité
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
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          {/* Intro */}
          <div style={{
            padding: '20px 24px',
            backgroundColor: 'rgba(255,59,48,0.04)',
            border: '1px solid rgba(255,59,48,0.15)',
            borderRadius: 16,
            marginBottom: 56,
          }}>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(0,0,0,0.6)', margin: 0 }}>
              <strong style={{ color: '#FF3B30', fontWeight: 800 }}>Votre vie privée compte.</strong>{' '}
              Chez Kollect, nous ne vendons jamais vos données. Cette politique explique de manière transparente comment nous collectons, utilisons et protégeons vos informations personnelles.
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
                fontSize: '1.1rem', fontWeight: 900,
                color: '#0a0a0a', letterSpacing: '-0.3px',
                lineHeight: 1.3, margin: '0 0 16px',
              }}>
                {section.title}
              </h2>
              <div style={{
                fontSize: 15, lineHeight: 1.8,
                color: 'rgba(0,0,0,0.55)', whiteSpace: 'pre-line',
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.4)', margin: 0, lineHeight: 1.6 }}>
              Document mis à jour le {LAST_UPDATED}. Pour exercer vos droits :{' '}
              <a href="mailto:privacy@kollect.sn" style={{ color: '#FF3B30', fontWeight: 700, textDecoration: 'none' }}>
                privacy@kollect.sn
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
