'use client';

import { useRef, useState, useEffect } from 'react';

const REASONS = [
  { value: 'brand', label: 'Je veux rejoindre Kollect en tant que marque' },
  { value: 'buyer', label: 'Question sur une commande / produit' },
  { value: 'bug', label: 'Signaler un bug ou problème technique' },
  { value: 'press', label: 'Presse & partenariat' },
  { value: 'other', label: 'Autre' },
];

const CHANNELS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
    label: 'Instagram',
    value: '@kollect.sn',
    href: 'https://instagram.com/kollect.sn',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    label: 'Email',
    value: 'hello@kollect.sn',
    href: 'mailto:hello@kollect.sn',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.17a8.16 8.16 0 0 0 4.77 1.52V7.25a4.85 4.85 0 0 1-1-.56z"/>
      </svg>
    ),
    label: 'TikTok',
    value: '@kollect.sn',
    href: 'https://tiktok.com/@kollect.sn',
  },
];

type FormState = 'idle' | 'loading' | 'success' | 'error';

export function ContactSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [formState, setFormState] = useState<FormState>('idle');
  const [fields, setFields] = useState({ name: '', email: '', reason: '', message: '' });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFields(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.name || !fields.email || !fields.message) return;
    setFormState('loading');
    // Simule un envoi — à connecter à votre backend / Resend / Formspree
    await new Promise(r => setTimeout(r, 1200));
    setFormState('success');
  };

  return (
    <section ref={ref} style={{ backgroundColor: '#fff', padding: '80px 40px 100px' }}>
      <style>{`
        @keyframes csUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .cs-in { animation: csUp 0.65s ease-out both; }
        .cs-input:focus { border-color: #0a0a0a !important; }
        .cs-submit:hover:not(:disabled) { background: #e0352b !important; }
        .cs-submit { transition: background 200ms ease; }
        .cs-channel:hover { border-color: rgba(0,0,0,0.2) !important; background: rgba(0,0,0,0.02) !important; }
        .cs-channel { transition: all 200ms ease; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80, alignItems: 'flex-start' }}
        className="contact-grid">

        {/* Left : infos + canaux */}
        <div className={visible ? 'cs-in' : ''} style={{ opacity: visible ? 1 : 0 }}>
          <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', color: '#FF3B30', margin: '0 0 16px' }}>
            Nous trouver
          </p>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 2.5vw, 2.4rem)',
            fontWeight: 900,
            letterSpacing: '-1.5px',
            color: '#0a0a0a',
            margin: '0 0 16px',
            textTransform: 'uppercase',
            lineHeight: 1.05,
          }}>
            Plusieurs façons de nous joindre.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(0,0,0,0.5)', lineHeight: 1.7, margin: '0 0 40px' }}>
            On répond généralement en moins de 24h en semaine. Pour les demandes urgentes, Instagram est le canal le plus rapide.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CHANNELS.map(ch => (
              <a
                key={ch.label}
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-channel"
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 20px',
                  borderRadius: 16,
                  border: '1.5px solid rgba(0,0,0,0.08)',
                  textDecoration: 'none',
                  backgroundColor: 'rgba(0,0,0,0.01)',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  backgroundColor: '#0a0a0a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', flexShrink: 0,
                }}>
                  {ch.icon}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)' }}>
                    {ch.label}
                  </p>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0a0a0a' }}>
                    {ch.value}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Right : formulaire */}
        <div className={visible ? 'cs-in' : ''} style={{ opacity: visible ? 1 : 0, animationDelay: '0.12s' }}>
          {formState === 'success' ? (
            <div style={{
              padding: '56px 40px',
              backgroundColor: '#0a0a0a',
              borderRadius: 24,
              textAlign: 'center',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                backgroundColor: 'rgba(255,59,48,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 12px', letterSpacing: '-1px', textTransform: 'uppercase' }}>
                Message envoyé !
              </h3>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6 }}>
                On revient vers toi dans les 24h. En attendant, suis-nous sur Instagram pour rester dans la boucle.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{
              backgroundColor: '#0a0a0a',
              borderRadius: 24,
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
              <p style={{ fontSize: 13, fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
                Envoyer un message
              </p>

              {/* Name + Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="contact-row">
                {[
                  { key: 'name' as const, label: 'Ton nom', type: 'text', placeholder: 'Moussa Diallo' },
                  { key: 'email' as const, label: 'Ton email', type: 'email', placeholder: 'moussa@exemple.com' },
                ].map(f => (
                  <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                      {f.label}
                    </span>
                    <input
                      type={f.type}
                      value={fields[f.key]}
                      onChange={set(f.key)}
                      placeholder={f.placeholder}
                      required
                      className="cs-input"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        border: '1.5px solid rgba(255,255,255,0.1)',
                        borderRadius: 12,
                        padding: '12px 14px',
                        color: '#fff',
                        fontSize: 14,
                        outline: 'none',
                        transition: 'border-color 200ms ease',
                      }}
                    />
                  </label>
                ))}
              </div>

              {/* Reason */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  Sujet
                </span>
                <select
                  value={fields.reason}
                  onChange={set('reason')}
                  className="cs-input"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: '12px 14px',
                    color: fields.reason ? '#fff' : 'rgba(255,255,255,0.3)',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 200ms ease',
                    cursor: 'pointer',
                  }}
                >
                  <option value="" disabled style={{ color: '#000' }}>Choisir un sujet…</option>
                  {REASONS.map(r => (
                    <option key={r.value} value={r.value} style={{ color: '#000' }}>{r.label}</option>
                  ))}
                </select>
              </label>

              {/* Message */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  Message
                </span>
                <textarea
                  value={fields.message}
                  onChange={set('message')}
                  placeholder="Dis-nous ce que tu as en tête…"
                  required
                  rows={5}
                  className="cs-input"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: '12px 14px',
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    transition: 'border-color 200ms ease',
                  }}
                />
              </label>

              <button
                type="submit"
                disabled={formState === 'loading'}
                className="cs-submit"
                style={{
                  marginTop: 4,
                  padding: '14px',
                  backgroundColor: '#FF3B30',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: formState === 'loading' ? 'not-allowed' : 'pointer',
                  opacity: formState === 'loading' ? 0.6 : 1,
                  letterSpacing: '0.5px',
                }}
              >
                {formState === 'loading' ? 'Envoi en cours…' : 'Envoyer le message →'}
              </button>

              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: 0, textAlign: 'center' }}>
                Aucun spam. Tes données ne sont jamais revendues.
              </p>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .contact-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
