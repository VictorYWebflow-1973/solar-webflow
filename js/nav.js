/* Solar · nav (Webflow, Client-First): pozadina posle skrola, kosmička pozadina, burger meni (≤991).
   Slike se čitaju iz istog repoa odakle je učitan ovaj fajl (jsDelivr), pa nema ručno upisanih adresa. */
(() => {
  const n = document.querySelector('.nav_component'); if (!n) return;
  const A = ((document.currentScript && document.currentScript.src) || '').replace(/js\/[^/]*$/, '');
  const solid = () => n.classList.toggle('is-solid', scrollY > 40 || document.body.classList.contains('nav-open'));
  solid(); addEventListener('scroll', solid, { passive: true });

  // kosmička pozadina: poseban fiksni sloj; paralaksa (najviše 5 % visine ekrana) menja samo njegov transform
  const cosmos = document.createElement('div'); cosmos.className = 'cosmos'; cosmos.setAttribute('aria-hidden', 'true');
  if (A) { cosmos.style.setProperty('--cosmos-land', `url("${A}img/bg/cosmos-land.webp")`); cosmos.style.setProperty('--cosmos-port', `url("${A}img/bg/cosmos-port.webp")`); }
  document.body.prepend(cosmos);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    let tick = false;
    const bg = () => { tick = false; const max = document.documentElement.scrollHeight - innerHeight;
      cosmos.style.transform = `translate3d(0, ${(-(max > 0 ? scrollY / max : 0) * innerHeight * .05).toFixed(1)}px, 0)`; };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(bg); } }, { passive: true }); bg();
  }

  const btn = n.querySelector('.nav_burger'); if (!btn) return;
  const W = [['sun', 'Sun'], ['mercury', 'Mercury'], ['venus', 'Venus'], ['earth', 'Earth'], ['mars', 'Mars'], ['jupiter', 'Jupiter'], ['saturn', 'Saturn'], ['uranus', 'Uranus'], ['neptune', 'Neptune'], ['pluto', 'Pluto']];
  const here = location.pathname.replace(/\/$/, '');
  const ov = document.createElement('div'); ov.className = 'nav_overlay'; ov.id = 'navMenu'; ov.hidden = true;
  ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Menu');
  ov.innerHTML = `<div class="nav_overlay-inner">
    <nav class="nav_overlay-big" aria-label="Main"><a href="/">System</a><a href="/worlds/sun">Worlds</a><a href="/contact">Contact</a></nav>
    <div class="nav_overlay-worlds"><span class="text-style-label">All worlds</span>${W.map(([id, name]) =>
      `<a href="/worlds/${id}"${here === '/worlds/' + id ? ' aria-current="page"' : ''}>${A ? `<img src="${A}img/sprites/${id}.webp" alt="" width="24" height="24" loading="lazy">` : ''}${name}</a>`).join('')}</div>
    <a class="button" href="/contact">Let's build yours</a></div>`;
  n.after(ov);
  const items = () => ov.querySelectorAll('.nav_overlay-big a, .nav_overlay-worlds a, .nav_overlay-worlds .text-style-label, .nav_overlay .button');
  const isOpen = () => btn.getAttribute('aria-expanded') === 'true';
  function open() {
    ov.hidden = false; document.body.classList.add('nav-open'); btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Close menu'); solid();
    if (window.gsap && !reduce) { gsap.fromTo(ov, { opacity: 0 }, { opacity: 1, duration: .3 }); gsap.fromTo(items(), { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: .015, duration: .45, ease: 'power3.out', delay: .05 }); }
    ov.querySelector('a').focus();
  }
  function close(focusBtn = true) {
    document.body.classList.remove('nav-open'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Open menu'); solid();
    if (window.gsap && !reduce) gsap.to(ov, { opacity: 0, duration: .2, onComplete: () => { ov.hidden = true; } }); else ov.hidden = true;
    if (focusBtn) btn.focus();
  }
  const toggle = () => (isOpen() ? close() : open());
  // u Webflow-u je burger link (role="button", href="#navMenu"): bez skoka na sidro, i Space ga aktivira kao dugme
  btn.addEventListener('click', e => { e.preventDefault(); toggle(); });
  btn.addEventListener('keydown', e => { if (e.key === ' ') { e.preventDefault(); toggle(); } });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !ov.hidden) close(); });
  ov.addEventListener('click', e => { if (e.target.closest('a')) close(false); });
  matchMedia('(min-width: 992px)').addEventListener('change', m => { if (m.matches && !ov.hidden) close(false); });
})();
