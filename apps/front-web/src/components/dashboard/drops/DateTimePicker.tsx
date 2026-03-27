/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { Ic, I } from './wizard-icons';

export function DateTimePicker({ value, onChange, minDate }: {
  value: Date; onChange: (d: Date) => void; minDate?: Date;
}) {
  const [view, setView] = useState(() => { const d = new Date(value); d.setDate(1); return d; });

  const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
  const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const today = new Date(); today.setHours(0,0,0,0);

  const prevMonth = () => setView(v => { const d = new Date(v); d.setMonth(d.getMonth()-1); return d; });
  const nextMonth = () => setView(v => { const d = new Date(v); d.setMonth(d.getMonth()+1); return d; });

  const year = view.getFullYear(), month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells: Array<{ day: number; cur: boolean; date: Date }> = [];
  for (let i = offset-1; i >= 0; i--) {
    cells.push({ day: daysInPrev-i, cur: false, date: new Date(year, month-1, daysInPrev-i) });
  }
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, cur: true, date: new Date(year, month, i) });
  while (cells.length % 7 !== 0) {
    const n = cells.length - daysInMonth - offset + 1;
    cells.push({ day: new Date(year, month+1, n).getDate(), cur: false, date: new Date(year, month+1, n) });
  }

  const hh = value.getHours();
  const mm = value.getMinutes();

  const adjustH = (delta: number) => { const nd = new Date(value); nd.setHours(Math.max(0, Math.min(23, hh+delta))); onChange(nd); };
  const adjustM = (delta: number) => { const nd = new Date(value); nd.setMinutes(Math.max(0, Math.min(59, mm+delta))); onChange(nd); };

  const QUICK = [
    { label:'Matin', time:'09:00', h:9,  m:0 },
    { label:'Midi',  time:'12:00', h:12, m:0 },
    { label:'Soir',  time:'18:00', h:18, m:0 },
    { label:'Nuit',  time:'21:00', h:21, m:0 },
  ];

  const navBtnStyle = {
    width:34, height:34, borderRadius:10, border:'1.5px solid rgba(0,0,0,0.09)',
    background:'rgba(0,0,0,0.02)', display:'flex', alignItems:'center', justifyContent:'center',
    cursor:'pointer', color:'rgba(0,0,0,0.55)',
  };
  const arrowBtnStyle = {
    width:40, height:40, borderRadius:12, border:'1.5px solid rgba(0,0,0,0.09)',
    background:'rgba(0,0,0,0.02)', display:'flex', alignItems:'center', justifyContent:'center',
    cursor:'pointer', transition:'background 0.12s',
  };

  return (
    <div style={{ background:'#fff', borderRadius:24, border:'1.5px solid rgba(0,0,0,0.08)', boxShadow:'0 4px 32px rgba(0,0,0,0.08)', overflow:'hidden', display:'flex', flexDirection:'column' }}>

      {/* ── Row: Calendrier | Heure ── */}
      <div style={{ display:'flex', alignItems:'stretch' }}>

        {/* ── Gauche : Calendrier ── */}
        <div style={{ flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 14px 10px', borderBottom:'1px solid rgba(0,0,0,0.05)' }}>
            <button type="button" onClick={prevMonth} style={navBtnStyle}><Ic d={I.left} size={13} sw={2.2} /></button>
            <span style={{ fontSize:14, fontWeight:800, color:'#0A0A0A', letterSpacing:'-0.3px' }}>{MONTHS[month]} {year}</span>
            <button type="button" onClick={nextMonth} style={navBtnStyle}><Ic d={I.right} size={13} sw={2.2} /></button>
          </div>
          <div style={{ padding:'10px 12px 12px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 34px)', justifyContent:'center', marginBottom:2 }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign:'center', fontSize:10, fontWeight:700, color:'rgba(0,0,0,0.28)', letterSpacing:'0.2px', paddingBottom:6 }}>{d}</div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 34px)', gap:2, justifyContent:'center' }}>
              {cells.map((cell, ci) => {
                const cellDate = new Date(cell.date); cellDate.setHours(0,0,0,0);
                const isDisabled = minDate ? cellDate < minDate : false;
                const isSel = value.toDateString() === cellDate.toDateString();
                const isToday = today.toDateString() === cellDate.toDateString();
                return (
                  <button key={ci} type="button" disabled={isDisabled}
                    onClick={() => { const nd = new Date(value); nd.setFullYear(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate()); onChange(nd); }}
                    style={{
                      width:34, height:34, border:'none', borderRadius:'50%', position:'relative',
                      background: isSel ? '#FF3B30' : 'transparent',
                      color: isSel ? '#fff' : isToday ? '#FF3B30' : !cell.cur ? 'rgba(0,0,0,0.18)' : isDisabled ? 'rgba(0,0,0,0.13)' : 'rgba(0,0,0,0.72)',
                      fontSize:12.5, fontWeight: isSel || isToday ? 800 : 500,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      boxShadow: isSel ? '0 3px 10px rgba(255,59,48,0.32)' : 'none',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      transition:'background 0.12s, color 0.12s', fontFamily:'inherit',
                    }}>
                    {cell.day}
                    {isToday && !isSel && (
                      <span style={{ position:'absolute', bottom:3, left:'50%', transform:'translateX(-50%)', width:3, height:3, borderRadius:'50%', background:'#FF3B30' }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Séparateur vertical ── */}
        <div style={{ width:1, background:'rgba(0,0,0,0.06)', flexShrink:0 }} />

        {/* ── Droite : Heure ── */}
        <div style={{ flex:1, padding:'14px 16px', display:'flex', flexDirection:'column', justifyContent:'center', gap:14, minWidth:0 }}>
          <div style={{ fontSize:10, fontWeight:700, color:'rgba(0,0,0,0.28)', letterSpacing:'0.6px' }}>HEURE</div>

          {/* Presets 2×2 */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
            {QUICK.map(q => {
              const active = hh === q.h && mm === q.m;
              return (
                <button key={q.label} type="button"
                  onClick={() => { const nd = new Date(value); nd.setHours(q.h, q.m); onChange(nd); }}
                  style={{
                    padding:'6px 4px', borderRadius:10, border:'1.5px solid', fontFamily:'inherit',
                    borderColor: active ? '#FF3B30' : 'rgba(0,0,0,0.09)',
                    background: active ? 'rgba(255,59,48,0.07)' : 'rgba(0,0,0,0.02)',
                    color: active ? '#FF3B30' : 'rgba(0,0,0,0.5)',
                    fontSize:11.5, fontWeight:700, cursor:'pointer', transition:'all 0.12s', textAlign:'center',
                  }}>
                  {q.time}
                </button>
              );
            })}
          </div>

          {/* Contrôles H : M */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <button type="button" onClick={() => adjustH(1)} style={arrowBtnStyle}><Ic d="M18 15l-6-6-6 6" size={13} sw={2.5} stroke="rgba(0,0,0,0.5)" /></button>
              <div style={{ width:48, textAlign:'center', fontSize:30, fontWeight:900, color:'#0A0A0A', letterSpacing:'-1px', lineHeight:1 }}>{hh.toString().padStart(2,'0')}</div>
              <button type="button" onClick={() => adjustH(-1)} style={arrowBtnStyle}><Ic d="M6 9l6 6 6-6" size={13} sw={2.5} stroke="rgba(0,0,0,0.5)" /></button>
            </div>
            <div style={{ fontSize:28, fontWeight:900, color:'rgba(0,0,0,0.15)', lineHeight:1, userSelect:'none' }}>:</div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <button type="button" onClick={() => adjustM(5)} style={arrowBtnStyle}><Ic d="M18 15l-6-6-6 6" size={13} sw={2.5} stroke="rgba(0,0,0,0.5)" /></button>
              <div style={{ width:48, textAlign:'center', fontSize:30, fontWeight:900, color:'#0A0A0A', letterSpacing:'-1px', lineHeight:1 }}>{mm.toString().padStart(2,'0')}</div>
              <button type="button" onClick={() => adjustM(-5)} style={arrowBtnStyle}><Ic d="M6 9l6 6 6-6" size={13} sw={2.5} stroke="rgba(0,0,0,0.5)" /></button>
            </div>
          </div>
          <p style={{ textAlign:'center', fontSize:10.5, color:'rgba(0,0,0,0.28)', fontWeight:500, margin:0 }}>±1h · ±5min</p>
        </div>
      </div>

      {/* ── Footer récap pleine largeur ── */}
      <div style={{ borderTop:'1px solid rgba(0,0,0,0.06)', padding:'11px 14px', background:'linear-gradient(135deg, rgba(255,59,48,0.04) 0%, transparent 100%)', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:30, height:30, borderRadius:9, background:'rgba(255,59,48,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Ic d={I.clock} size={13} stroke="#FF3B30" sw={1.8} />
        </div>
        <div>
          <div style={{ fontSize:12.5, fontWeight:800, color:'#0A0A0A', letterSpacing:'-0.2px' }}>
            {value.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).replace(/^\w/, c => c.toUpperCase())}
          </div>
          <div style={{ fontSize:11.5, color:'rgba(0,0,0,0.4)', fontWeight:600, marginTop:1 }}>
            Lancement à {hh.toString().padStart(2,'0')}:{mm.toString().padStart(2,'0')}
          </div>
        </div>
      </div>
    </div>
  );
}
