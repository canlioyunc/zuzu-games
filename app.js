// Zuzu Games - ortak yardımcılar
async function fetchGames() {
  try {
    const r = await fetch('/api/games');
    if (!r.ok) throw new Error('api');
    const data = await r.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function gameCard(g) {
  const card = el('article', 'card');
  const t = el('div', 'thumb');
  if (g.thumb) {
    const img = document.createElement('img');
    img.src = g.thumb;
    img.alt = g.title;
    img.loading = 'lazy';
    t.appendChild(img);
  } else {
    const ph = document.createElement('img');
    ph.src = '/assets/logo.svg';
    ph.alt = '';
    ph.className = 'ph';
    t.appendChild(ph);
  }
  const b = el('div', 'body');
  b.appendChild(el('h3', null, g.title));
  if (g.tags && g.tags.length) {
    const tg = el('div', 'tags');
    g.tags.forEach(x => tg.appendChild(el('span', 'tag', x)));
    b.appendChild(tg);
  }
  b.appendChild(el('p', null, g.description || ''));
  const a = el('a', 'btn primary', 'Oyna ▶');
  a.href = g.url;
  b.appendChild(a);
  card.append(t, b);
  return card;
}

function renderGames(target, games, emptyText) {
  target.replaceChildren();
  if (!games.length) {
    target.appendChild(el('div', 'empty', emptyText || 'Yakında yeni oyunlar geliyor.'));
    return;
  }
  games.forEach(g => target.appendChild(gameCard(g)));
}

// hero arkasındaki yanıp sönen pikseller
function pixelField(box) {
  if (!box) return;
  for (let i = 0; i < 26; i++) {
    const p = document.createElement('i');
    p.style.left = Math.floor(Math.random() * 60) * 1.7 + '%';
    p.style.top = Math.floor(Math.random() * 20) * 5 + '%';
    p.style.animationDelay = (Math.random() * 5).toFixed(2) + 's';
    p.style.animationDuration = (3 + Math.random() * 4).toFixed(1) + 's';
    box.appendChild(p);
  }
}
