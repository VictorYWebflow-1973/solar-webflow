/* Solar · podaci za hero
   Planete: JPL "Approximate Positions of the Planets", Table 1 (1800–2050), ssd.jpl.nasa.gov/planets/approx_pos.html
   Pluton: starija JPL tabela iste serije (Standish) — PROVERITI pre objave
   Ceres: približni elementi — PROVERITI (JPL Small-Body Database)
   Prečnici planeta i udaljenosti: NASA Planetary Fact Sheet (nssdc.gsfc.nasa.gov/planetary/factsheet)
   Meseci: poluprečnici JPL Planetary Satellite Physical Parameters; periodi JPL Satellite Mean Elements
           (Ariel, Umbriel, Titania, Oberon, Triton, Charon — periodi PROVERITI). Položaj meseca je ilustrativan. */

// [a, e, I, L, varpi, Omega] i stope po julijanskom veku
window.SOLAR_ELEMENTS = {
  mercury: [[0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593], [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081]],
  venus:   [[0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255], [0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418]],
  earth:   [[1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0], [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0]],
  mars:    [[1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891], [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]],
  jupiter: [[5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909], [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106]],
  saturn:  [[9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448], [-0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]],
  uranus:  [[19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503], [-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589]],
  neptune: [[30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574], [0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664]],
  pluto:   [[39.48211675, 0.24882730, 17.14001206, 238.92903833, 224.06891629, 110.30393684], [-0.00031596, 0.00005170, 0.00004818, 145.20780515, -0.04062942, -0.01183482]],
  // Ceres: JPL SBDB (epoha JD 2461200.5: a 2.77, e 0.0797, i 10.6, Ω 80.2, ω 73.3, M 274, n 0.214°/d), preračunato na J2000; tačnost ~1°
  ceres:   [[2.77, 0.0797, 10.6, 161.3, 153.5, 80.2], [0, 0, 0, 7816.4, 0, 0]]
};

window.SOLAR_BODIES = [
  { id: 'sun',     name: 'Sun',     type: 'Star',         diameterKm: 1392000, color: '#FFC56B' },
  { id: 'mercury', name: 'Mercury', type: 'Planet',       diameterKm: 4879,   order: 1 },
  { id: 'venus',   name: 'Venus',   type: 'Planet',       diameterKm: 12104,  order: 2 },
  { id: 'earth',   name: 'Earth',   type: 'Planet',       diameterKm: 12756,  order: 3 },
  { id: 'mars',    name: 'Mars',    type: 'Planet',       diameterKm: 6792,   order: 4 },
  { id: 'ceres',   name: 'Ceres',   type: 'Dwarf planet', diameterKm: 939,    order: 4.5 },  // JPL SBDB 939.4 km
  { id: 'jupiter', name: 'Jupiter', type: 'Planet',       diameterKm: 142984, order: 5 },
  { id: 'saturn',  name: 'Saturn',  type: 'Planet',       diameterKm: 120536, order: 6, ring: true },
  { id: 'uranus',  name: 'Uranus',  type: 'Planet',       diameterKm: 51118,  order: 7 },
  { id: 'neptune', name: 'Neptune', type: 'Planet',       diameterKm: 49528,  order: 8 },
  { id: 'pluto',   name: 'Pluto',   type: 'Planet',       diameterKm: 2376,   order: 9, note: 'Dwarf planet by IAU since 2006. A planet here.' }
];

// [id, ime, planeta, prečnik km, period dana (negativno = retrogradno)]
window.SOLAR_MOONS = [
  ['moon', 'Moon', 'earth', 3475, 27.322],
  ['phobos', 'Phobos', 'mars', 22, 0.319], ['deimos', 'Deimos', 'mars', 12, 1.263],
  ['io', 'Io', 'jupiter', 3643, 1.769], ['europa', 'Europa', 'jupiter', 3122, 3.551], ['ganymede', 'Ganymede', 'jupiter', 5262, 7.156], ['callisto', 'Callisto', 'jupiter', 4821, 16.690],
  ['tethys', 'Tethys', 'saturn', 1062, 1.888], ['dione', 'Dione', 'saturn', 1123, 2.737], ['rhea', 'Rhea', 'saturn', 1527, 4.518], ['titan', 'Titan', 'saturn', 5150, 15.945], ['iapetus', 'Iapetus', 'saturn', 1469, 79.331],
  ['ariel', 'Ariel', 'uranus', 1158, 2.520], ['umbriel', 'Umbriel', 'uranus', 1169, 4.144], ['titania', 'Titania', 'uranus', 1578, 8.706], ['oberon', 'Oberon', 'uranus', 1523, 13.463],
  ['triton', 'Triton', 'neptune', 2705, -5.877],
  ['charon', 'Charon', 'pluto', 1212, 6.387]
];
