import { NextRequest, NextResponse } from 'next/server';
import {
  getRoom, saveRoom, makeRoom, doAdvance, allVotesDone,
  checkTimers, initRound, type Room, type ChatMessage,
} from '@/lib/slf';

const DEFAULT_CATS = ['Stadt','Land','Fluss','Name','Tier','Beruf','Pflanze'];

function ok(data = {}) { return NextResponse.json({ ok: true, ...data }); }
function err(msg: string, status = 400) { return NextResponse.json({ err: msg }, { status }); }

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const action = body.action as string;

  switch (action) {

    case 'create': {
      const raw = (body.name as string ?? '').trim();
      if (!raw) return err('Name fehlt');
      const name  = raw;
      const cats  = (body.cats as string[] | undefined) ?? DEFAULT_CATS;
      const rounds= Number(body.rounds ?? 5);
      const timer = Number(body.timer ?? 60);
      const room  = makeRoom(name, cats, rounds, timer);
      return ok({ code: room.code, name });
    }

    case 'join': {
      const code = (body.code as string ?? '').toUpperCase();
      const raw  = (body.name as string ?? '').trim();
      if (!raw || !code) return err('Fehlende Daten');
      const name = raw;
      const r    = getRoom(code);
      if (!r)                      return err('Raum nicht gefunden');
      if (r.phase !== 'lobby')     return err('Spiel läuft bereits');
      if (Object.keys(r.players).length >= 8) return err('Raum voll (max. 8)');
      if (!r.players[name]) r.players[name] = { score: 0, seen: Math.floor(Date.now() / 1000) };
      saveRoom(r);
      return ok({ code, name });
    }

    case 'update': {
      const r = getRoom((body.code as string ?? '').toUpperCase());
      if (!r || r.host !== body.name || r.phase !== 'lobby') return err('Nicht erlaubt');
      if (body.cats && (body.cats as string[]).length >= 3) r.categories = body.cats as string[];
      if (body.rounds) r.rounds = Math.max(1, Math.min(15, Number(body.rounds)));
      if (body.timer)  r.timer  = Math.max(20, Math.min(300, Number(body.timer)));
      saveRoom(r);
      return ok();
    }

    case 'start': {
      const r = getRoom((body.code as string ?? '').toUpperCase());
      if (!r || r.host !== body.name || r.phase !== 'lobby') return err('Nicht erlaubt');
      if (Object.keys(r.players).length < 2) return err('Min. 2 Spieler nötig');
      r.round = 1;
      initRound(r);
      saveRoom(r);
      return ok();
    }

    case 'stop': {
      const r    = getRoom((body.code as string ?? '').toUpperCase());
      const name = body.name as string;
      if (!r || r.phase !== 'playing' || r.stopped_by) return ok();
      const answers = body.answers as Record<string,string> | undefined;
      if (answers) {
        for (const [cat, ans] of Object.entries(answers))
          if (cat in (r.answers[name] ?? {})) r.answers[name][cat] = ans.trim();
      }
      r.stopped_by = name;
      r.phase = 'voting';
      r.vote_start = Math.floor(Date.now() / 1000);
      for (const cat of r.categories)
        for (const p of Object.keys(r.players))
          { r.votes[cat] ??= {}; r.votes[cat][p] ??= {}; }
      if (allVotesDone(r)) doAdvance(r);
      saveRoom(r);
      return ok();
    }

    case 'save': {
      const r    = getRoom((body.code as string ?? '').toUpperCase());
      const name = body.name as string;
      if (!r || r.phase !== 'playing') return ok();
      const answers = body.answers as Record<string,string> | undefined;
      if (answers) {
        for (const [cat, ans] of Object.entries(answers))
          if (cat in (r.answers[name] ?? {})) r.answers[name][cat] = ans.trim();
      }
      r.players[name].seen = Math.floor(Date.now() / 1000);
      saveRoom(r);
      return ok();
    }

    case 'vote': {
      const r      = getRoom((body.code as string ?? '').toUpperCase());
      const voter  = body.voter  as string;
      const target = body.target as string;
      const cat    = body.cat    as string;
      if (!r || r.phase !== 'voting' || voter === target) return ok();
      r.votes[cat] ??= {};
      r.votes[cat][target] ??= {};
      const vtype = body.vtype as string ?? 'accept';
      r.votes[cat][target][voter] = ['accept','reject','kreativ'].includes(vtype) ? vtype : 'accept';
      r.players[voter].seen = Math.floor(Date.now() / 1000);
      if (allVotesDone(r)) doAdvance(r);
      saveRoom(r);
      return ok();
    }

    case 'next': {
      const r = getRoom((body.code as string ?? '').toUpperCase());
      const name = body.name as string;
      if (!r || !r.players[name] || r.phase !== 'scoring') return err('Nicht erlaubt');
      r.round++;
      initRound(r);
      saveRoom(r);
      return ok();
    }

    case 'rematch': {
      const r = getRoom((body.code as string ?? '').toUpperCase());
      if (!r || r.host !== body.name) return err('Nicht erlaubt');
      for (const p of Object.keys(r.players)) r.players[p].score = 0;
      r.phase = 'lobby'; r.round = 0; r.letter = null;
      r.answers = {}; r.votes = {}; r.round_scores = {}; r.round_detail = {}; r.used = [];
      saveRoom(r);
      return ok();
    }

    case 'chat': {
      const r    = getRoom((body.code as string ?? '').toUpperCase());
      const name = body.name as string;
      const text = (body.text as string ?? '').trim();
      if (!r || !r.players[name] || !text || text.length > 200) return ok();
      const msg: ChatMessage = { from: name, text, ts: Math.floor(Date.now() / 1000) };
      r.chat = [...(r.chat ?? []), msg].slice(-100);
      saveRoom(r);
      return ok();
    }

    case 'leave': {
      const r    = getRoom((body.code as string ?? '').toUpperCase());
      const name = body.name as string;
      if (!r || !r.players[name]) return ok();
      delete r.players[name];
      if (!Object.keys(r.players).length) { /* let it expire */ return ok(); }
      if (r.host === name) r.host = Object.keys(r.players)[0];
      saveRoom(r);
      return ok();
    }

    case 'poll': {
      const code = (body.code as string ?? '').toUpperCase();
      const name = body.name as string;
      let r = getRoom(code);
      if (!r) return NextResponse.json({ err: 'not_found' });
      if (r.players[name]) r.players[name].seen = Math.floor(Date.now() / 1000);
      r = checkTimers(r);
      saveRoom(r);
      // Hide other players' answers during playing
      const out: Room = JSON.parse(JSON.stringify(r));
      if (out.phase === 'playing') {
        out.answers = { [name]: r.answers[name] ?? {} };
      }
      return NextResponse.json(out);
    }

    default:
      return err('Unknown action', 404);
  }
}
