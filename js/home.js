/* Solar · početna: Scale, Axis, Compare, CTA */
(() => {
  const BASE = ((document.currentScript && document.currentScript.src) || '').replace(/js\/[^/]*$/, '');   // adresa repoa na jsDelivr-u
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = 299792.458; // km/s
  // NASA Planetary Fact Sheet: prosečna udaljenost od Sunca (10^6 km) i prečnik (km)
  const W = [
    ['sun', 'Sun', 0, 1391400], ['mercury', 'Mercury', 57.9, 4879], ['venus', 'Venus', 108.2, 12104], ['earth', 'Earth', 149.6, 12756],
    ['mars', 'Mars', 228.0, 6792], ['jupiter', 'Jupiter', 778.5, 142984], ['saturn', 'Saturn', 1432.0, 120536],
    ['uranus', 'Uranus', 2867.0, 51118], ['neptune', 'Neptune', 4515.0, 49528], ['pluto', 'Pluto', 5906.4, 2376]
  ];
  const fmtT = s => { const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = Math.floor(s % 60); return [h, m, x].map(v => String(v).padStart(2, '0')).join(':'); };
  const fmtLt = s => s < 3600 ? `${Math.floor(s / 60)} min ${Math.round(s % 60)} s` : `${Math.floor(s / 3600)} h ${Math.round(s % 3600 / 60)} min`;
  const fmtD = mkm => mkm >= 1000 ? `${(mkm / 1000).toFixed(2)} billion km` : `${mkm.toFixed(1)} million km`;
  const nw = t => `<span class="text-style-nowrap">${t}</span>`;

  /* ---------- 02 Scale ---------- */
  const track = document.getElementById('scaleTrack'), ray = document.getElementById('scaleRay');
  const timeEl = document.getElementById('lightTime'), distEl = document.getElementById('lightDist');
  const mobile = innerWidth < 768;
  const PX_PER_MKM = mobile ? 2.2 : 3.0;            // jedna razmera za sve udaljenosti
  const START = mobile ? 120 : 360;
  const trackLen = START + 5906.4 * PX_PER_MKM + innerWidth * .6;
  track.style.width = trackLen + 'px';
  const sun = document.createElement('div'); sun.className = 'home-scale_sun'; track.appendChild(sun);
  const bodies = W.slice(1).map(([id, name, d, diam]) => {
    const el = document.createElement('div'); el.className = 'home-scale_body';
    const px = Math.round(Math.max(10, 6 + Math.log10(diam / 1000) * 22));
    const lt = d * 1e6 / C, ringed = id === 'saturn';
    // Saturn sa prstenovima: širina slike = 2,32 × prečnik planete, visina = 0,415 × širina
    const iw = ringed ? Math.round(px * 2.32) : px, ih = ringed ? Math.round(px * 2.32 * .415) : px;
    el.innerHTML = `<img src="${BASE}img/sprites/${ringed ? 'saturn-ringed' : id}.webp" width="${iw}" height="${ih}" alt=""><span class="text-style-label">${name}</span><span class="text-style-data">${fmtD(d)}</span><span class="text-style-data">light: ${fmtLt(lt)}</span>`;
    el.style.left = (START + d * PX_PER_MKM) + 'px'; track.appendChild(el);
    if (['venus', 'mars', 'saturn', 'neptune'].includes(id)) el.classList.add('is-up');
    return { el, d, px, iw, ih, img: el.querySelector('img'), txt: el.querySelectorAll('.text-style-label, .text-style-data') };
  });
  for (let au = 5; au <= 40; au += 5) { const t = document.createElement('div'); t.className = 'home-scale_tick'; t.style.left = (START + au * 149.6 * PX_PER_MKM) + 'px'; t.innerHTML = `<span>${au} AU</span>`; track.appendChild(t); }
  // asteroidni pojas: glavni pojas ≈ 2.2–3.2 AU; Ceres a = 2.77 AU (JPL SBDB)
  const belt = document.createElement('div'); belt.className = 'home-scale_belt';
  belt.style.left = (START + 2.2 * 149.6 * PX_PER_MKM) + 'px'; belt.style.width = (1.0 * 149.6 * PX_PER_MKM) + 'px';
  belt.innerHTML = '<span>Asteroid belt · Ceres</span>'; track.appendChild(belt);
  // orijentiri na svakih milijardu km: koliko dugo putuje svetlost (izračunato, c = 299,792.458 km/s)
  for (let b = 1; b <= 5; b++) { const m = document.createElement('div'); m.className = 'home-scale_mile';
    m.style.left = (START + b * 1000 * PX_PER_MKM) + 'px'; m.innerHTML = `<b>${b} billion km</b><span>light: ${fmtLt(b * 1e9 / C)}</span>`; track.appendChild(m); }
  const maxMkm = 5906.4, travel = trackLen - innerWidth;
  // minimapa: cela putanja u jednoj liniji, sa položajem zraka
  const map = document.createElement('div'); map.className = 'home-scale_map';
  map.innerHTML = '<div class="home-scale_map-inner"><div class="home-scale_map-line"></div><div class="home-scale_map-fill"></div><div class="home-scale_map-cursor"></div></div>';
  document.querySelector('.home-scale_note').before(map);
  const mapIn = map.firstElementChild, mapFill = map.querySelector('.home-scale_map-fill'), mapCur = map.querySelector('.home-scale_map-cursor');
  const labMin = 700, MOB_LAB = ['uranus', 'pluto'];             // na telefonu samo Inner, Uranus, Pluto
  const dots = W.slice(1).map(([id, name, d]) => { const el = document.createElement('div'); const lab = mobile ? MOB_LAB.includes(id) : d > labMin; el.className = 'home-scale_map-dot' + (lab ? ' is-labeled' : '') + (id === 'pluto' ? ' is-end' : '');
    el.style.left = (d / maxMkm * 100) + '%'; el.innerHTML = `<span>${lab ? name : ''}</span>`; mapIn.appendChild(el); return { el, d }; });
  const inner = document.createElement('div'); inner.className = 'home-scale_map-dot is-labeled'; inner.style.cssText = `left:${(140 / maxMkm) * 100}%;background:none`; inner.innerHTML = '<span>Inner</span>'; mapIn.appendChild(inner);
  // pređena tela se ne gube iz kadra: pakuju se jedno do drugog uz levu marginu (razmak NIJE u razmeri)
  // Sunce ostaje u kadru (ne putuje sa trakom); pakovanje počinje odmah iza njegovog diska
  const K = mobile ? .45 : 1, GAP = mobile ? 3 : 12, TIP = mobile ? .8 : .55;
  let slots = [];
  const layoutSlots = () => {
    const M = document.querySelector('.home-scale_head').getBoundingClientRect().left;
    const sr = sun.getBoundingClientRect(), sunEdge = sr.left + sr.width / 2 + sr.width * .37;  // Sunce stoji u kadru; svetli disk ≈ 0,52 × 0,707 × širina
    let x = Math.max(M, sunEdge) + GAP;
    slots = bodies.map(b => { const w = b.iw * K, c = x + w / 2; x += w + GAP; return c; });
  };
  layoutSlots(); addEventListener('resize', layoutSlots);
  const FADE = mobile ? 110 : 260;                                    // px puta zraka posle tela za fadeout teksta
  const setScale = p => {
    const mkm = p * maxMkm, secs = mkm * 1e6 / C, rayX = START + mkm * PX_PER_MKM;
    ray.style.transform = `translateY(-50%) scaleX(${rayX / trackLen})`;
    const tx = Math.min(Math.max(rayX - innerWidth * TIP, 0), travel);
    gsap.set(track, { x: -tx });
    sun.style.transform = `translate(${tx}px, -50%)`;
    bodies.forEach((b, i) => {
      const natural = START + b.d * PX_PER_MKM, screen = natural - tx, packed = screen < slots[i];
      b.el.style.setProperty('--dx', (packed ? slots[i] + tx - natural : 0) + 'px');
      const k = packed ? K : 1, w = b.iw * k, h = b.ih * k;
      b.img.style.width = w + 'px'; b.img.style.height = h + 'px'; b.el.style.setProperty('--ih', h + 'px');
      const f = Math.min(1, Math.max(0, (rayX - natural) / FADE));
      b.txt.forEach(t => { t.style.opacity = 1 - f; });
      b.el.classList.toggle('is-packed', packed);
    });
    timeEl.textContent = fmtT(secs);
    distEl.textContent = `${fmtD(mkm)} from the Sun`;
    bodies.forEach(b => b.el.classList.toggle('is-hit', b.d <= mkm));
    mapFill.style.width = mapCur.style.left = (p * 100) + '%';
    dots.forEach(b => b.el.classList.toggle('is-hit', b.d <= mkm));
  };
  if (reduce) setScale(1);
  else { setScale(0); ScrollTrigger.create({ trigger: '.section_home-scale', start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: s => setScale(s.progress) }); }

  /* ---------- 03 Axis ---------- */
  const list = document.getElementById('axisList');
  const second = ['99.8% of the Solar System\'s mass'];
  W.forEach(([id, name, d, diam], i) => {
    const li = document.createElement('li'); li.className = 'home-axis_item';
    const px = id === 'sun' ? 96 : Math.round(24 + Math.log10(diam / 1000) * 24);
    const info = id === 'sun' ? `${nw('1.4 million km across')} · ${nw(second[0])}` : `${nw(diam.toLocaleString('en-US') + ' km across')} · ${nw(fmtD(d) + ' from the Sun')}`;
    const sat = id === 'saturn', iw = sat ? Math.round(px * 2.25) : px, ih = sat ? Math.round(px * 2.25 * .415) : px;
    li.innerHTML = `<img src="${BASE}img/sprites/${sat ? 'saturn-ringed' : id}.webp" width="${iw}" height="${ih}" alt="">
      <div class="home-axis_text"><span class="text-style-label">${String(i).padStart(2, '0')}</span><a href="/worlds/${id}"><span class="home-axis_name">${name}</span></a><span class="text-style-data">${info}</span></div>`;
    list.appendChild(li);
  });
  if (!reduce) {
    gsap.to('#axisLine', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#axisWrap', start: 'top 70%', end: 'bottom 70%', scrub: true } });
    gsap.utils.toArray('.home-axis_item').forEach((li, i) => {
      gsap.from(li.querySelector('img'), { scale: 0, duration: .8, ease: 'back.out(1.4)', scrollTrigger: { trigger: li, start: 'top 85%' } });
      gsap.from(li.querySelector('.home-axis_text'), { x: i % 2 ? -32 : 32, autoAlpha: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: li, start: 'top 85%' } });
    });
  } else gsap.set('#axisLine', { scaleY: 1 });

  /* ---------- 04 Compare ---------- */
  const chips = document.getElementById('cmpChips'), stage = document.getElementById('cmpStage');
  // Webflow sliku bez fajla ne pravi: dve slike za poređenje i Sunce u CTA dodaje skripta
  if (!document.getElementById('cmpA')) stage.innerHTML = '<img id="cmpA" alt=""><img id="cmpB" alt="">';
  const ctaVis = document.querySelector('.home-cta_visual');
  if (ctaVis && !ctaVis.querySelector('img')) ctaVis.insertAdjacentHTML('beforeend', `<img class="home-cta_sun" src="${BASE}img/sprites/sun.webp" alt="" width="160" height="160">`);
  const A = document.getElementById('cmpA'), B = document.getElementById('cmpB');
  const sel = { A: 'earth', B: 'jupiter' }; let nextSlot = 'A';
  W.forEach(([id, name]) => { const b = document.createElement('button'); b.type = 'button'; b.dataset.id = id; b.textContent = name; chips.appendChild(b);
    b.addEventListener('click', () => { if (sel.A === id || sel.B === id) return; sel[nextSlot] = id; nextSlot = nextSlot === 'A' ? 'B' : 'A'; renderCmp(true); }); });
  function renderCmp(anim) {
    const a = W.find(w => w[0] === sel.A), b = W.find(w => w[0] === sel.B);
    const big = Math.max(a[3], b[3]);
    // Saturn sa prstenovima: planeta zauzima 504/1188 širine slike, prstenovi u stvarnom odnosu (spoljni rub A prstena ≈ 2,33 R)
    const RING = { k: 2.3571 * 504 / 512, hr: .415, pad: .0406 };
    const wf = w => (w[0] === 'saturn' ? RING.k : 1) * w[3] / big;          // širina u jedinicama maxH
    const gap = parseFloat(getComputedStyle(stage).columnGap) || 64;
    const maxH = Math.min(stage.clientHeight - 24, (stage.clientWidth - gap - 16) / (wf(a) + wf(b)));
    const size = w => Math.max(2, Math.round(maxH * w[3] / big));
    // Jupiter je spljošten: sprajt ima providan pojas na dnu, pa ga spuštamo na zajedničku liniju
    const PAD = { jupiter: 20 / 512 };
    [[A, a], [B, b]].forEach(([img, w]) => {
      const s = size(w); let wd = s, ht = s, y = Math.round(s * (PAD[w[0]] || 4 / 512));
      if (w[0] === 'saturn') { wd = Math.round(s * RING.k); ht = Math.round(wd * RING.hr); y = Math.round(ht * RING.pad); img.src = BASE + 'img/sprites/saturn-ringed.webp'; }
      else img.src = `${BASE}img/sprites/${w[0]}.webp`;
      img.alt = `${w[1]}, drawn to scale`;
      if (anim && !reduce) gsap.to(img, { width: wd, height: ht, y, duration: .9, ease: 'expo.out', overwrite: 'auto' }); else gsap.set(img, { width: wd, height: ht, y }); });
    document.getElementById('cmpAName').textContent = a[1]; document.getElementById('cmpBName').textContent = b[1];
    const line = w => `${nw(w[3].toLocaleString('en-US') + ' km across')}<br>${w[2] ? fmtD(w[2]) + ' from the Sun' : 'centre of the system'}`;
    document.getElementById('cmpAData').innerHTML = line(a);
    document.getElementById('cmpBData').innerHTML = line(b);
    const [L, S] = a[3] >= b[3] ? [a, b] : [b, a]; const r = L[3] / S[3];
    document.getElementById('cmpDiff').textContent = `${L[1]} is ${r >= 10 ? Math.round(r).toLocaleString('en-US') : r.toFixed(1)}× wider than ${S[1]}`;
    [...chips.children].forEach(c => { const on = c.dataset.id === sel.A || c.dataset.id === sel.B; c.setAttribute('aria-pressed', on); c.dataset.slot = c.dataset.id === sel.A ? 'A' : c.dataset.id === sel.B ? 'B' : ''; });
  }
  renderCmp(false); addEventListener('resize', () => renderCmp(false));

  /* ---------- 05 CTA ---------- */
  if (!reduce) {
    const spins = [['.home-cta_orbit.is-1', 360, 120], ['.home-cta_orbit.is-2', -360, 80], ['.home-cta_orbit.is-3', 360, 50]].map(([el, r, d]) => gsap.to(el, { rotate: r, duration: d, repeat: -1, ease: 'none', paused: true }));
    ScrollTrigger.create({ trigger: '.section_home-cta', start: 'top bottom', end: 'bottom top', onToggle: st => spins.forEach(t => st.isActive ? t.play() : t.pause()) });  // rotacija samo dok je sekcija na ekranu
    gsap.from('.home-cta_visual', { scale: .8, autoAlpha: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.section_home-cta', start: 'top 85%' } });
    const t = new SplitText('#ctaTitle', { type: 'chars' });
    gsap.from(t.chars, { yPercent: 100, autoAlpha: 0, stagger: .03, duration: .9, ease: 'power4.out', scrollTrigger: { trigger: '.section_home-cta', start: 'top 85%' } });
    gsap.fromTo(t.chars, { fontVariationSettings: '"wght" 800' }, { fontVariationSettings: '"wght" 400', stagger: .03, duration: 1.2, scrollTrigger: { trigger: '.section_home-cta', start: 'top 85%' } });
    const title = document.getElementById('ctaTitle');
    title.addEventListener('mouseenter', () => gsap.to(t.chars, { fontVariationSettings: '"wght" 750', stagger: .015, duration: .35, overwrite: 'auto' }));
    title.addEventListener('mouseleave', () => gsap.to(t.chars, { fontVariationSettings: '"wght" 400', stagger: .015, duration: .5, overwrite: 'auto' }));
    // svaki naslov dobija svoj okidač kad uđe na ekran (ranije su se svi pokretali na početku Scale sekcije)
    [['.home-scale_head', '.home-scale_head > *'], ['.section_home-axis', '.home-axis_heading-wrapper'], ['.section_home-compare', '.home-compare_heading-wrapper, .home-compare_text']].forEach(([trg, els]) =>
      gsap.from(els, { y: 24, autoAlpha: 0, duration: .8, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: trg, start: 'top 85%' } }));
  }
})();
