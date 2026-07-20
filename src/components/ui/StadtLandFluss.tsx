'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Room, DetailEntry, ChatMessage } from '@/lib/slf';

// ── Types ─────────────────────────────────────────────────────────────────────

type Screen = 'home' | Room['phase'];

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_CATS = [
  'Stadt','Land','Fluss','Name','Tier','Beruf','Pflanze',
  'Film','Automarke','Lebensmittel','Sportart','Kleidung','Farbe','Musikgruppe',
];
const DEFAULT_CATS = ['Stadt','Land','Fluss','Name','Tier','Beruf','Pflanze'];

const PTS_COLOR: Record<number, string> = { 20: '#f0c040', 10: '#e8f5f2', 5: '#666', 0: '#c41920' };
const WHY_LABEL: Record<string, string> = {
  einziger:    'Einziger · 20',
  einzigartig: 'Einzigartig · 10',
  gleich:      'Gleich · 5',
  leer:        '—',
  abgelehnt:   'Abgelehnt',
};

// ── Konami Hook ───────────────────────────────────────────────────────────────

const SECRET = 'stinkt'.split('');

export function useKonami(callback: () => void) {
  const seq = useRef<string[]>([]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1) return;
      seq.current = [...seq.current, e.key.toLowerCase()].slice(-SECRET.length);
      if (seq.current.join('') === SECRET.join('')) {
        callback();
        seq.current = [];
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [callback]);
}

// ── API ───────────────────────────────────────────────────────────────────────

async function api(action: string, data: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
  try {
    const r = await fetch('/api/slf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data }),
    });
    return await r.json();
  } catch {
    return { err: 'Verbindungsfehler' };
  }
}

// ── Timer Hook ────────────────────────────────────────────────────────────────

