// Stadt·Land·Fluss — room state (global Map, works on single-instance Node)

export type Phase = 'lobby' | 'playing' | 'voting' | 'scoring' | 'gameover';

export interface Player  { score: number; seen: number }
export interface DetailEntry { pts: number; why: 'leer'|'abgelehnt'|'einziger'|'einzigartig'|'gleich'; ans?: string; kreativ?: number }

export interface ChatMessage { from: string; text: string; ts: number }

export interface Room {
  code:         string;
  host:         string;
  phase:        Phase;
  categories:   string[];
  rounds:       number;
  timer:        number;
  round:        number;
  letter:       string | null;
  stopped_by:   string | null;
  round_start:  number | null;
  vote_start:   number | null;
  players:      Record<string, Player>;
  answers:      Record<string, Record<string, string>>;
  votes:        Record<string, Record<string, Record<string, string>>>; // 'accept'|'reject'|'kreativ'
  round_scores: Record<string, number>;
  round_detail: Record<string, Record<string, DetailEntry>>;
  used:         string[];
  chat:         ChatMessage[];
  created:      number;
}

const roomStore = new Map<string, Room>();

const LETTERS = 'ABCDEFGHIJKLMNOPRSTUVWZ'.split('');

export function getRoom(code: string): Room | undefined {
  const r = roomStore.get(code.toUpperCase());
  if (!r) return undefined;
  if (Date.now() / 1000 - r.created > 86400) { roomStore.delete(code); return undefined; }
  return r;
}

export function saveRoom(r: Room) { roomStore.set(r.code, r); }

function randCode(): string {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ';
  let c = '';
  for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

export function pickLetter(used: string[]): string {
  const av = LETTERS.filter(l => !used.includes(l));
  const pool = av.length ? av : LETTERS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function makeRoom(name: string, cats: string[], rounds: number, timer: number): Room {
  let code = randCode();
  while (roomStore.has(code)) code = randCode();
  const r: Room = {
    code, host: name, phase: 'lobby', categories: cats,
    rounds: Math.max(1, Math.min(15, rounds)),
    timer:  Math.max(20, Math.min(300, timer)),
    round: 0, letter: null, stopped_by: null,
    round_start: null, vote_start: null,
    players: { [name]: { score: 0, seen: Math.floor(Date.now() / 1000) } },
    answers: {}, votes: {}, round_scores: {}, round_detail: {}, used: [], chat: [],
    created: Math.floor(Date.now() / 1000),
  };
  saveRoom(r);
  return r;
}

export function calcScores(r: Room): { scores: Record<string,number>; detail: Record<string,Record<string,DetailEntry>> } {
  const ps  = Object.keys(r.players);
  const sc  = Object.fromEntries(ps.map(p => [p, 0])) as Record<string,number>;
  const dt: Record<string,Record<string,DetailEntry>> = {};

  for (const cat of r.categories) {
    const valid: Record<string,string> = {};
    for (const p of ps) {
      const ans = (r.answers[p]?.[cat] ?? '').trim();
      if (!ans) { dt[p] ??= {}; dt[p][cat] = { pts:0, why:'leer' }; continue; }
      const vt      = r.votes[cat]?.[p] ?? {};
      const vals    = Object.values(vt);
      const no      = vals.filter(v => v === 'reject').length;
      const notNo   = vals.length - no;
      if (no > notNo) { dt[p] ??= {}; dt[p][cat] = { pts:0, why:'abgelehnt', ans }; continue; }
      valid[p] = ans.toLowerCase();
    }
    if (!Object.keys(valid).length) {
      for (const p of ps) { dt[p] ??= {}; dt[p][cat] ??= { pts:0, why:'leer' }; }
      continue;
    }
    const groups: Record<string,string[]> = {};
    for (const [p,a] of Object.entries(valid)) (groups[a] ??= []).push(p);
    const solo = Object.keys(valid).length === 1;

    for (const [p, a] of Object.entries(valid)) {
      const g   = groups[a];
      const pts = g.length > 1 ? 5 : solo ? 20 : 10;
      const why = g.length > 1 ? 'gleich' : solo ? 'einziger' : 'einzigartig';
      const vt2      = r.votes[cat]?.[p] ?? {};
      const kreativ  = Object.values(vt2).filter(v => v === 'kreativ').length;
      sc[p] += pts;
      dt[p] ??= {};
      dt[p][cat] = { pts, why, ans: r.answers[p][cat], ...(kreativ ? { kreativ } : {}) };
    }
    for (const p of ps) { dt[p] ??= {}; dt[p][cat] ??= { pts:0, why:'leer' }; }
  }
  return { scores: sc, detail: dt };
}

export function allVotesDone(r: Room): boolean {
  const ps = Object.keys(r.players);
  for (const cat of r.categories) {
    for (const p of ps) {
      if (!(r.answers[p]?.[cat] ?? '').trim()) continue;
      if (Object.keys(r.votes[cat]?.[p] ?? {}).length < ps.length - 1) return false;
    }
  }
  return true;
}

export function doAdvance(r: Room): Room {
  const { scores, detail } = calcScores(r);
  for (const [p, pts] of Object.entries(scores)) r.players[p].score += pts;
  r.round_scores = scores;
  r.round_detail = detail;
  r.phase = r.round >= r.rounds ? 'gameover' : 'scoring';
  return r;
}

export function checkTimers(r: Room): Room {
  const now = Math.floor(Date.now() / 1000);
  if (r.phase === 'playing' && r.round_start && !r.stopped_by) {
    if (now - r.round_start >= r.timer) {
      r.stopped_by = '__timer__';
      r.phase = 'voting';
      r.vote_start = now;
      for (const cat of r.categories)
        for (const p of Object.keys(r.players))
          r.votes[cat] ??= {}, r.votes[cat][p] ??= {};
    }
  }
  if (r.phase === 'voting' && (allVotesDone(r) || (now - (r.vote_start ?? now)) > 90)) r = doAdvance(r);
  return r;
}

export function initRound(r: Room): Room {
  const l  = pickLetter(r.used);
  const ps = Object.keys(r.players);
  r.letter      = l;
  r.phase       = 'playing';
  r.round_start = Math.floor(Date.now() / 1000);
  r.stopped_by  = null;
  r.answers     = Object.fromEntries(ps.map(p => [p, Object.fromEntries(r.categories.map(c => [c, '']))]));
  r.votes       = {};
  r.round_scores= {};
  r.round_detail= {};
  r.used        = [...r.used, l];
  return r;
}
