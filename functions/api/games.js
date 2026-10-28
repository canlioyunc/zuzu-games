// Cloudflare Pages Function: /api/games
// KV binding adı: GAMES_KV   |   Secret: ADMIN_PASSWORD

const KEY = 'games';

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
  });

async function isAdmin(request, env) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!env.ADMIN_PASSWORD || !token) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(token)),
    crypto.subtle.digest('SHA-256', enc.encode(env.ADMIN_PASSWORD)),
  ]);
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

async function readGames(env) {
  if (!env.GAMES_KV) return [];
  try {
    const data = await env.GAMES_KV.get(KEY, 'json');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const str = (v, max) => String(v ?? '').trim().slice(0, max);
const safeUrl = v => /^(\/(?!\/)|https:\/\/)/.test(v);
const safeThumb = v => v === '' || /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(v) || safeUrl(v);

function clean(g) {
  const slug = str(g.slug, 60).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const title = str(g.title, 80);
  const url = str(g.url, 300);
  const thumb = str(g.thumb, 2_000_000);
  if (!slug || !title || !safeUrl(url) || !safeThumb(thumb)) return null;
  return {
    id: str(g.id, 40) || crypto.randomUUID(),
    slug,
    title,
    description: str(g.description, 400),
    url,
    thumb,
    tags: (Array.isArray(g.tags) ? g.tags : []).map(t => str(t, 24)).filter(Boolean).slice(0, 6),
    featured: !!g.featured,
    visible: g.visible !== false,
  };
}

export async function onRequestGet({ request, env }) {
  const all = new URL(request.url).searchParams.get('all') === '1';
  if (all) {
    if (!(await isAdmin(request, env))) {
      await new Promise(r => setTimeout(r, 600));
      return json({ error: 'unauthorized' }, 401);
    }
    return json(await readGames(env));
  }
  const games = (await readGames(env)).filter(g => g.visible !== false);
  return json(games, 200, { 'cache-control': 'public, max-age=30' });
}

export async function onRequestPut({ request, env }) {
  if (!(await isAdmin(request, env))) {
    await new Promise(r => setTimeout(r, 600));
    return json({ error: 'unauthorized' }, 401);
  }
  if (!env.GAMES_KV) return json({ error: 'GAMES_KV bağlanmamış' }, 500);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'geçersiz JSON' }, 400); }
  if (!Array.isArray(body) || body.length > 200) return json({ error: 'geçersiz liste' }, 400);
  const games = body.map(clean);
  if (games.some(g => !g)) return json({ error: 'Bir oyunda eksik/hatalı alan var (başlık, adres, görsel)' }, 400);
  const payload = JSON.stringify(games);
  if (payload.length > 20_000_000) return json({ error: 'Veri çok büyük, görselleri küçült' }, 413);
  await env.GAMES_KV.put(KEY, payload);
  return json(games);
}