function useTimer(roundStart: number | null, timerSec: number) {
  const [rem, setRem] = useState(timerSec);
  useEffect(() => {
    if (!roundStart) return;
    const tick = () => setRem(Math.max(0, timerSec - (Math.floor(Date.now() / 1000) - roundStart)));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [roundStart, timerSec]);
  return rem;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function countPending(room: Room, me: string): number {
  let n = 0;
  for (const cat of room.categories) {
    for (const p of Object.keys(room.players)) {
      if (p === me) continue;
      const ans = (room.answers?.[p]?.[cat] ?? '').trim();
      if (!ans) continue;
      if (room.votes?.[cat]?.[p]?.[me] === undefined) n++;
    }
  }
  return n;
}

function isCatDone(room: Room, cat: string, me: string): boolean {
  for (const p of Object.keys(room.players)) {
    if (p === me) continue;
    const ans = (room.answers?.[p]?.[cat] ?? '').trim();
    if (!ans) continue;
    if (room.votes?.[cat]?.[p]?.[me] === undefined) return false;
  }
  return true;
}

function sortedPlayers(players: Room['players']): [string, Room['players'][string]][] {
  return Object.entries(players).sort((a, b) => b[1].score - a[1].score);
}

// ── Main Overlay ──────────────────────────────────────────────────────────────

interface Props { onClose: () => void }

export function StadtLandFlussOverlay({ onClose }: Props) {
  const [me, setMe]           = useState<string | null>(null);
  const [code, setCode]       = useState<string | null>(null);
  const [room, setRoom]       = useState<Room | null>(null);
  const [local, setLocal]     = useState<Record<string, string>>({});
  const [voteCat, setVoteCat] = useState(0);
  const [chatOpen, setChatOpen]       = useState(false);
  const [seenMsgCount, setSeenMsgCount] = useState(0);

  // Close on ESC
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Polling
  useEffect(() => {
    if (!code || !me) return;
    const poll = async () => {
      const r = await api('poll', { code, name: me });
      if (!r.err) setRoom(r as unknown as Room);
    };
    poll();
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, [code, me]);

  // Reset local on new round
  useEffect(() => {
    if (room?.phase === 'playing') {
      setLocal(Object.fromEntries(room.categories.map(c => [c, ''])));
      setVoteCat(0);
    }
    if (room?.phase === 'voting') setVoteCat(0);
  }, [room?.phase, room?.round]);

  // Mark chat messages as seen when panel is open
  const otherMsgs = (room?.chat ?? []).filter(m => m.from !== me!);
  const unread    = Math.max(0, otherMsgs.length - seenMsgCount);
  useEffect(() => {
    if (chatOpen) setSeenMsgCount(otherMsgs.length);
  }, [chatOpen, otherMsgs.length]);

  async function leaveRoom() {
    if (code && me) await api('leave', { code, name: me });
    window.location.reload();
  }

  const screen: Screen = !room ? 'home' : room.phase;
  const pending = room && me ? countPending(room, me) : 0;

  // Derive shared topbar content
  let tbLeft = 'Stadt · Land · Fluss';
  let tbRight: React.ReactNode = null;
  if (screen === 'voting') {
    tbLeft = `Abstimmung · Runde ${room?.round}`;
    tbRight = (
      <span style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:11, letterSpacing:'.15em',
        color: pending === 0 ? '#34C9A8' : '#f0c040', textTransform:'uppercase' }}>
        {pending === 0 ? '✓ Fertig' : `${pending} ausstehend`}
      </span>
    );
  } else if (screen === 'scoring') {
    tbLeft = `Abrechnung · Runde ${room?.round}/${room?.rounds}`;
    tbRight = (
      <span style={{ fontFamily:'var(--ff-display)', fontWeight:800, fontSize:20,
        letterSpacing:'.1em', color:'#fff', lineHeight:1 }}>{room?.letter}</span>
    );
  } else if (screen === 'playing') {
    tbRight = (
      <span style={{ fontSize:11, color:'#444', letterSpacing:'.08em' }}>
        Runde {room?.round}/{room?.rounds}
      </span>
    );
  } else if (screen === 'gameover') {
    tbLeft = 'Spielende';
  }

  const navBtn: React.CSSProperties = {
    background: 'rgba(255,255,255,.06)',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,.1)',
    color: '#888', width: 32, height: 32, borderRadius: 4,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'all .12s',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#0c0c0e',
        color: '#e8e4d8',
        fontFamily: 'var(--ff-mono), monospace',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Shared topbar — always visible when in a room, home gets floating X */}
      {room ? (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'8px 16px', borderBottom:'1px solid #1e1e26', background:'#111115',
          position:'sticky', top:0, zIndex:200, gap:12 }}>
          <span style={tbBrand}>{tbLeft}</span>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            {tbRight && <span style={{ marginRight:4 }}>{tbRight}</span>}
            {screen === 'lobby' && (
              <button style={{ ...btn('ghost'), padding:'4px 10px', fontSize:10 }} onClick={leaveRoom}>
                Verlassen
              </button>
            )}
            {/* Chat toggle */}
            <button
              onClick={() => setChatOpen(v => !v)}
              aria-label="Chat"
              style={{ ...navBtn, background: chatOpen ? '#34C9A8' : 'rgba(255,255,255,.06)',
                borderColor: chatOpen ? '#34C9A8' : 'rgba(255,255,255,.1)',
                color: chatOpen ? '#0c0c0e' : '#888', position: 'relative' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {unread > 0 && !chatOpen && (
                <span style={{ position:'absolute', top:-4, right:-4, background:'#c41920',
                  color:'#fff', borderRadius:'50%', width:14, height:14, fontSize:9,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'var(--ff-display)', fontWeight:700 }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
            {/* Close */}
            <button onClick={onClose} aria-label="Schließen" style={{ ...navBtn, fontSize:16 }}>✕</button>
          </div>
        </div>
      ) : (
        /* Home screen: floating X */
        <button onClick={onClose} aria-label="Schließen" style={{
          position: 'fixed', top: 16, right: 16, zIndex: 10001,
          ...navBtn, width:36, height:36,
        }}>✕</button>
      )}

      <AnimatePresence mode="wait">
        {screen === 'home'     && <HomeScreen key="home" onJoin={(c,n)=>{ setCode(c); setMe(n); }} />}
        {room && screen === 'lobby'    && <LobbyScreen key="lobby" room={room} me={me!} code={code!} />}
        {room && screen === 'playing'  && <PlayingScreen key="playing" room={room} me={me!} code={code!} local={local} setLocal={setLocal} />}
        {room && screen === 'voting'   && <VotingScreen key="voting" room={room} me={me!} code={code!} cat={voteCat} setCat={setVoteCat} />}
        {room && screen === 'scoring'  && <ScoringScreen key="scoring" room={room} me={me!} code={code!} />}
        {room && screen === 'gameover' && <GameOverScreen key="gameover" room={room} me={me!} code={code!} />}
      </AnimatePresence>

      {room && me && code && <ChatPanel room={room} me={me} code={code} open={chatOpen} />}
    </motion.div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const page: React.CSSProperties = {
  minHeight: '100vh', display: 'flex', flexDirection: 'column',
  justifyContent: 'center', padding: '48px 28px', maxWidth: 580, margin: '0 auto',
};
const eyebrow: React.CSSProperties = {
  fontFamily: 'var(--ff-display)', fontSize: 10, fontWeight: 700,
  letterSpacing: '.32em', color: '#34C9A8', textTransform: 'uppercase', marginBottom: 12, display: 'block',
};
const h1: React.CSSProperties = {
  fontFamily: 'var(--ff-display)', fontWeight: 800, letterSpacing: '-.03em',
  fontSize: 'clamp(52px,14vw,100px)', lineHeight: .88, color: '#fff',
  textTransform: 'uppercase', marginBottom: 20,
};
const rule: React.CSSProperties = { width: 40, height: 3, background: '#34C9A8', marginBottom: 28 };
const label: React.CSSProperties = {
  fontFamily: 'var(--ff-display)', fontSize: 9, fontWeight: 700,
  letterSpacing: '.28em', color: '#555', textTransform: 'uppercase', display: 'block', marginBottom: 8,
};
const input: React.CSSProperties = {
  width: '100%', fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 20,
  letterSpacing: '.03em', textTransform: 'uppercase',
  background: '#181820',
  borderWidth: '1px 1px 2px 1px', borderStyle: 'solid', borderColor: '#2a2a35',
  color: '#e8e4d8',
  padding: '13px 16px', outline: 'none', transition: 'border-color .12s',
};
const btn = (variant: 'primary'|'ghost'|'yes'|'no'): React.CSSProperties => ({
  fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 12, letterSpacing: '.14em',
  textTransform: 'uppercase', cursor: 'pointer', transition: 'all .12s',
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: variant === 'yes' || variant === 'no' ? '8px 16px' : '12px 24px',
  background: variant === 'primary' ? '#34C9A8' : 'transparent',
  color: variant === 'primary' ? '#0c0c0e'
       : variant === 'yes'     ? '#4a9e6a'
       : variant === 'no'      ? '#c41920'
       : '#666',
  outline: 'none',
  borderWidth: 1, borderStyle: 'solid',
  borderColor: variant === 'ghost' ? '#2a2a35'
             : variant === 'yes'   ? '#4a9e6a'
             : variant === 'no'    ? '#c41920'
             : 'transparent',
});
const chip = (on: boolean): React.CSSProperties => ({
  fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 11, letterSpacing: '.1em',
  textTransform: 'uppercase', padding: '6px 13px', cursor: 'pointer', transition: 'all .12s',
  background: on ? '#34C9A8' : 'transparent', border: `1px solid ${on ? '#34C9A8' : '#2a2a35'}`,
  color: on ? '#0c0c0e' : '#555',
});
const topbar: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '11px 18px', borderBottom: '1px solid #1e1e26',
  background: '#111115', position: 'sticky', top: 0, zIndex: 10,
};
const tbBrand: React.CSSProperties = {
  fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 12,
  letterSpacing: '.15em', textTransform: 'uppercase', color: '#34C9A8',
};
const tbMeta: React.CSSProperties = { fontSize: 11, color: '#444', letterSpacing: '.08em', paddingRight: 88 };

function FadeIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
      transition={{ duration: .3 }} style={{ flex: 1 }}>
      {children}
    </motion.div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────

function HomeScreen({ onJoin }: { onJoin: (code: string, name: string) => void }) {
  const [name, setName]     = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [cats, setCats]       = useState([...DEFAULT_CATS]);
  const [rounds, setRounds]   = useState(5);
  const [timer, setTimer]     = useState(60);
  const [tab, setTab]         = useState<'create'|'join'>('create');
  const [err, setErr]         = useState('');
  const [busy, setBusy]       = useState(false);
  const [customInput, setCustomInput] = useState('');

  function addCustomCat() {
    const val = customInput.trim();
    if (!val || cats.includes(val)) { setCustomInput(''); return; }
    setCats(prev => [...prev, val]);
    setCustomInput('');
  }

  async function create() {
    if (!name.trim()) { setErr('Name eingeben'); return; }
    if (cats.length < 3) { setErr('Min. 3 Kategorien'); return; }
    setBusy(true); setErr('');
    const r = await api('create', { name: name.trim(), cats, rounds, timer });
    if (r.err) { setErr(r.err as string); setBusy(false); return; }
    onJoin(r.code as string, r.name as string);
  }

  async function join() {
    if (!name.trim())     { setErr('Name eingeben'); return; }
    if (!joinCode.trim()) { setErr('Code eingeben'); return; }
    setBusy(true); setErr('');
    const r = await api('join', { name: name.trim(), code: joinCode.trim() });
    if (r.err) { setErr(r.err as string); setBusy(false); return; }
    onJoin(r.code as string, r.name as string);
  }

  function toggleCat(c: string) {
    setCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }

  return (
    <FadeIn>
      <div style={page}>
        <span style={eyebrow}>Easter Egg · Minispiel</span>
        <h1 style={h1}>Stadt<br/>Land<br/>Fluss</h1>
        <div style={rule} />

        {/* Name */}
        <div style={{ marginBottom: 24 }}>
          <label style={label}>Dein Name</label>
          <input style={input} placeholder="Name …" value={name}
            onChange={e => { setName(e.target.value); setErr(''); }}
            onKeyDown={e => e.key === 'Enter' && (tab === 'join' ? join() : create())} />
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', border:'1px solid #2a2a35', marginBottom:24 }}>
          {(['create','join'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              ...btn(tab===t ? 'primary' : 'ghost'),
              flex:1, justifyContent:'center', borderRadius:0,
              borderWidth: t==='create' ? '0 1px 0 0' : 0,
              borderStyle: 'solid', borderColor: '#2a2a35',
              background: tab===t ? '#34C9A8' : 'transparent',
              color: tab===t ? '#0c0c0e' : '#555', padding:'12px 0',
            }}>
              {t === 'create' ? 'Raum erstellen' : 'Beitreten'}
            </button>
          ))}
        </div>

        {tab === 'join' && (
          <div>
            <label style={label}>Raum-Code</label>
            <input style={{ ...input, letterSpacing:'.2em', fontSize:24 }} placeholder="ABCD"
              maxLength={4} value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && join()} />
            {err && <p style={{ fontSize:12, color:'#c41920', marginTop:8 }}>{err}</p>}
            <div style={{ marginTop:16 }}>
              <button style={btn('primary')} onClick={join} disabled={busy}>
                {busy ? 'Beitreten …' : 'Beitreten →'}
              </button>
            </div>
          </div>
        )}

        {tab === 'create' && (
          <div>
            <label style={{ ...label, marginBottom:10 }}>Kategorien</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
              {ALL_CATS.map(c => (
                <button key={c} style={chip(cats.includes(c))} onClick={() => toggleCat(c)}>{c}</button>
              ))}
              {cats.filter(c => !ALL_CATS.includes(c)).map(c => (
                <button key={c} style={{ ...chip(true), position:'relative', paddingRight:28 }}
                  onClick={() => setCats(prev => prev.filter(x => x !== c))}>
                  {c}
                  <span style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)',
                    fontSize:10, opacity:.7 }}>✕</span>
                </button>
              ))}
            </div>
            {/* Custom category input */}
            <div style={{ display:'flex', gap:0, marginBottom:16 }}>
              <input
                style={{ ...input, fontSize:14, padding:'10px 14px', flex:1,
                  borderWidth:'1px 0 2px 1px', textTransform:'uppercase' }}
                placeholder="Eigene Kategorie …"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomCat()}
              />
              <button style={{ ...btn('primary'), padding:'10px 16px', fontSize:11,
                borderWidth:0, flexShrink:0 }} onClick={addCustomCat}>
                + Hinzufügen
              </button>
            </div>

            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:16 }}>
              <div>
                <label style={label}>Runden</label>
                <select style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:13,
                  letterSpacing:'.08em', textTransform:'uppercase', background:'#181820',
                  border:'1px solid #2a2a35', color:'#e8e4d8', padding:'9px 12px', cursor:'pointer', outline:'none' }}
                  value={rounds} onChange={e => setRounds(+e.target.value)}>
                  {[3,5,8,10].map(n => <option key={n} value={n}>{n} Runden</option>)}
                </select>
              </div>
              <div>
                <label style={label}>Timer</label>
                <select style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:13,
                  letterSpacing:'.08em', textTransform:'uppercase', background:'#181820',
                  border:'1px solid #2a2a35', color:'#e8e4d8', padding:'9px 12px', cursor:'pointer', outline:'none' }}
                  value={timer} onChange={e => setTimer(+e.target.value)}>
                  {[30,45,60,90,120].map(n => <option key={n} value={n}>{n}s</option>)}
                </select>
              </div>
            </div>
            {err && <p style={{ fontSize:12, color:'#c41920', marginBottom:12 }}>{err}</p>}
            <button style={btn('primary')} onClick={create} disabled={busy || !name.trim()}>
              {busy ? 'Wird erstellt …' : 'Raum erstellen →'}
            </button>
          </div>
        )}
      </div>
    </FadeIn>
  );
}

