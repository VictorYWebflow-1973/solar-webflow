/* Solar · stranica sveta (Webflow CMS šablon „Worlds”, Client-First): akcent, ikonice, živa udaljenost, meseci, galerija, uvodna animacija.
   Podaci dolaze iz CMS-a (vezani elementi) i iz atributa na .page-wrapper: data-world (slug), data-accent, data-moons, data-next.
   Slike (spriteovi) se čitaju iz istog repoa odakle je učitan ovaj fajl (jsDelivr). */
(() => {
  const root = document.querySelector('.page-wrapper[data-world]'); if (!root) return;
  const BASE = ((document.currentScript && document.currentScript.src) || '').replace(/js\/[^/]*$/, '');
  const sprite = id => `${BASE}img/sprites/${id}.webp`;
  const world = root.dataset.world, isStar = world === 'sun', nextSlug = root.dataset.next || 'sun';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const hasGsap = !!window.gsap;
  if (hasGsap) gsap.registerPlugin(...[window.ScrollTrigger, window.SplitText].filter(Boolean));

  /* ----- akcent sveta ----- */
  const acc = (root.dataset.accent || '').trim();
  if (/^#[0-9a-f]{3,8}$/i.test(acc)) root.style.setProperty('--planet', acc);

  /* ----- tekstovi koji zavise od sveta ----- */
  const nameEl = $('.world-hero_name-wrapper .heading-style-display');
  const name = nameEl ? nameEl.textContent.trim() : '';
  const endText = $('.world-end_text');
  if (endText && name) endText.textContent = `See ${isStar ? 'the ' : ''}${name} again among the other worlds, placed where they are today.`;
  const next = $('[data-next-link]');
  if (next) {
    next.href = `/worlds/${nextSlug}`;
    if (nextSlug === 'sun' && !isStar) { next.classList.add('is-restart'); const n = $('.world-end_next-name', next); if (n) n.textContent = 'Start again with the Sun'; }
  }
  $$('[data-world-link]').forEach(a => { if (a.dataset.worldLink) a.href = `/worlds/${a.dataset.worldLink}`; });
  if (world === 'earth') { const l = $('.world-overview_card.is-live .world-overview_label'); if (l && l.firstChild && l.firstChild.nodeType === 3) l.firstChild.textContent = 'From the Sun · '; }

  /* ----- spriteovi: meseci, planete (Sunce), kraj strane ----- */
  const addSprite = (box, id, size) => { if (!box || !id || !BASE) return; const i = new Image(); i.src = sprite(id); i.alt = ''; i.width = i.height = size; i.loading = 'lazy'; i.decoding = 'async'; box.append(i); };
  $$('.world-moons_card[data-moon]').forEach(c => {
    if (c.dataset.planet && c.dataset.planet !== world) { const item = c.closest('.world-moons_item'); if (item) item.remove(); return; }   // rezerva dok filter u Designeru nije postavljen
    addSprite($('.world-moons_sprite', c), c.dataset.moon, 48);
  });
  $$('.world-planets_card[data-world-link]').forEach(a => addSprite($('.world-moons_sprite', a), a.dataset.worldLink, 48));
  $$('.world-moons_diameter').forEach(n => { const v = Number(n.textContent.replace(/[^\d.]/g, '')); if (v) n.textContent = v.toLocaleString('en-US'); });
  const endSprite = $('.world-end_sprite');
  if (endSprite) { addSprite(endSprite, world === 'saturn' ? 'saturn-ringed' : world, 160); if (world === 'saturn') endSprite.classList.add('is-ringed'); }

  /* ----- ikonice u karticama (Lucide), bira se po nazivu kartice ----- */
  const ICONS = {"Diameter": "<circle cx=\"19\" cy=\"19\" r=\"2\"/><circle cx=\"5\" cy=\"5\" r=\"2\"/><path d=\"M6.48 3.66a10 10 0 0 1 13.86 13.86\"/><path d=\"m6.41 6.41 11.18 11.18\"/><path d=\"M3.66 6.48a10 10 0 0 0 13.86 13.86\"/>", "Mass": "<circle cx=\"12\" cy=\"5\" r=\"3\"/><path d=\"M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z\"/>", "Gravity": "<path d=\"M12 2v14\"/><path d=\"m19 9-7 7-7-7\"/><circle cx=\"12\" cy=\"21\" r=\"1\"/>", "Length of day": "<path d=\"M12 2v8\"/><path d=\"m4.93 10.93 1.41 1.41\"/><path d=\"M2 18h2\"/><path d=\"M20 18h2\"/><path d=\"m19.07 10.93-1.41 1.41\"/><path d=\"M22 22H2\"/><path d=\"m8 6 4-4 4 4\"/><path d=\"M16 18a4 4 0 0 0-8 0\"/>", "Year": "<path d=\"M20.341 6.484A10 10 0 0 1 10.266 21.85\"/><path d=\"M3.659 17.516A10 10 0 0 1 13.74 2.152\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/><circle cx=\"19\" cy=\"5\" r=\"2\"/><circle cx=\"5\" cy=\"19\" r=\"2\"/>", "Mean temperature": "<path d=\"M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z\"/>", "Average distance from the Sun": "<path d=\"M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z\"/><path d=\"m14.5 12.5 2-2\"/><path d=\"m11.5 9.5 2-2\"/><path d=\"m8.5 6.5 2-2\"/><path d=\"m17.5 15.5 2-2\"/>", "__live": "<path d=\"M18 12a6 6 0 00-6-6\"/><path d=\"M2.824 10.459a8 8 0 0010.717 10.717c.558-.276.623-1.012.183-1.452l-9.448-9.448c-.44-.44-1.176-.375-1.452.183\"/><path d=\"M22 12A10 10 0 0012 2\"/><path d=\"m9 15 4-4\"/>", "Surface gravity": "<path d=\"M12 2v14\"/><path d=\"m19 9-7 7-7-7\"/><circle cx=\"12\" cy=\"21\" r=\"1\"/>", "Rotation (16° latitude)": "<path d=\"m15.194 13.707 3.814 1.86-1.86 3.814\"/><path d=\"M16.47214 7.52786 A 5 10 0 1 0 13 21.79796\"/><path d=\"M21.79796 11 A 10 5 0 1 0 19 15.57071\"/>", "Surface temperature": "<path d=\"M12 2v2\"/><path d=\"M12 8a4 4 0 0 0-1.645 7.647\"/><path d=\"M2 12h2\"/><path d=\"M20 14.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z\"/><path d=\"m4.93 4.93 1.41 1.41\"/><path d=\"m6.34 17.66-1.41 1.41\"/>", "Core temperature": "<path d=\"M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4\"/>", "Light to Earth": "<line x1=\"10\" x2=\"14\" y1=\"2\" y2=\"2\"/><line x1=\"12\" x2=\"15\" y1=\"14\" y2=\"11\"/><circle cx=\"12\" cy=\"14\" r=\"8\"/>"};
  const svgOf = inner => `<svg class="world-overview_icon" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const cards = $$('.world-overview_card');
  cards.forEach(card => {
    const label = $('.world-overview_label', card); if (!label) return;
    const key = card.classList.contains('is-live') ? '__live' : label.textContent.trim();
    const inner = ICONS[key]; if (!inner) return;
    const wrap = document.createElement('span'); wrap.className = 'world-overview_icon-wrapper'; wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = svgOf(inner) + svgOf(inner); wrap.firstChild.classList.add('is-ghost');
    card.prepend(wrap);
  });

  /* ----- živa udaljenost (JPL elementi) ----- */
  const D2R = Math.PI / 180, AU_KM = 149597870.7;
  function helio(id, jd) {
    const [el, rt] = SOLAR_ELEMENTS[id]; const T = (jd - 2451545) / 36525;
    const a = el[0] + rt[0] * T, e = el[1] + rt[1] * T, I = (el[2] + rt[2] * T) * D2R, L = el[3] + rt[3] * T, vp = el[4] + rt[4] * T, Om = (el[5] + rt[5] * T) * D2R, w = vp * D2R - Om;
    let M = ((L - vp) % 360 + 540) % 360 - 180; M *= D2R; let E = M + e * Math.sin(M);
    for (let k = 0; k < 8; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    const xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
    const cw = Math.cos(w), sw = Math.sin(w), cO = Math.cos(Om), sO = Math.sin(Om), cI = Math.cos(I), sI = Math.sin(I);
    return [(cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp, (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp, (sw * sI) * xp + (cw * sI) * yp];
  }
  const fmtKm = km => km >= 1e9 ? (km / 1e9).toFixed(2) + ' billion km' : (km / 1e6).toFixed(1) + ' million km';
  $$('[data-live-date]').forEach(n => n.textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
  const live = $('.world-overview_card.is-live .world-overview_value');
  if (live && window.SOLAR_ELEMENTS && (world === 'sun' || SOLAR_ELEMENTS[world])) {
    const jd = Date.now() / 86400000 + 2440587.5, earth = helio('earth', jd);
    const d = (world === 'sun' || world === 'earth') ? Math.hypot(...earth) : (h => Math.hypot(h[0] - earth[0], h[1] - earth[1], h[2] - earth[2]))(helio(world, jd));
    const target = d * AU_KM;
    if (reduce || !hasGsap || !window.ScrollTrigger) live.textContent = fmtKm(target);
    else { const o = { v: 0 }; gsap.to(o, { v: target, duration: 1.6, delay: .4 + 7 * .06, ease: 'power3.out', scrollTrigger: { trigger: '.world-overview_cards', start: 'top 85%' }, onUpdate: () => live.textContent = fmtKm(o.v) }); }
  }

  /* ----- galerija: potpisi (alt + izvor iz polja „Gallery credits”, red po slici) i lightbox ----- */
  const credits = ($('.world-gallery_credits') || {}).textContent ? $('.world-gallery_credits').textContent.split(/\n+/).map(s => s.trim()) : [];
  const shots = $$('[data-gallery-open]');
  shots.forEach((b, i) => {
    const img = $('img', b), cap = b.parentElement && $('.world-gallery_caption', b.parentElement);
    const alt = img ? img.alt : '', cr = credits[i] || '';
    b.dataset.caption = cr ? `${alt} · ${cr}` : alt;
    if (cap) cap.innerHTML = `${alt}${cr ? `<span>Image: ${cr.replace(/</g, '&lt;')}</span>` : ''}`;
    b.setAttribute('role', 'button'); b.tabIndex = 0; b.setAttribute('aria-label', `Open image: ${alt}`);
  });
  if (shots.length) {
    const lb = document.createElement('dialog'); lb.className = 'world-lightbox'; lb.setAttribute('aria-label', 'Gallery');
    const chev = d => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
    lb.innerHTML = `<div class="world-lightbox_bar"><span class="text-style-label world-lightbox_count" aria-live="polite"></span><button class="button is-secondary world-lightbox_close" type="button" data-close>Close</button></div><div class="world-lightbox_stage"><button class="world-lightbox_nav is-prev" type="button" data-prev aria-label="Previous image">${chev('m15 18-6-6 6-6')}</button><img alt=""><button class="world-lightbox_nav is-next" type="button" data-next aria-label="Next image">${chev('m9 18 6-6-6-6')}</button></div><p class="world-lightbox_caption"></p>`;
    document.body.append(lb);
    const lbImg = $('img', lb), lbCap = $('.world-lightbox_caption', lb), lbCount = $('.world-lightbox_count', lb);
    let cur = 0;
    const show = (i, dir = 0) => {
      cur = (i + shots.length) % shots.length; const b = shots[cur], im = $('img', b);
      const swap = () => { lbImg.src = im ? (im.currentSrc || im.src) : ''; lbImg.alt = im ? im.alt : ''; lbCap.textContent = b.dataset.caption; lbCount.textContent = `${cur + 1} / ${shots.length}`; };
      if (dir && hasGsap && !reduce && lb.open) gsap.timeline().to(lbImg, { x: -40 * dir, opacity: 0, duration: .18, ease: 'power2.in', onComplete: swap }).fromTo(lbImg, { x: 40 * dir }, { x: 0, opacity: 1, duration: .32, ease: 'power3.out' });
      else swap();
    };
    const open = i => { show(i); lb.showModal(); if (hasGsap && !reduce) gsap.fromTo(lb, { opacity: 0, scale: .98 }, { opacity: 1, scale: 1, duration: .25, ease: 'power2.out' }); };
    shots.forEach((b, i) => { b.addEventListener('click', e => { e.preventDefault(); open(i); }); b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } }); });
    $('[data-close]', lb).addEventListener('click', () => lb.close());
    $('[data-prev]', lb).addEventListener('click', () => show(cur - 1, -1));
    $('[data-next]', lb).addEventListener('click', () => show(cur + 1, 1));
    lb.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1, 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1, -1); } });
    let sx = null; lb.addEventListener('pointerdown', e => { sx = e.clientX; }); lb.addEventListener('pointerup', e => { if (sx !== null && Math.abs(e.clientX - sx) > 50) show(cur + (e.clientX < sx ? 1 : -1), e.clientX < sx ? 1 : -1); sx = null; });
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  }

  /* ----- meseci: mala animacija (stvarni odnos perioda, ilustrativna faza) ----- */
  const mc = $('#moonCanvas');
  const ms = (window.SOLAR_MOONS || []).filter(m => m[2] === world);
  if (mc && ms.length && getComputedStyle(mc).display !== 'none') {
    const ctx = mc.getContext('2d');
    mc.setAttribute('aria-label', `Animation of ${name}'s largest moons orbiting the planet`);
    const load = id => { const i = new Image(); i.src = sprite(id); return i; };
    const pimg = load(world), mimgs = ms.map(m => load(m[0]));
    let W, H, t = 0, hoverId = null;
    const size = () => { const r = mc.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; mc.width = W * d; mc.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    size(); addEventListener('resize', size);
    $$('.world-moons_card[data-moon]').forEach(li => { li.addEventListener('mouseenter', () => hoverId = li.dataset.moon); li.addEventListener('mouseleave', () => hoverId = null); });
    const minP = Math.min(...ms.map(m => Math.abs(m[4])));
    const draw = dt => {
      if (!reduce) t += dt;
      ctx.clearRect(0, 0, W, H); const cx = W / 2, cy = H / 2, pr = Math.min(W, H) * .16;
      ms.forEach((m, i) => { const r = pr * 1.5 + (i + 1) * (Math.min(W, H) * .32 / ms.length) + 8;
        ctx.beginPath(); ctx.ellipse(cx, cy, r, r * .42, 0, 0, 7); ctx.strokeStyle = m[0] === hoverId ? 'rgba(201,155,255,.8)' : 'rgba(201,155,255,.2)'; ctx.stroke(); });
      const items = ms.map((m, i) => { const r = pr * 1.5 + (i + 1) * (Math.min(W, H) * .32 / ms.length) + 8;
        const a = (t / Math.abs(m[4])) * minP * Math.sign(m[4]) * 1.2 + i * 1.7; return { m, i, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * .42, z: Math.sin(a) }; });
      const drawMoon = it => { const s = Math.max(6, 6 + Math.log10(it.m[3]) * 4), im = mimgs[it.i];
        if (im.complete && im.naturalWidth) ctx.drawImage(im, it.x - s, it.y - s, s * 2, s * 2);
        if (it.m[0] === hoverId) { ctx.strokeStyle = 'rgba(201,155,255,.9)'; ctx.beginPath(); ctx.arc(it.x, it.y, s + 4, 0, 7); ctx.stroke(); } };
      items.filter(i => i.z < 0).forEach(drawMoon);
      if (pimg.complete && pimg.naturalWidth) ctx.drawImage(pimg, cx - pr, cy - pr, pr * 2, pr * 2);
      items.filter(i => i.z >= 0).forEach(drawMoon);
    };
    let last = performance.now(), visible = false;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = performance.now(); }).observe(mc);
    const tick = () => { if (visible) { const n = performance.now(); draw(Math.min((n - last) / 1000, .1)); last = n; } };
    if (hasGsap) gsap.ticker.add(tick); else (function loop() { tick(); requestAnimationFrame(loop); })();
  }

  /* ----- ime staje u zadatu širinu (desktop: kolone 1–7, da ne prelazi preko fotografije) i fotografija u hero delu ----- */
  const layout = $('.world-hero_layout'), heroImg = $('.world-hero_image'), hero = $('.section_world-hero');
  function fitName() {
    if (!nameEl || !layout) return; nameEl.style.fontSize = '';
    const cs = getComputedStyle(layout), cw = layout.getBoundingClientRect().width, g = parseFloat(cs.columnGap) || 24;
    const cols = cs.gridTemplateColumns.split(' ').length, col = (cw - (cols - 1) * g) / cols;
    const maxW = innerWidth >= 992 ? 7 * col + 6 * g : cw;
    const base = parseFloat(getComputedStyle(nameEl).fontSize);
    const prev = nameEl.style.width; nameEl.style.width = 'max-content'; const w = nameEl.getBoundingClientRect().width; nameEl.style.width = prev;
    if (w > maxW) nameEl.style.fontSize = Math.floor(base * maxW / w) + 'px';
  }
  fitName();
  if (document.fonts) document.fonts.ready.then(() => { fitName(); if (window.ScrollTrigger) ScrollTrigger.refresh(); });
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(fitName, 150); });

  if (reduce || !hasGsap || !window.ScrollTrigger) return;

  /* ----- ikonice: sive linije, pa se boja „uliva” crtanjem ----- */
  $$('.world-overview_icon-wrapper').forEach((wrap, ci) => {
    const svg = wrap.lastElementChild, parts = svg.querySelectorAll('path, circle, line, rect, polyline, polygon, ellipse');
    parts.forEach(p => { const L = Math.ceil(p.getTotalLength ? p.getTotalLength() : 60) + 1; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    const tl = gsap.timeline({ delay: .3 + ci * .06, scrollTrigger: { trigger: '.world-overview_cards', start: 'top 85%' } });
    tl.to(parts, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: .12 })
      .fromTo(svg, { filter: 'drop-shadow(0 0 0px rgba(201,155,255,0))' }, { filter: 'drop-shadow(0 0 6px currentColor)', duration: .35, yoyo: true, repeat: 1, ease: 'sine.inOut' }, '-=.2');
    wrap.parentElement.addEventListener('mouseenter', () => { if (tl.isActive()) return; gsap.fromTo(parts, { strokeDashoffset: (i, el) => el.style.strokeDasharray }, { strokeDashoffset: 0, duration: .8, ease: 'power2.inOut', stagger: .08 }); });
  });

  /* ----- hero: planeta se pojavi na nasumičnom mestu, uveća se do svoje pozicije, pa tekst (SplitText + varijabilna težina) ----- */
  if (nameEl && heroImg && hero) {
    const split = window.SplitText ? new SplitText(nameEl, { type: 'chars' }) : null;
    const chars = split ? split.chars : [nameEl];
    const textIn = ['.world-hero_kind', '.world-hero_note', '.world-hero_intro', '.world-hero_hud-item', '.world-hero_credit'];
    gsap.set([...textIn, ...chars, heroImg], { opacity: 0 });
    const intro = () => {
      const hr = hero.getBoundingClientRect(), ir = heroImg.getBoundingClientRect();
      const dx = hr.width * gsap.utils.random(.12, .88) - (ir.left - hr.left + ir.width / 2), dy = hr.height * gsap.utils.random(.18, .82) - (ir.top - hr.top + ir.height / 2);
      let again = false; try { again = sessionStorage.getItem('solarWorldSeen') === '1'; sessionStorage.setItem('solarWorldSeen', '1'); } catch (e) {}
      gsap.timeline({ defaults: { ease: 'power4.out' } })            // ≈ 2,6 s; tekst kreće dok planeta još raste
        .fromTo(heroImg, { x: dx, y: dy, scale: .05, opacity: 0 }, { opacity: 1, duration: .4, ease: 'power1.out' }, 0)
        .to(heroImg, { scale: .065, duration: .25, yoyo: true, repeat: 1, ease: 'sine.inOut' }, .2)
        .to(heroImg, { x: 0, y: 0, scale: 1, duration: 1.2, ease: 'expo.inOut' }, .6)
        .from('.world-hero_orbits ellipse', { scale: .6, transformOrigin: '76% 52%', opacity: 0, stagger: .1, duration: 1.2 }, .8)
        .fromTo(chars, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: .04, duration: .9 }, 1.2)
        .fromTo(chars, { fontVariationSettings: '"wght" 800' }, { fontVariationSettings: '"wght" 400', stagger: .04, duration: 1.0, ease: 'power2.out' }, 1.35)
        .fromTo(['.world-hero_kind', '.world-hero_note', '.world-hero_intro'], { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: .08, duration: .7 }, 1.5)
        .fromTo('.world-hero_hud-item', { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: .06, duration: .7 }, 1.7)
        .to('.world-hero_credit', { opacity: 1, duration: .6 }, 2.0)
        .timeScale(again ? 2.2 : 1);                                   // druga i sledeće planete u sesiji: ≈ 1,2 s
    };
    if (heroImg.complete && heroImg.naturalWidth) intro(); else { heroImg.addEventListener('load', intro, { once: true }); heroImg.addEventListener('error', intro, { once: true }); }
    if (split) {
      nameEl.addEventListener('mouseenter', () => gsap.to(chars, { fontVariationSettings: '"wght" 750', stagger: .02, duration: .4, overwrite: 'auto' }));
      nameEl.addEventListener('mouseleave', () => gsap.to(chars, { fontVariationSettings: '"wght" 400', stagger: .02, duration: .6, overwrite: 'auto' }));
    }
    gsap.to('.world-hero_image-wrapper', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ----- sekcije ----- */
  $$('.world-section_head').forEach(h => {
    const n = $('.world-section_number', h), t = $('h2', h);
    if (n) gsap.from(n, { yPercent: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 85%' } });
    if (t) gsap.from(t, { x: -24, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 85%' } });
  });
  const from = (sel, vars, trigger) => { const els = $$(sel); if (els.length) gsap.from(els, { ...vars, scrollTrigger: { trigger: trigger || els[0], start: 'top 85%' } }); };
  from('.world-overview_card', { y: 32, opacity: 0, stagger: .06, duration: .8, ease: 'power3.out' }, '.world-overview_cards');
  from('.world-moons_item, .world-planets_item', { y: 16, opacity: 0, stagger: .06, duration: .7, ease: 'power3.out' }, '.world-moons_layout');
  from('.world-story_text', { y: 32, opacity: 0, duration: 1 });
  const sImg = $('.world-story_image'); if (sImg) gsap.fromTo(sImg, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.2, ease: 'power4.inOut', scrollTrigger: { trigger: '.world-story_figure', start: 'top 85%' } });
  from('.world-story_fact', { y: 32, opacity: 0, stagger: .12, duration: .9, ease: 'power3.out' }, '.world-story_facts');
  $$('.world-gallery_item').forEach((g, i) => gsap.from(g, { y: 48, opacity: 0, duration: .9, delay: (i % 3) * .08, ease: 'power3.out', scrollTrigger: { trigger: g, start: 'top 85%' } }));
  from('.world-dwarfs_card', { y: 32, opacity: 0, stagger: .1, duration: .8 }, '.world-dwarfs_list');

  /* ----- kraj strane: orbite se vrte samo dok je odeljak na ekranu ----- */
  if ($('.section_world-end')) {
    const spins = [['.world-end_orbit.is-1', 360, 120], ['.world-end_orbit.is-2', -360, 80], ['.world-end_orbit.is-3', 360, 50]].map(([el, r, d]) => gsap.to(el, { rotate: r, duration: d, repeat: -1, ease: 'none', paused: true }));
    ScrollTrigger.create({ trigger: '.section_world-end', start: 'top bottom', end: 'bottom top', onToggle: st => spins.forEach(t => st.isActive ? t.play() : t.pause()) });
    gsap.timeline({ scrollTrigger: { trigger: '.section_world-end', start: 'top 85%' }, defaults: { ease: 'power3.out' } })
      .from('.world-end_visual', { scale: .8, opacity: 0, duration: 1.4 }, 0)
      .from(['.world-end_kicker', '.world-end_title', '.world-end_text', '.world-end_actions'], { y: 32, opacity: 0, stagger: .1, duration: .9 }, .1);
  }
})();
