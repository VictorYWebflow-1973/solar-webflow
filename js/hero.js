/* Solar · hero sistem (canvas 2D + GSAP)
   - prave heliocentrične pozicije planeta (JPL Keplerovi elementi) za simulirani datum
   - udaljenosti sabijene: f(r) = 0.45 + r^0.45 (pravac i redosled tačni, razmera nije)
   - 3D projekcija: kamera nagnuta ka ravni ekliptike, blaga perspektiva, crtanje po dubini
   - senka svake planete okrenuta od Sunca, uvodna animacija, hover/fokus/klik, HUD vremena */
(() => {
  const BASE = ((document.currentScript && document.currentScript.src) || '').replace(/js\/[^/]*$/, '');   // adresa repoa na jsDelivr-u
  const D2R = Math.PI / 180, AU_KM = 149597870.7;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none)').matches;

  const canvas = document.getElementById('system');
  const ctx = canvas.getContext('2d');
  const card = document.getElementById('card');
  const heroSec = canvas.closest('section');
  // Webflow ne pravi <button>/<input type=range> van forme, pa HUD, dugme za preskok i Ceres panel dodaje skripta
  const hudBox = document.getElementById('hud');
  if (hudBox && !hudBox.children.length) hudBox.innerHTML = `<div class="home-hero_hud-date"><span class="text-style-label">Date<span class="home-hero_hud-delta is-today" id="hudDelta">· Today</span></span><span class="text-style-data" id="hudDate">—</span></div>
    <label class="home-hero_hud-speed"><span class="text-style-label"><span class="hide-mobile-landscape">Time speed · </span><span id="hudSpeed">1 day / s</span></span><input type="range" id="speed" min="0" max="5" step="1" value="1" aria-label="Time speed"></label>
    <div class="home-hero_hud-buttons"><button type="button" data-act="today">Today</button><button type="button" data-act="pause" id="pauseBtn" aria-pressed="false">Pause</button></div>`;
  if (!document.getElementById('skip')) { const s = document.createElement('button'); s.type = 'button'; s.id = 'skip'; s.className = 'button is-secondary home-hero_skip'; s.textContent = 'Skip intro'; heroSec.appendChild(s); }
  if (!document.getElementById('ceresPanel')) { const p = document.createElement('aside'); p.className = 'ceres-panel_component'; p.id = 'ceresPanel'; p.setAttribute('aria-label', 'Ceres'); p.setAttribute('aria-hidden', 'true');
    p.innerHTML = `<button class="button is-secondary ceres-panel_close" type="button" id="panelClose">Close</button><span class="text-style-label">Dwarf planet · Asteroid belt</span><h2 class="home-hero_card-name">Ceres</h2>
      <img src="${BASE}img/sprites/ceres.webp" alt="Ceres seen whole, a grey cratered dwarf planet" width="218" height="218"><dl class="ceres-panel_data"><dt>Diameter</dt><dd>939 km</dd><dt>From the Sun</dt><dd id="ceresSun">—</dd></dl>`;
    (heroSec.parentElement || document.body).appendChild(p); }
  const menu = document.getElementById('menu');

  /* ---------- vreme ---------- */
  const jdNow = () => Date.now() / 86400000 + 2440587.5;
  const SPEEDS = [0, 1, 7, 30, 365, 3650];                     // dana po sekundi
  const SPEED_LABEL = ['Paused', '1 day / s', '7 days / s', '30 days / s', '1 year / s', '10 years / s'];
  const state = { jd: jdNow(), speedIdx: reduce ? 0 : 1, paused: reduce, hoverPause: false, inView: true,
    camE: 24, camYaw: 0, intro: { stars: 1, sun: 1, orbits: 1, fly: 1 } };

  /* ---------- Kepler ---------- */
  function helio(id, jd) {
    const [el, rt] = SOLAR_ELEMENTS[id]; const T = (jd - 2451545.0) / 36525;
    const a = el[0] + rt[0] * T, e = el[1] + rt[1] * T, I = (el[2] + rt[2] * T) * D2R;
    const L = el[3] + rt[3] * T, varpi = el[4] + rt[4] * T, Om = (el[5] + rt[5] * T) * D2R;
    const w = (varpi * D2R) - Om;
    let M = ((L - varpi) % 360 + 540) % 360 - 180; M *= D2R;
    let E = M + e * Math.sin(M);
    for (let k = 0; k < 8; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    const xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
    return rot(xp, yp, w, Om, I);
  }
  function rot(xp, yp, w, Om, I) {
    const cw = Math.cos(w), sw = Math.sin(w), cO = Math.cos(Om), sO = Math.sin(Om), cI = Math.cos(I), sI = Math.sin(I);
    return [(cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
            (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
            (sw * sI) * xp + (cw * sI) * yp];
  }
  function orbitPath(id, jd, n = 200) {
    const [el, rt] = SOLAR_ELEMENTS[id]; const T = (jd - 2451545.0) / 36525;
    const a = el[0] + rt[0] * T, e = el[1] + rt[1] * T, I = (el[2] + rt[2] * T) * D2R;
    const varpi = el[4] + rt[4] * T, Om = (el[5] + rt[5] * T) * D2R, w = varpi * D2R - Om;
    const pts = [];
    for (let k = 0; k <= n; k++) { const E = k / n * Math.PI * 2;
      pts.push(rot(a * (Math.cos(E) - e), a * Math.sqrt(1 - e * e) * Math.sin(E), w, Om, I)); }
    return pts;
  }

  /* ---------- projekcija ---------- */
  let W = 0, H = 0, DPR = 1, K = 100, CX = 0, CY = 0;
  const compress = r => 0.45 + Math.pow(r, 0.45);
  function project(p, rScale = 1) {
    const r = Math.hypot(p[0], p[1], p[2]) || 1e-9, f = compress(r) / r * rScale;
    let x = p[0] * f, y = p[1] * f, z = p[2] * f;
    const yw = state.camYaw * D2R, cy = Math.cos(yw), sy = Math.sin(yw);
    const xr = x * cy - y * sy, yr = x * sy + y * cy;
    const e = state.camE * D2R;
    const depth = yr * Math.cos(e) + z * Math.sin(e);            // > 0 bliže posmatraču
    const persp = 1 / (1 - depth / 18);
    return { x: CX + xr * K * persp, y: CY + (yr * Math.sin(e) - z * Math.cos(e)) * K * persp, depth, persp };
  }

  /* ---------- tela ---------- */
  const sprites = {};
  function sprite(id) { if (!sprites[id]) { const im = new Image(); im.src = `${BASE}img/sprites/${id}.webp`; sprites[id] = im; } return sprites[id]; }
  const bodies = SOLAR_BODIES.filter(b => b.id !== 'sun').map(b => ({ ...b, pts: null, path: null }));
  const moons = SOLAR_MOONS.map(([id, name, parent, d, P], i) => ({ id, name, parent, diameterKm: d, P, phase: (i * 2.399) % (Math.PI * 2) }));
  const radiusPx = d => (5 + 10 * Math.log10(Math.max(d, 900) / 800)) * (K / 107);
  bodies.forEach(b => sprite(b.id)); moons.forEach(m => sprite(m.id));

  // asteroidni pojas — ilustracija (nasumične čestice na Keplerovim putanjama)
  const belt = Array.from({ length: 1400 }, () => { const a = 2.2 + Math.random() * 1.1, inc = (Math.random() - .5) * 0.25;
    return { a, M0: Math.random() * Math.PI * 2, n: 2 * Math.PI / (Math.pow(a, 1.5) * 365.25), inc, Om: Math.random() * Math.PI * 2, s: Math.random() }; });

  // zvezde (statične, u offscreen platnu)
  const starCanvas = document.createElement('canvas'); const sctx = starCanvas.getContext('2d');
  function buildStars() {
    starCanvas.width = W * DPR * 1.1; starCanvas.height = H * DPR * 1.1;
    sctx.scale(DPR, DPR); sctx.clearRect(0, 0, W * 1.1, H * 1.1);
    for (let i = 0; i < Math.round(W * H / 2600); i++) {
      const x = Math.random() * W * 1.1, y = Math.random() * H * 1.1, r = Math.random() < .93 ? Math.random() * .8 + .2 : Math.random() * 1.2 + .8;
      sctx.fillStyle = `rgba(${220 + Math.random() * 35},${215 + Math.random() * 40},255,${.25 + Math.random() * .6})`;
      sctx.beginPath(); sctx.arc(x, y, r, 0, 7); sctx.fill();
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect(); W = rect.width; H = rect.height; DPR = Math.min(devicePixelRatio || 1, 2);
    canvas.width = W * DPR; canvas.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const compact = W < 1440;           // Webflow: ≤1439 meni planeta dole; ≤767 sistem ispod teksta
    const EXT = 6.3;                    // f(r) za Plutonov afel ≈ 6.2 → poluprečnik sistema = EXT·K
    const tilt = Math.sin(state.camE * D2R + .12);
    if (compact) {
      const hud = document.getElementById('hud');
      const last = [...document.querySelectorAll('#heroSub, #heroCta')].map(e => e.getBoundingClientRect()).filter(r => r.height).map(r => r.bottom);
      const top = last.length ? Math.max(...last) - rect.top + 16 : H * .4;
      const bottom = hud ? hud.getBoundingClientRect().top - rect.top - 16 : H * .85;
      const avail = Math.max(120, bottom - top);
      if (W >= 992) {   // osnovni desktop i 1280: sistem u prostoru desno od teksta (Sunce nikad ispod teksta)
        const tr = Math.max(...[...document.querySelectorAll('#heroTitle, #heroSub, #heroCta')].map(e => e.getBoundingClientRect().right)) - rect.left;
        const c = document.querySelector('.home-hero_layout').getBoundingClientRect(), rightEdge = c.right - rect.left;
        const room = Math.max(240, rightEdge - tr);
        K = Math.min(room * 0.62, (bottom - 96) * 0.5 / tilt) / EXT;
        CX = tr + room * 0.5 + 16; CY = 96 + (bottom - 96) * 0.5;
      } else if (W >= 768) {   // tablet: sistem desno, iza teksta (meni je dole, nema sudara)
        K = Math.min(W * 0.36, (bottom - 96) * 0.5 / tilt) / EXT;
        CX = W * 0.62; CY = 96 + (bottom - 96) * 0.5;
      } else {
        K = Math.min((W * 0.47) / EXT, (avail * 0.5) / (EXT * tilt + .35));
        CX = W * 0.5; CY = top + avail * 0.5;
      }
    } else {
      // desna granica = leva ivica menija planeta (bez preklapanja, PRAVILA B1)
      const m = document.getElementById('menu'); const mr = m && m.getBoundingClientRect().width ? m.getBoundingClientRect().left - rect.left - 32 : W * .9;
      K = Math.min(W * 0.40, H * 0.43 / tilt) / EXT;
      CX = Math.min(W * 0.58, mr - EXT * K);
      if (CX < W * 0.42) { K = (mr - W * 0.42) / EXT; CX = W * 0.42; }
      CY = H * 0.52;
    }
    buildStars(); rebuildOrbits();
  }
  function rebuildOrbits() { bodies.forEach(b => { b.path = orbitPath(b.id, state.jd); }); }

  /* ---------- crtanje ---------- */
  let hovered = null, focusedId = null, hits = [];
  function drawSphere(id, x, y, r, sun, alpha = 1, light = true) {
    const im = sprites[id];
    ctx.save(); ctx.globalAlpha = alpha;
    if (im && im.complete && im.naturalWidth) ctx.drawImage(im, x - r, y - r, r * 2, r * 2);
    else { ctx.fillStyle = '#888'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
    if (light) { // senka okrenuta od Sunca
      let vx = x - sun.x, vy = y - sun.y; const L = Math.hypot(vx, vy) || 1; vx /= L; vy /= L;
      const g = ctx.createLinearGradient(x - vx * r * .15, y - vy * r * .15, x + vx * r, y + vy * r);
      g.addColorStop(0, 'rgba(4,3,14,0)'); g.addColorStop(.45, 'rgba(4,3,14,.55)'); g.addColorStop(1, 'rgba(4,3,14,.9)');
      ctx.beginPath(); ctx.arc(x, y, r + .5, 0, 7); ctx.fillStyle = g; ctx.fill();
    }
    ctx.restore();
  }
  function drawRing(x, y, r, persp, front) {
    const e = state.camE * D2R, ry = Math.sin(e) + .12;
    ctx.save(); ctx.beginPath();
    if (front) ctx.rect(x - r * 3, y, r * 6, r * 3); else ctx.rect(x - r * 3, y - r * 3, r * 6, r * 3);
    ctx.clip();
    [[1.35, .22], [1.6, .45], [1.85, .35], [2.1, .18]].forEach(([k, a]) => {
      ctx.beginPath(); ctx.ellipse(x, y, r * k, r * k * ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(227,203,143,${a})`; ctx.lineWidth = Math.max(1, r * .22); ctx.stroke(); });
    ctx.restore();
  }

  function frame(dtDays) {
    ctx.clearRect(0, 0, W, H);
    const I = state.intro;
    // zvezde sa paralaksom
    ctx.globalAlpha = I.stars; ctx.drawImage(starCanvas, -W * .05 - state.camYaw * 2, -H * .05 + (state.camE - 24) * 2, W * 1.1, H * 1.1); ctx.globalAlpha = 1;

    const sun = project([0, 0, 0]);
    hits = [];

    // orbite
    bodies.forEach(b => {
      const pts = b.path.map(p => project(p)); const n = Math.max(2, Math.floor(pts.length * I.orbits));
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (let k = 1; k < n; k++) ctx.lineTo(pts[k].x, pts[k].y);
      const hi = (hovered && (hovered.id === b.id || hovered.parent === b.id)) || focusedId === b.id;
      ctx.strokeStyle = hi ? 'rgba(201,155,255,.75)' : (b.id === 'ceres' ? 'rgba(179,172,214,.14)' : 'rgba(201,155,255,.22)');
      ctx.lineWidth = hi ? 1.5 : 1; ctx.stroke();
    });

    // asteroidni pojas
    ctx.fillStyle = 'rgba(179,172,214,.5)';
    belt.forEach(p => { const ang = p.M0 + p.n * (state.jd - 2451545) ;
      const x = Math.cos(ang) * p.a, y = Math.sin(ang) * p.a, z = Math.sin(ang - p.Om) * p.a * p.inc * .3;
      const q = project([x * I.fly, y * I.fly, z * I.fly]); ctx.globalAlpha = (.25 + p.s * .5) * I.orbits;
      ctx.fillRect(q.x, q.y, p.s > .8 ? 1.4 : 1, p.s > .8 ? 1.4 : 1); });
    ctx.globalAlpha = 1;

    // pozicije i redosled po dubini
    const list = [];
    bodies.forEach(b => { const h = helio(b.id, state.jd); b.helio = h;
      const q = project([h[0] * I.fly, h[1] * I.fly, h[2] * I.fly]); list.push({ kind: 'body', b, q, depth: q.depth }); });
    list.push({ kind: 'sun', q: sun, depth: 0 });
    list.sort((a, b) => a.depth - b.depth);

    list.forEach(it => {
      if (it.kind === 'sun') return drawSun(it.q);
      const b = it.b, q = it.q, r = radiusPx(b.diameterKm) * q.persp * (0.4 + 0.6 * I.fly);
      if (b.ring) drawRing(q.x, q.y, r, q.persp, false);
      drawSphere(b.id, q.x, q.y, r, sun, I.fly);
      if (b.ring) drawRing(q.x, q.y, r, q.persp, true);
      const hl = (hovered && hovered.id === b.id) || focusedId === b.id;
      if (hl) { ctx.save(); ctx.shadowColor = 'rgba(201,155,255,.9)'; ctx.shadowBlur = 40; ctx.strokeStyle = 'rgba(201,155,255,.9)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(q.x, q.y, r + 6, 0, 7); ctx.stroke(); ctx.restore(); }
      hits.push({ obj: b, x: q.x, y: q.y, r });
      // meseci
      const ms = moons.filter(m => m.parent === b.id);
      ms.forEach((m, i) => {
        const P = m.P, speedCap = 0.35; // vizuelno ograničenje brzine meseca (rad po frejmu)
        m.phase += Math.sign(P) * Math.min(Math.abs(dtDays / P) * Math.PI * 2, speedCap);
        const orR = r * (1.9 + i * 0.75) + 4, e = state.camE * D2R;
        const mx = q.x + Math.cos(m.phase) * orR, my = q.y + Math.sin(m.phase) * orR * (Math.sin(e) + .12);
        const mr = Math.max(1.2, radiusPx(m.diameterKm) * .45 * q.persp);
        drawSphere(m.id, mx, my, mr, sun, I.fly, true);
        if (hovered && hovered.id === m.id) { ctx.strokeStyle = 'rgba(201,155,255,.9)'; ctx.beginPath(); ctx.arc(mx, my, mr + 4, 0, 7); ctx.stroke(); }
        hits.push({ obj: m, x: mx, y: my, r: mr });
      });
    });
    if (hovered) positionCard();
  }

  function drawSun(q) {
    const s = state.intro.sun; if (s <= 0) return;
    const r = 0.30 * K * s;
    const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, r * 4.5);
    g.addColorStop(0, 'rgba(255,236,190,.95)'); g.addColorStop(.18, 'rgba(255,190,110,.55)'); g.addColorStop(.45, 'rgba(201,155,255,.12)'); g.addColorStop(1, 'rgba(201,155,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, r * 4.5, 0, 7); ctx.fill();
    const core = ctx.createRadialGradient(q.x - r * .2, q.y - r * .2, r * .1, q.x, q.y, r);
    core.addColorStop(0, '#FFF6DA'); core.addColorStop(.7, '#FFC56B'); core.addColorStop(1, '#F08A3C');
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, 7); ctx.fill();
    hits.push({ obj: { id: 'sun', name: 'Sun', type: 'Star', diameterKm: 1392000 }, x: q.x, y: q.y, r });
  }

  /* ---------- kartica ---------- */
  const fmt = n => n.toLocaleString('en-US');
  const fmtKm = km => km >= 1e9 ? (km / 1e9).toFixed(2) + ' billion km' : km >= 1e6 ? (km / 1e6).toFixed(1) + ' million km' : fmt(Math.round(km)) + ' km';
  const fmtDate = jd => new Date((jd - 2440587.5) * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  function cardHTML(o) {
    const isMoon = !!o.parent, earth = helio('earth', state.jd);
    let rows = `<dt>Diameter</dt><dd>${o.id === 'sun' ? '1.4 million km' : fmt(o.diameterKm) + ' km'}</dd>`;
    if (!isMoon && o.id !== 'sun') {
      const h = helio(o.id, state.jd), rs = Math.hypot(...h) * AU_KM;
      rows += `<dt>From the Sun</dt><dd>${fmtKm(rs)}</dd>`;
      if (o.id !== 'earth') rows += `<dt>From Earth · ${fmtDate(state.jd)}</dt><dd>${fmtKm(Math.hypot(h[0] - earth[0], h[1] - earth[1], h[2] - earth[2]) * AU_KM)}</dd>`;
    }
    if (o.id === 'sun') rows += `<dt>From Earth · ${fmtDate(state.jd)}</dt><dd>${fmtKm(Math.hypot(...earth) * AU_KM)}</dd>`;
    const type = isMoon ? `Moon of ${o.parent[0].toUpperCase() + o.parent.slice(1)}` : o.type;
    const cta = o.id === 'ceres' ? 'Open details' : isMoon ? `Explore the ${o.parent[0].toUpperCase() + o.parent.slice(1)} system` : `Explore ${o.name}`;
    return `<span class="text-style-label">${type}</span><h3 class="home-hero_card-name">${o.name}</h3><dl>${rows}</dl>
      <div class="home-hero_card-cta">${isTouch ? 'Tap again to explore' : 'Click to explore'} · ${cta}</div>${o.note ? `<div class="home-hero_card-note">${o.note}</div>` : ''}`;
  }
  function positionCard() {
    const h = hits.find(t => t.obj.id === hovered.id); if (!h || isTouch) return;
    let x = h.x + h.r + 24, y = h.y - 40; if (x + 282 > W - 24) x = h.x - h.r - 24 - 282; y = Math.max(96, Math.min(y, H - 136 - card.offsetHeight));
    card.style.left = x + 'px'; card.style.top = y + 'px';
  }
  function setHover(o) {
    if ((hovered && hovered.id) === (o && o.id)) return;
    hovered = o; state.hoverPause = !!o;
    canvas.style.cursor = o ? 'pointer' : 'default';
    if (o) { card.innerHTML = cardHTML(o); card.classList.add('is-on'); } else card.classList.remove('is-on');
    [...menu.children].forEach(b => b.classList.toggle('is-active', !!o && b.dataset.id === o.id));
  }
  function open(o) {
    if (!o) return;
    if (o.id === 'ceres') return openPanel();
    const target = o.parent || o.id;
    location.href = `/worlds/${target}${o.parent ? '#moons' : ''}`;
  }
  function pick(px, py) {
    let best = null, bd = 1e9;
    hits.forEach(h => { const d = Math.hypot(px - h.x, py - h.y), lim = Math.max(h.r + 6, 12); if (d < lim && d < bd) { bd = d; best = h.obj; } });
    return best;
  }
  canvas.addEventListener('pointermove', e => { if (isTouch) return; const r = canvas.getBoundingClientRect(); setHover(pick(e.clientX - r.left, e.clientY - r.top)); });
  canvas.addEventListener('pointerleave', () => !isTouch && setHover(null));
  canvas.addEventListener('click', e => { const r = canvas.getBoundingClientRect(); const o = pick(e.clientX - r.left, e.clientY - r.top);
    if (isTouch) { if (o && hovered && hovered.id === o.id) open(o); else setHover(o); } else open(o); });

  // meni objekata (tastatura + fokus)
  [{ id: 'sun', name: 'Sun', type: 'Star', diameterKm: 1392000, color: '#FFC56B' }, ...bodies].forEach(b => {
    const btn = document.createElement('button'); btn.type = 'button'; btn.dataset.id = b.id; btn.setAttribute('role', 'listitem');
    btn.innerHTML = `<span>${b.name}</span><i style="--dot:${b.color || 'var(--accent)'}"></i>`;
    btn.addEventListener('mouseenter', () => { focusedId = b.id; setHover(b); });
    btn.addEventListener('focus', () => { focusedId = b.id; setHover(b); });
    btn.addEventListener('mouseleave', () => { focusedId = null; setHover(null); });
    btn.addEventListener('blur', () => { focusedId = null; setHover(null); });
    btn.addEventListener('click', () => open(b));
    menu.appendChild(btn);
  });

  /* ---------- Ceres panel ---------- */
  const panel = document.getElementById('ceresPanel');
  function openPanel() { const h = helio('ceres', state.jd); document.getElementById('ceresSun').textContent = fmtKm(Math.hypot(...h) * AU_KM);
    panel.classList.add('is-open'); panel.setAttribute('aria-hidden', 'false'); document.getElementById('panelClose').focus(); setHover(null); }
  document.getElementById('panelClose').addEventListener('click', () => { panel.classList.remove('is-open'); panel.setAttribute('aria-hidden', 'true'); });
  addEventListener('keydown', e => { if (e.key === 'Escape') panel.classList.remove('is-open'); });

  /* ---------- HUD ---------- */
  const speedIn = document.getElementById('speed'), pauseBtn = document.getElementById('pauseBtn');
  const hudDate = document.getElementById('hudDate'), hudSpeed = document.getElementById('hudSpeed');
  document.getElementById('heroDate').textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  speedIn.value = state.speedIdx;
  const hudDelta = document.getElementById('hudDelta');
  function syncHud() { hudDate.textContent = fmtDate(state.jd);
    if (hudDelta) { const d = Math.round(state.jd - jdNow()); hudDelta.textContent = d === 0 ? '· Today' : `· ${d > 0 ? '+' : '−'}${Math.abs(d).toLocaleString('en-US')} ${Math.abs(d) === 1 ? 'day' : 'days'}`; hudDelta.classList.toggle('is-today', d === 0); } hudSpeed.textContent = state.paused ? 'Paused' : SPEED_LABEL[state.speedIdx];
    pauseBtn.textContent = state.paused ? 'Play' : 'Pause'; pauseBtn.setAttribute('aria-pressed', state.paused); }
  speedIn.addEventListener('input', () => { state.speedIdx = +speedIn.value; state.paused = state.speedIdx === 0; syncHud(); });
  document.querySelector('[data-act="today"]').addEventListener('click', () => { state.jd = jdNow(); rebuildOrbits(); syncHud(); });
  pauseBtn.addEventListener('click', () => { state.paused = !state.paused; if (!state.paused && state.speedIdx === 0) { state.speedIdx = 2; speedIn.value = 2; } syncHud(); });

  /* ---------- kamera: miš i skrol ---------- */
  if (!reduce && !isTouch) {
    const toE = gsap.quickTo(state, 'camE', { duration: 1.2, ease: 'power3' }), toY = gsap.quickTo(state, 'camYaw', { duration: 1.2, ease: 'power3' });
    addEventListener('pointermove', e => { toY((e.clientX / innerWidth - .5) * 10); toE(24 + (e.clientY / innerHeight - .5) * -8); });
  }
  new IntersectionObserver(([en]) => { state.inView = en.isIntersecting; }).observe(canvas);

  /* ---------- petlja ---------- */
  let last = performance.now(), lastOrbit = 0;
  gsap.ticker.add(() => {
    const now = performance.now(), dt = Math.min((now - last) / 1000, .1); last = now;
    if (!state.inView) return;
    const running = !state.paused && !state.hoverPause && !panel.classList.contains('is-open');
    const dDays = running ? SPEEDS[state.speedIdx] * dt : 0;
    state.jd += dDays;
    if (Math.abs(state.jd - lastOrbit) > 3650) { rebuildOrbits(); lastOrbit = state.jd; }
    frame(dDays); if (dDays) syncHud();
  });

  /* ---------- uvod ---------- */
  const ui = [document.getElementById('hud'), menu, document.querySelector('.nav_component')];
  function runIntro() {
    const I = state.intro; Object.assign(I, { stars: 0, sun: 0, orbits: 0, fly: 0 });
    const split = new SplitText('#heroTitle', { type: 'words,chars' });
    gsap.set([...ui, '#heroSub', '#heroCta'], { autoAlpha: 0 });
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: done });
    tl.to(I, { stars: 1, duration: .8, ease: 'none' }, 0)
      .to(I, { sun: 1, duration: 1.0, ease: 'back.out(1.6)' }, .4)
      .to(I, { orbits: 1, duration: 1.4, ease: 'power2.inOut' }, 1.0)
      .to(I, { fly: 1, duration: 1.6, ease: 'expo.out' }, 1.6)
      .from(split.chars, { yPercent: 110, autoAlpha: 0, stagger: .018, duration: .7 }, 2.6)
      .to(['#heroSub', '#heroCta'], { autoAlpha: 1, y: 0, duration: .6, stagger: .1 }, 3.2)
      .to(ui, { autoAlpha: 1, duration: .6, stagger: .08 }, 3.4);
    document.getElementById('skip').onclick = () => tl.progress(1);
    addEventListener('keydown', function k(e) { if (e.key === 'Escape') { tl.progress(1); removeEventListener('keydown', k); } });
    function done() { document.getElementById('skip').remove(); try { sessionStorage.setItem('solarIntro', '1'); } catch (e) {} }
  }
  resize(); addEventListener('resize', resize); syncHud(); if (document.fonts) document.fonts.ready.then(resize);
  let seen = false; try { seen = sessionStorage.getItem('solarIntro') === '1'; } catch (e) {}
  if (reduce || seen) { document.getElementById('skip').remove(); if (reduce) gsap.from('.home-hero_ui', { autoAlpha: 0, duration: .4 }); }
  else runIntro();
})();