// ── LOBBY ─────────────────────────────────────────────────────────────────────

function LobbyScreen({ room, me, code }: { room: Room; me: string; code: string }) {
  const [cats, setCats]       = useState(room.categories);
  const [rounds, setRounds]   = useState(room.rounds);
  const [timer, setTimer]     = useState(room.timer);
  const [err, setErr]         = useState('');
  const [busy, setBusy]       = useState(false);
  const [copied, setCopied]   = useState(false);
  const [customInput, setCustomInput] = useState('');
  const isHost = room.host === me;
  const now    = Math.floor(Date.now() / 1000);

  useEffect(() => { setCats(room.categories); setRounds(room.rounds); setTimer(room.timer); }, [room]);

  const saveSettings = useCallback(async (c: string[], r: number, t: number) => {
    await api('update', { code, name: me, cats: c, rounds: r, timer: t });
  }, [code, me]);

  function toggleCat(c: string) {
    const next = cats.includes(c) ? cats.filter(x => x !== c) : [...cats, c];
    setCats(next);
    saveSettings(next, rounds, timer);
  }

  function addCustomCat() {
    const val = customInput.trim();
    if (!val || cats.includes(val)) { setCustomInput(''); return; }
    const next = [...cats, val];
    setCats(next);
    saveSettings(next, rounds, timer);
    setCustomInput('');
  }

  async function start() {
    setBusy(true); setErr('');
    const r = await api('start', { code, name: me });
    if (r?.err) { setErr(r.err as string); setBusy(false); }
  }

  async function leave() {
    await api('leave', { code, name: me });
    window.location.reload();
  }

  function copy() {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  const playerCount = Object.keys(room.players).length;

  return (
    <FadeIn>
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        <div style={{ ...page, justifyContent:'flex-start', paddingTop:28 }}>
          {/* Code */}
          <div style={{ display:'flex', alignItems:'center', gap:16, background:'#181820',
            borderWidth:'1px 1px 1px 3px', borderStyle:'solid', borderColor:'#2a2a35 #2a2a35 #2a2a35 #34C9A8',
            padding:'14px 18px', marginBottom:24 }}>
            <div>
              <span style={{ ...label, marginBottom:4 }}>Raum-Code</span>
              <span style={{ fontFamily:'var(--ff-display)', fontWeight:800, fontSize:32,
                letterSpacing:'.18em', color:'#fff' }}>{code}</span>
            </div>
            <button style={{ ...btn('ghost'), marginLeft:'auto', padding:'8px 14px', fontSize:10 }} onClick={copy}>
              {copied ? '✓ Kopiert' : 'Kopieren'}
            </button>
          </div>

          {/* Players */}
          <div style={{ marginBottom:24 }}>
            <span style={eyebrow}>Spieler ({playerCount})</span>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {Object.entries(room.players).map(([p, d]) => (
                <div key={p} style={{ display:'flex', alignItems:'center', gap:10,
                  padding:'10px 14px', background:'#181820', border:'1px solid #2a2a35' }}>
                  <div style={{ width:6, height:6, borderRadius:'50%',
                    background: now - d.seen < 8 ? '#34C9A8' : '#333', flexShrink:0 }} />
                  <span style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:13,
                    textTransform:'uppercase', letterSpacing:'.04em', flex:1 }}>{p}</span>
                  {p === room.host && (
                    <span style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:9,
                      letterSpacing:'.2em', color:'#34C9A8', textTransform:'uppercase' }}>Host</span>
                  )}
                  {p === me && (
                    <span style={{ fontSize:10, letterSpacing:'.12em', color:'#444', textTransform:'uppercase',
                      fontFamily:'var(--ff-display)' }}>Du</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isHost ? (
            <div>
              <span style={eyebrow}>Einstellungen</span>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
                {ALL_CATS.map(c => (
                  <button key={c} style={chip(cats.includes(c))} onClick={() => toggleCat(c)}>{c}</button>
                ))}
                {cats.filter(c => !ALL_CATS.includes(c)).map(c => (
                  <button key={c} style={{ ...chip(true), position:'relative', paddingRight:28 }}
                    onClick={() => { const next = cats.filter(x=>x!==c); setCats(next); saveSettings(next,rounds,timer); }}>
                    {c}<span style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', fontSize:10, opacity:.7 }}>✕</span>
                  </button>
                ))}
              </div>
              <div style={{ display:'flex', gap:0, marginBottom:16 }}>
                <input style={{ ...input, fontSize:13, padding:'9px 12px', flex:1, borderWidth:'1px 0 2px 1px', textTransform:'uppercase' }}
                  placeholder="Eigene Kategorie …"
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomCat()} />
                <button style={{ ...btn('primary'), padding:'9px 14px', fontSize:11, borderWidth:0, flexShrink:0 }}
                  onClick={addCustomCat}>+ Hinzufügen</button>
              </div>
              <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
                {[{ label:'Runden', val:rounds, opts:[3,5,8,10], set:(v:number)=>{ setRounds(v); saveSettings(cats,v,timer); } },
                  { label:'Timer',  val:timer,  opts:[30,45,60,90,120], set:(v:number)=>{ setTimer(v); saveSettings(cats,rounds,v); } }
                ].map(({ label: l, val, opts, set }) => (
                  <div key={l}>
                    <label style={label}>{l}</label>
                    <select style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:13,
                      background:'#181820', border:'1px solid #2a2a35', color:'#e8e4d8',
                      padding:'9px 12px', cursor:'pointer', outline:'none', textTransform:'uppercase' }}
                      value={val} onChange={e => set(+e.target.value)}>
                      {opts.map(n => <option key={n} value={n}>{n}{l==='Timer'?'s':''}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              {err && <p style={{ fontSize:12, color:'#c41920', marginBottom:12 }}>{err}</p>}
              <button style={btn('primary')} onClick={start}
                disabled={busy || cats.length < 3 || playerCount < 2}>
                {busy ? 'Startet …' : 'Spiel starten →'}
              </button>
              {playerCount < 2 && (
                <p style={{ fontSize:12, color:'#555', marginTop:10 }}>
                  Warte auf mindestens einen weiteren Spieler.
                </p>
              )}
            </div>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:10, color:'#555',
              fontSize:11, letterSpacing:'.2em', textTransform:'uppercase', fontFamily:'var(--ff-display)' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#34C9A8',
                animation:'pulse 1.4s ease-in-out infinite' }} />
              Warte auf {room.host} …
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
    </FadeIn>
  );
}

// ── PLAYING ───────────────────────────────────────────────────────────────────

function PlayingScreen({ room, me, code, local, setLocal }: {
  room: Room; me: string; code: string;
  local: Record<string,string>; setLocal: (v: Record<string,string>) => void;
}) {
  const rem     = useTimer(room.round_start, room.timer);
  const pct     = Math.max(0, rem / room.timer * 100);
  const urgent  = rem <= 10;
  const stopped = !!room.stopped_by;
  const refs    = useRef<Record<string, HTMLInputElement | null>>({});
  const saveRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (stopped) return;
    saveRef.current = setInterval(() => api('save', { code, name: me, answers: local }), 8000);
    return () => clearInterval(saveRef.current);
  }, [local, stopped, code, me]);

  async function stop() {
    await api('stop', { code, name: me, answers: local });
  }

  return (
    <FadeIn>
      <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        {/* Letter + Timer */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
          padding:'28px 16px 20px', borderBottom:'1px solid #1e1e26',
          background:'#111115', position:'sticky', top:49, zIndex:9 }}>
          <div style={{ fontFamily:'var(--ff-display)', fontWeight:800, letterSpacing:'-.02em',
            fontSize:'clamp(80px,22vw,140px)', lineHeight:1, color:'#fff' }}>
            {room.letter}
          </div>
          <div style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:13,
            letterSpacing:'.2em', textTransform:'uppercase', marginTop:4,
            color: urgent ? '#c41920' : '#555',
            animation: urgent ? 'pulse 1s ease-in-out infinite' : 'none' }}>
            {rem}s
          </div>
          <div style={{ width:'100%', maxWidth:180, height:2, background:'#1e1e26', marginTop:10 }}>
            <div style={{ width:`${pct}%`, height:'100%', background: urgent ? '#c41920' : '#34C9A8',
              transition:'width .5s linear, background .3s' }} />
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr',
          gap:1, background:'#1e1e26', flex:1 }}>
          {room.categories.map((cat, i) => (
            <div key={cat}
              style={{ background:'#0c0c0e', display:'flex', flexDirection:'column', cursor:'text' }}
              onClick={() => refs.current[cat]?.focus()}>
              <span style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:9,
                letterSpacing:'.25em', color:'#34C9A8', textTransform:'uppercase',
                padding:'10px 14px 4px', pointerEvents:'none' }}>{cat}</span>
              <input
                ref={el => { refs.current[cat] = el; }}
                style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:15,
                  letterSpacing:'.04em', textTransform:'uppercase', background:'transparent',
                  border:'none', color:'#e8e4d8', padding:'4px 14px 12px', outline:'none', width:'100%' }}
                placeholder={`${cat} mit ${room.letter} …`}
                value={local[cat] || ''}
                disabled={stopped}
                onChange={e => setLocal({ ...local, [cat]: e.target.value })}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const next = refs.current[room.categories[i + 1]];
                    if (next) next.focus(); else stop();
                  }
                }}
              />
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        {stopped ? (
          <div style={{ padding:20, background:'#111115', borderTop:'1px solid #1e1e26',
            textAlign:'center', fontFamily:'var(--ff-display)', fontWeight:700, fontSize:12,
            letterSpacing:'.2em', textTransform:'uppercase', color:'#555' }}>
            {room.stopped_by === '__timer__' ? 'Zeit abgelaufen!' : `${room.stopped_by} hat gestoppt!`}
            {' '}— Abstimmung läuft …
          </div>
        ) : (
          <div style={{ padding:'10px 14px', background:'#111115', borderTop:'1px solid #1e1e26',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <button
              onClick={stop}
              style={{ fontFamily:'var(--ff-display)', fontWeight:800, fontSize:15, letterSpacing:'.12em',
                textTransform:'uppercase', background:'#c41920', color:'#fff',
                borderWidth:0, borderStyle:'solid', borderColor:'transparent',
                padding:'13px 48px', cursor:'pointer', transition:'background .12s' }}
              onMouseEnter={e => (e.currentTarget.style.background='#e02029')}
              onMouseLeave={e => (e.currentTarget.style.background='#c41920')}>
              STOP!
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </FadeIn>
  );
}

// ── VOTING ────────────────────────────────────────────────────────────────────

function VotingScreen({ room, me, code }: {
  room: Room; me: string; code: string; cat?: number; setCat?: (n: number) => void;
}) {
  // Flat list of all answers that need a vote from me
  const items = (() => {
    const list: { player: string; cat: string; ans: string }[] = [];
    for (const cat of room.categories) {
      for (const p of Object.keys(room.players)) {
        if (p === me) continue;
        const ans = (room.answers?.[p]?.[cat] ?? '').trim();
        if (!ans) continue;
        list.push({ player: p, cat, ans });
      }
    }
    return list;
  })();

  const [idx, setIdx] = useState(0);

  // Auto-skip to first unvoted on mount + when votes update
  useEffect(() => {
    const firstPending = items.findIndex(i => room.votes?.[i.cat]?.[i.player]?.[me] === undefined);
    if (firstPending !== -1) setIdx(firstPending);
  }, [JSON.stringify(Object.keys(room.votes ?? {}))]);  // eslint-disable-line

  const current  = items[idx];
  const myVote   = current ? (room.votes?.[current.cat]?.[current.player]?.[me] as string | undefined) : undefined;
  const pending  = items.filter(i => room.votes?.[i.cat]?.[i.player]?.[me] === undefined).length;
  const allDone  = pending === 0;

  async function vote(vtype: 'accept'|'reject'|'kreativ') {
    if (!current) return;
    await api('vote', { code, voter: me, target: current.player, cat: current.cat, vtype });
    // Advance to next unvoted
    const rest = items.findIndex((item, i) => i > idx && room.votes?.[item.cat]?.[item.player]?.[me] === undefined);
    if (rest !== -1) setIdx(rest);
  }

  function go(dir: 1 | -1) {
    setIdx(i => Math.max(0, Math.min(items.length - 1, i + dir)));
  }

  const voteButtons: { vtype: 'reject'|'accept'|'kreativ'; label: string; color: string; bg: string; activeBg: string }[] = [
    { vtype: 'reject',  label: '✗  Ablehnen',   color: '#c41920', bg: 'rgba(196,25,32,.08)',  activeBg: '#c41920' },
    { vtype: 'accept',  label: '✓  Akzeptieren', color: '#34C9A8', bg: 'rgba(52,201,168,.08)', activeBg: '#34C9A8' },
    { vtype: 'kreativ', label: '✨  Kreativ',     color: '#f0c040', bg: 'rgba(240,192,64,.08)', activeBg: '#f0c040' },
  ];

  return (
    <FadeIn>
      <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        {items.length === 0 ? (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
            flexDirection:'column', gap:16, color:'#555' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#34C9A8',
              animation:'pulse 1.2s ease-in-out infinite' }} />
            <span style={{ fontFamily:'var(--ff-display)', fontSize:11, letterSpacing:'.2em',
              textTransform:'uppercase' }}>Keine Antworten · Weiter …</span>
          </div>
        ) : (
          <div style={{ flex:1, display:'flex', flexDirection:'column',
            maxWidth:520, margin:'0 auto', width:'100%', padding:'28px 20px' }}>

            {/* Progress */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
              <div style={{ flex:1, height:2, background:'#1e1e26' }}>
                <div style={{ height:'100%', background:'#34C9A8',
                  width:`${((items.length - pending) / items.length) * 100}%`,
                  transition:'width .3s' }} />
              </div>
              <span style={{ fontFamily:'var(--ff-display)', fontSize:11, fontWeight:700,
                letterSpacing:'.15em', color:'#555', flexShrink:0 }}>
                {idx + 1} / {items.length}
              </span>
            </div>

            {/* Card */}
            <div style={{ background:'#111115',
              borderWidth:'3px 1px 1px 1px', borderStyle:'solid',
              borderColor:`${myVote === 'reject' ? '#c41920' : myVote === 'kreativ' ? '#f0c040' : myVote === 'accept' ? '#34C9A8' : '#2a2a35'} #1e1e26 #1e1e26 #1e1e26`,
              padding:'28px 24px', marginBottom:20, transition:'border-color .2s' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                <span style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:9,
                  letterSpacing:'.28em', color:'#34C9A8', textTransform:'uppercase' }}>
                  {current?.cat}
                </span>
                {myVote && (
                  <span style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:9,
                    letterSpacing:'.2em', textTransform:'uppercase',
                    color: myVote==='reject'?'#c41920': myVote==='kreativ'?'#f0c040':'#34C9A8' }}>
                    {myVote === 'reject' ? '✗ Abgelehnt' : myVote === 'kreativ' ? '✨ Kreativ' : '✓ Akzeptiert'}
                  </span>
                )}
              </div>

              <div style={{ fontFamily:'var(--ff-display)', fontWeight:800, letterSpacing:'-.02em',
                fontSize:'clamp(40px,10vw,72px)', lineHeight:.92, color:'#fff',
                textTransform:'uppercase', marginBottom:20 }}>
                {current?.ans}
              </div>

              <div style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:11,
                letterSpacing:'.18em', textTransform:'uppercase', color:'#444' }}>
                {current?.player}
              </div>
            </div>

            {/* Vote buttons */}
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:24 }}>
              {voteButtons.map(({ vtype, label, color, bg, activeBg }) => {
                const active = myVote === vtype;
                return (
                  <button key={vtype} onClick={() => vote(vtype)} style={{
                    fontFamily:'var(--ff-display)', fontWeight:700, fontSize:14,
                    letterSpacing:'.1em', textTransform:'uppercase',
                    padding:'16px 24px', border:`1px solid ${active ? activeBg : '#1e1e26'}`,
                    background: active ? activeBg : bg,
                    color: active ? (vtype === 'accept' ? '#0c0c0e' : vtype === 'kreativ' ? '#0c0c0e' : '#fff') : color,
                    cursor:'pointer', transition:'all .15s',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                  }}>
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Prev / Next nav */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <button onClick={() => go(-1)} disabled={idx === 0}
                style={{ ...btn('ghost'), opacity: idx === 0 ? .2 : 1, padding:'8px 16px', fontSize:11 }}>
                ← Zurück
              </button>
              <div style={{ display:'flex', gap:4 }}>
                {items.map((item, i) => {
                  const voted = room.votes?.[item.cat]?.[item.player]?.[me] !== undefined;
                  return (
                    <div key={i} onClick={() => setIdx(i)} style={{
                      width:8, height:8, borderRadius:'50%', cursor:'pointer',
                      background: i === idx ? '#fff' : voted ? '#34C9A8' : '#2a2a35',
                      transition:'background .2s',
                    }} />
                  );
                })}
              </div>
              <button onClick={() => go(1)} disabled={idx === items.length - 1}
                style={{ ...btn('ghost'), opacity: idx === items.length-1 ? .2 : 1, padding:'8px 16px', fontSize:11 }}>
                Weiter →
              </button>
            </div>
          </div>
        )}
      </div>
    </FadeIn>
  );
}

