# Solar · skripte i slike za Webflow

Javni repo koji jsDelivr služi Webflow sajtu „Solar“.

Adresa: `https://cdn.jsdelivr.net/gh/VictorYWebflow-1973/solar-webflow@v1.0.2/<putanja>`

- `js/vendor/` — GSAP 3.15.0, ScrollTrigger, SplitText
- `js/solar-data.js` — JPL orbitalni elementi
- `js/hero.js`, `js/home.js` — Početna
- `js/nav.js` — navigacija i kosmička pozadina (svaka strana)
- `js/world.js` — stranica sveta (CMS šablon Worlds)
- `img/` — pozadine i sprajtovi planeta
- `worlds/` — izvorne fotografije svetova (uvezene u Webflow CMS)
- `fonts/` — Orbitron (SIL OFL)

Webflow proverava SRI heš svakog fajla. Kad se fajl promeni: nova verzija (sledeći tag, npr. `v1.0.2`), novi heš, ponovo registrovati skriptu.