// ── SCORING ───────────────────────────────────────────────────────────────────

function ScoringScreen({ room, me, code }: { room: Room; me: string; code: string }) {
  const isHost  = room.host === me;
  const detail  = room.round_detail ?? {};
  const rscores = room.round_scores ?? {};
  const players = Object.keys(room.players);

  async function next() { await api('next', { code, name: me }); }

  const divStyle: React.CSSProperties = {
    height: 1, background: '#1e1e26', margin: '0 0 0 0',
  };

  return (
    <FadeIn>
      <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        <div style={{ ...page, maxWidth:720, justifyContent:'flex-start', paddingTop:24 }}>

          {/* Per-category breakdown */}
          {room.categories.map(cat => (
            <div key={cat} style={{ marginBottom:20, border:'1px solid #1e1e26' }}>
              <div style={{ background:'#181820', padding:'8px 16px', borderBottom:'1px solid #1e1e26',
                display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:10,
                  letterSpacing:'.28em', textTransform:'uppercase', color:'#34C9A8' }}>{cat}</span>
              </div>
              {players.map((p, i) => {
                const d = detail[p]?.[cat] ?? { pts:0, why:'leer' as const };
                const votes = room.votes?.[cat]?.[p] ?? {};
                const kreativCount = Object.values(votes).filter(v => v === 'kreativ').length;
                const rejectCount  = Object.values(votes).filter(v => v === 'reject').length;
                const acceptCount  = Object.values(votes).length - kreativCount - rejectCount;
                const hasAns = !!d.ans;
                return (
                  <div key={p}>
                    {i > 0 && <div style={divStyle} />}
                    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
                      background: p === me ? 'rgba(52,201,168,.04)' : '#0c0c0e', flexWrap:'wrap' }}>
                      <span style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:10,
                        letterSpacing:'.15em', textTransform:'uppercase', color:'#444',
                        minWidth:100, flexShrink:0 }}>{p}</span>
                      <span style={{ fontFamily:'var(--ff-display)', fontWeight:800, fontSize:16,
                        textTransform:'uppercase', letterSpacing:'.03em', flex:1,
                        color: d.pts === 0 ? '#333' : PTS_COLOR[d.pts] ?? '#fff' }}>
                        {d.ans ?? '—'}
                        {kreativCount > 0 && <span style={{ marginLeft:8, fontSize:14 }}>{'✨'.repeat(Math.min(kreativCount,3))}</span>}
                      </span>
                      {/* Vote summary */}
                      {hasAns && Object.keys(votes).length > 0 && (
                        <span style={{ fontSize:11, color:'#444', display:'flex', gap:6, flexShrink:0 }}>
                          {acceptCount  > 0 && <span style={{ color:'#4a9e6a' }}>✓×{acceptCount}</span>}
                          {kreativCount > 0 && <span style={{ color:'#f0c040' }}>✨×{kreativCount}</span>}
                          {rejectCount  > 0 && <span style={{ color:'#c41920' }}>✗×{rejectCount}</span>}
                        </span>
                      )}
                      <div style={{ flexShrink:0, textAlign:'right' }}>
                        <span style={{ fontFamily:'var(--ff-display)', fontWeight:800, fontSize:18,
                          color: d.pts === 0 ? '#2a2a35' : PTS_COLOR[d.pts] ?? '#fff' }}>
                          {d.pts > 0 ? `+${d.pts}` : '0'}
                        </span>
                        {d.why !== 'leer' && d.why !== 'abgelehnt' && (
                          <span style={{ display:'block', fontSize:9, fontFamily:'var(--ff-display)',
                            fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase',
                            color: PTS_COLOR[d.pts] ?? '#555', marginTop:1 }}>
                            {WHY_LABEL[d.why]}
                          </span>
                        )}
                        {d.why === 'abgelehnt' && (
                          <span style={{ display:'block', fontSize:9, fontFamily:'var(--ff-display)',
                            fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase',
                            color:'#c41920', marginTop:1 }}>Abgelehnt</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Round totals */}
          <div style={{ borderWidth:'2px 1px 1px 1px', borderStyle:'solid', borderColor:'#34C9A8 #2a2a35 #2a2a35 #2a2a35', marginBottom:24 }}>
            <div style={{ background:'#181820', padding:'8px 16px', borderBottom:'1px solid #1e1e26' }}>
              <span style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:10,
                letterSpacing:'.28em', textTransform:'uppercase', color:'#34C9A8' }}>
                Rundenpunkte · Gesamt
              </span>
            </div>
            {sortedPlayers(room.players).map(([p, d], i) => (
              <div key={p} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
                borderBottom: i < players.length-1 ? '1px solid #1e1e26' : 'none',
                background: p === me ? 'rgba(52,201,168,.04)' : '#0c0c0e' }}>
                <span style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:10,
                  letterSpacing:'.2em', textTransform:'uppercase', color:'#444', minWidth:24 }}>
                  {i+1}.
                </span>
                <span style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:14,
                  textTransform:'uppercase', letterSpacing:'.04em', flex:1,
                  color: p === me ? '#34C9A8' : '#e8e4d8' }}>{p}</span>
                <span style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:14,
                  color:'#34C9A8' }}>+{rscores[p] ?? 0}</span>
                <span style={{ fontFamily:'var(--ff-display)', fontWeight:800, fontSize:20,
                  color:'#fff', minWidth:52, textAlign:'right' }}>{d.score}</span>
              </div>
            ))}
          </div>

          <button style={btn('primary')} onClick={next}>
            {room.round >= room.rounds ? 'Endergebnis →' : 'Nächste Runde →'}
          </button>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
    </FadeIn>
  );
}

// ── CHAT ──────────────────────────────────────────────────────────────────────

function ChatPanel({ room, me, code, open }: { room: Room; me: string; code: string; open: boolean }) {
  const [text, setText]   = useState('');
  const bottomRef         = useRef<HTMLDivElement>(null);
  const inputRef          = useRef<HTMLInputElement>(null);

  const messages: ChatMessage[] = room.chat ?? [];

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [open, messages.length]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  async function send() {
    const t = text.trim();
    if (!t) return;
    setText('');
    await api('chat', { code, name: me, text: t });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: .15 }}
          style={{
            position: 'fixed', top: 53, right: 16, zIndex: 10000,
              width: 300, background: '#111115',
              borderWidth: '2px 1px 1px 1px', borderStyle: 'solid', borderColor: '#34C9A8 #2a2a35 #2a2a35 #2a2a35',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(0,0,0,.6)',
            }}
          >
            <div style={{
              padding: '8px 12px', borderBottom: '1px solid #1e1e26',
              fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 10,
              letterSpacing: '.2em', textTransform: 'uppercase', color: '#34C9A8',
            }}>
              Chat · {code}
            </div>

            <div style={{ overflowY: 'auto', maxHeight: 260, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {messages.length === 0 && (
                <div style={{ padding: '20px 12px', fontSize: 11, color: '#444',
                  fontFamily: 'var(--ff-display)', textAlign: 'center', letterSpacing: '.12em',
                  textTransform: 'uppercase' }}>
                  Noch keine Nachrichten
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} style={{
                  padding: '6px 12px',
                  background: m.from === me ? 'rgba(52,201,168,.05)' : 'transparent',
                  borderBottom: '1px solid #1a1a22',
                }}>
                  <span style={{
                    fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 9,
                    letterSpacing: '.15em', textTransform: 'uppercase',
                    color: m.from === me ? '#34C9A8' : '#555',
                  }}>{m.from}</span>
                  <span style={{
                    display: 'block', fontSize: 13, color: '#e8e4d8',
                    marginTop: 2, wordBreak: 'break-word', lineHeight: 1.4,
                  }}>{m.text}</span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div style={{ display: 'flex', borderTop: '1px solid #1e1e26' }}>
              <input
                ref={inputRef}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  padding: '10px 12px', fontSize: 13, color: '#e8e4d8',
                  fontFamily: 'var(--ff-display)',
                }}
                placeholder="Nachricht …"
                maxLength={200}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') send(); e.stopPropagation(); }}
              />
              <button onClick={send} style={{
                padding: '10px 14px', background: 'transparent',
                borderWidth: '0 0 0 1px', borderStyle: 'solid', borderColor: '#1e1e26', color: '#34C9A8',
                cursor: 'pointer', fontFamily: 'var(--ff-display)', fontWeight: 700,
                fontSize: 16, transition: 'color .1s',
              }}>↑</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
  );
}

// ── GAME OVER ─────────────────────────────────────────────────────────────────

function GameOverScreen({ room, me, code }: { room: Room; me: string; code: string }) {
  const isHost = room.host === me;
  const sorted = sortedPlayers(room.players);
  const winner = sorted[0]?.[0];

  async function rematch() { await api('rematch', { code, name: me }); }
  async function leave()   { await api('leave', { code, name: me }); window.location.reload(); }

  return (
    <FadeIn>
      <div style={page}>
        <span style={{ ...eyebrow, color:'#f0c040' }}>Spielende</span>
        <h1 style={{ ...h1, fontSize:'clamp(36px,10vw,72px)', marginBottom:10 }}>
          {winner === me ? 'Du hast\ngewonnen.' : `${winner?.split(' ')[0]}\ngewinnt.`}
        </h1>
        <div style={{ ...rule, background:'#f0c040', marginBottom:28 }} />

        <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:32 }}>
          {sorted.map(([p, d], i) => (
            <div key={p} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px',
              background:'#111115',
              borderWidth: i===0 ? '1px 1px 1px 3px' : '1px',
              borderStyle: 'solid',
              borderColor: i===0 ? '#f0c040' : '#1e1e26' }}>
              <span style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:11,
                letterSpacing:'.15em', color: i===0?'#f0c040':'#555', minWidth:22, textAlign:'center' }}>
                {i+1}.
              </span>
              <span style={{ fontFamily:'var(--ff-display)', fontWeight:800, fontSize:14,
                textTransform:'uppercase', letterSpacing:'.04em', flex:1,
                color: p===me ? '#34C9A8' : '#e8e4d8' }}>{p}</span>
              <span style={{ fontFamily:'var(--ff-display)', fontWeight:800, fontSize:22,
                color: i===0 ? '#f0c040' : '#fff' }}>{d.score}</span>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {isHost && <button style={btn('primary')} onClick={rematch}>Rematch →</button>}
          <button style={btn('ghost')} onClick={leave}>Neues Spiel</button>
        </div>
      </div>
    </FadeIn>
  );
}
