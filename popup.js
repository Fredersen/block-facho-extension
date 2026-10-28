const DEFAULT_SETTINGS = { dailyLimit: 20, speed: 'prudent' };
// Mêmes plages que SPEEDS dans background.js.
const VITESSES = {
  prudent: { texte: '30 à 100 s entre deux blocages', alerte: '' },
  rapide: {
    texte: '15 à 40 s entre deux blocages',
    alerte: 'Cadence rapide : X risque davantage de restreindre ton compte. Garde une limite quotidienne raisonnable.',
  },
  turbo: {
    texte: '5 à 15 s entre deux blocages',
    alerte: 'Turbo : risque élevé que X restreigne ou bloque temporairement ton compte. À utiliser à tes risques.',
  },
};
const el = (id) => document.getElementById(id);
// `?capture` : rendu figé, sans animations, pour les captures d'écran de la fiche du Web Store.
const CAPTURE = location.search.includes('capture');
if (CAPTURE) document.documentElement.classList.add('capture');
const today = () => new Date().toLocaleDateString('sv');

const CITATIONS = [
  ["La République, c'est moi !", 'Jean-Luc Mélenchon, 2018'],
  ['Ma personne est sacrée !', 'Jean-Luc Mélenchon, 2018'],
  ["Qu'ils s'en aillent tous !", 'Jean-Luc Mélenchon, 2010'],
  ['Il ne faut pas donner une seule voix à Mme Le Pen !', 'Jean-Luc Mélenchon, 1er tour 2022'],
  ["Je demande aux Français de m'élire Premier ministre.", 'Jean-Luc Mélenchon, 2022'],
  ['Le programme, rien que le programme, mais tout le programme.', 'Jean-Luc Mélenchon, 2024'],
  ['Prenez le pouvoir !', 'Jean-Luc Mélenchon, campagne 2012'],
  ["L'Avenir en commun.", 'Programme de Jean-Luc Mélenchon, 2017'],
  ['Puissants de la Terre, nous voici.', 'Jean-Luc Mélenchon, marche pour la VIe République, 2017'],
  ['Quel que soit le problème, la solution est le peuple !', 'Jean-Luc Mélenchon, 2017'],
  ['Nous sommes la révolution citoyenne toujours recommencée.', 'Jean-Luc Mélenchon, 2017'],
  ["Le problème, c'est le banquier !", 'Jean-Luc Mélenchon, Tourcoing, 2017'],
  ['On ne prépare pas la paix en préparant la guerre !', 'Jean-Luc Mélenchon, Marseille, 2017'],
  ['Mettons de la raison et de la poésie et le monde ira mieux !', 'Jean-Luc Mélenchon, De la vertu, 2017'],
  ['Le peuple existe quand il se met en réseau.', "Jean-Luc Mélenchon, L'Ère du peuple"],
];

// Plan de la citadelle : X = une pierre. Elle tombe au fil des comptes traités.
const PLAN = [
  'X.X.X...X.X.X.X...X.X.X',
  'XXXXX...XXXXXXX...XXXXX',
  'XXXXX...XXXXXXX...XXXXX',
  'XXXXX...XXXXXXX...XXXXX',
  'XXXXXX.XXXXXXXXX.XXXXXX',
  'XXXXXXXXXXXXXXXXXXXXXXX',
  'XXXXXXXXXXXXXXXXXXXXXXX',
  'XXXXXXXXXXXXXXXXXXXXXXX',
  'XXXXXXXXXXXXXXXXXXXXXXX',
  'XXXXXXXXXX...XXXXXXXXXX',
  'XXXXXXXXXX...XXXXXXXXXX',
];
const SOL = 92; // ligne d'horizon dans le viewBox (300 × 110)
const briques = [];

function svgEl(nom, attributs) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', nom);
  for (const [k, v] of Object.entries(attributs)) e.setAttribute(k, v);
  return e;
}

function construireCitadelle() {
  const svg = el('citadelle');
  const W = 11, H = 7;
  const x0 = (300 - PLAN[0].length * W) / 2;
  const y0 = SOL - PLAN.length * H;
  let graine = 42; // aléatoire reproductible : la citadelle s'écroule toujours pareil
  const hasard = () => (graine = (graine * 16807) % 2147483647) / 2147483647;

  // Les variables CSS ne marchent que dans `style`, pas dans l'attribut `fill`.
  svg.append(svgEl('circle', { cx: 248, cy: 30, r: 14, style: 'fill: var(--sun)' }));
  svg.append(svgEl('rect', { x: 0, y: SOL, width: 300, height: 110 - SOL, style: 'fill: var(--ground)' }));

  PLAN.forEach((ligne, r) => [...ligne].forEach((c, col) => {
    if (c !== 'X') return;
    const rect = svgEl('rect', {
      x: x0 + col * W + 0.5, y: y0 + r * H + 0.5, width: W - 1, height: H - 1, rx: 1,
      class: 'brique', 'fill-opacity': (0.78 + hasard() * 0.22).toFixed(2),
    });
    rect.style.setProperty('--dx', `${(hasard() - 0.5) * 50}px`);
    rect.style.setProperty('--rot', `${(hasard() - 0.5) * 160}deg`);
    svg.append(rect);
    // Les pierres du haut tombent d'abord, avec un peu de désordre.
    briques.push({ rect, ordre: r + hasard() * 3, tombee: false });
  }));
  briques.sort((a, b) => a.ordre - b.ordre);
}

let premierRendu = true;
function afficherCitadelle(nbTombees) {
  briques.forEach((b, i) => {
    if (i < nbTombees && !b.tombee) {
      b.tombee = true;
      b.rect.classList.add(premierRendu ? 'partie' : 'tombe');
    } else if (i >= nbTombees && b.tombee) {
      b.tombee = false;
      b.rect.classList.remove('partie', 'tombe');
    }
  });
}

let citationCourante = Math.floor(Math.random() * CITATIONS.length);
function afficherCitation() {
  const [texte, source] = CITATIONS[citationCourante];
  const bloc = el('citation');
  const montrer = () => {
    el('citation-texte').textContent = texte;
    el('citation-source').textContent = source;
    bloc.style.opacity = 1;
  };
  if (CAPTURE) return montrer();
  bloc.style.opacity = 0;
  setTimeout(montrer, 300);
}
function citationSuivante() {
  citationCourante = (citationCourante + 1) % CITATIONS.length;
  afficherCitation();
}

function rejouer(element, classe) {
  element.classList.remove(classe);
  void element.offsetWidth; // force le navigateur à relancer l'animation
  element.classList.add(classe);
}

function etatPastille(s, fini) {
  if (fini) return ['fini', 'Terminé'];
  if (!s.running) return ['', s.status.startsWith('En pause') ? 'En pause' : 'Prêt'];
  if (s.status.startsWith('Limite')) return ['', 'Reprise demain'];
  return ['actif', 'En cours'];
}

let blocagesPrecedents = null;
async function render() {
  const s = await store.get({
    running: false, status: 'Prêt.', accounts: [], results: {},
    daily: { date: '', count: 0 }, settings: DEFAULT_SETTINGS,
  });
  const counts = { blocked: 0, already: 0, notfound: 0, error: 0 };
  for (const r of Object.values(s.results)) counts[r.outcome] += 1;
  const total = s.accounts.length;
  const traites = counts.blocked + counts.already + counts.notfound;
  const progres = total ? Math.min(1, traites / total) : 0;
  const fini = total > 0 && progres >= 1;
  const todayCount = s.daily.date === today() ? s.daily.count : 0;
  const limite = s.settings.dailyLimit;

  for (const k of Object.keys(counts)) el(k).textContent = counts[k];
  el('total').textContent = total || '–';
  el('traites').textContent = traites;
  el('pourcent').textContent = `${Math.floor(progres * 100)} %`;
  el('barre').style.width = `${progres * 100}%`;
  el('today').textContent = todayCount;
  el('limite-texte').textContent = limite;
  el('barre-jour').style.width = `${Math.min(1, todayCount / limite) * 100}%`;
  if (document.activeElement !== el('limit')) el('limit').value = limite;

  const vitesse = VITESSES[s.settings.speed] ? s.settings.speed : 'prudent';
  for (const b of el('vitesse').querySelectorAll('button')) {
    b.setAttribute('aria-checked', String(b.dataset.speed === vitesse));
  }
  el('vitesse-texte').textContent = VITESSES[vitesse].texte;
  el('alerte-vitesse').textContent = VITESSES[vitesse].alerte;
  el('alerte-vitesse').hidden = !VITESSES[vitesse].alerte;

  el('status').textContent = s.status;
  const [classe, texte] = etatPastille(s, fini);
  el('pill').className = `pill ${classe}`;
  el('pill-texte').textContent = texte;
  el('start').disabled = s.running;
  el('start').textContent = traites > 0 && !fini ? "Reprendre l'assaut" : "Lancer l'assaut";
  el('stop').disabled = !s.running;
  el('retry').hidden = counts.error === 0;

  afficherCitadelle(Math.round(progres * briques.length));
  el('scene').classList.toggle('finie', fini);

  if (blocagesPrecedents !== null && counts.blocked > blocagesPrecedents) {
    rejouer(el('scene'), 'secousse');
    rejouer(el('boum'), 'actif');
  }
  blocagesPrecedents = counts.blocked;
  premierRendu = false;
}

// Hors de Chrome (ouverture directe du fichier), on simule l'extension pour voir le rendu.
function storeDeDemo() {
  if (!CAPTURE) {
    document.body.insertAdjacentHTML('afterbegin', '<div class="apercu">Aperçu hors extension · données fictives</div>');
  }
  const accounts = Array.from({ length: 177 }, (_, i) => ({ handle: `compte${i}` }));
  const results = {};
  for (let i = 0; i < 60; i++) {
    results[`compte${i}`] = { outcome: i % 9 === 0 ? 'already' : i % 23 === 0 ? 'notfound' : i === 31 ? 'error' : 'blocked' };
  }
  const data = { running: false, status: 'Prêt.', accounts, results, daily: { date: today(), count: 7 }, settings: DEFAULT_SETTINGS };
  let ecouteur = () => {};
  let minuteur = null;
  let i = 60;
  const set = async (v) => { Object.assign(data, v); ecouteur(); };
  return {
    get: async (defauts) => ({ ...defauts, ...structuredClone(data) }),
    set,
    onChange: (f) => { ecouteur = f; },
    send: async (type) => {
      if (type === 'start') {
        set({ running: true, status: 'Récupération de la liste…' });
        minuteur = setInterval(() => {
          if (i >= accounts.length) {
            clearInterval(minuteur);
            return set({ running: false, status: 'Terminé : toute la liste a été traitée.' });
          }
          data.results[`compte${i}`] = { outcome: 'blocked' };
          data.daily.count += 1;
          set({ status: `@compte${i++} : bloqué. Prochain compte dans moins de 2 minutes…` });
        }, 1500);
      }
      if (type === 'stop') {
        clearInterval(minuteur);
        set({ running: false, status: 'En pause.' });
      }
    },
  };
}

const store = globalThis.chrome?.runtime?.id ? {
  get: (defauts) => chrome.storage.local.get(defauts),
  set: (v) => chrome.storage.local.set(v),
  onChange: (f) => chrome.storage.onChanged.addListener(f),
  send: (type) => chrome.runtime.sendMessage({ type }),
} : storeDeDemo();

el('start').onclick = () => store.send('start');
el('stop').onclick = () => store.send('stop');
el('retry').onclick = () => store.send('retryErrors');
for (const b of el('vitesse').querySelectorAll('button')) {
  b.onclick = async () => {
    const { settings } = await store.get({ settings: DEFAULT_SETTINGS });
    await store.set({ settings: { ...settings, speed: b.dataset.speed } });
  };
}
el('limit').onchange = async () => {
  const { settings } = await store.get({ settings: DEFAULT_SETTINGS });
  const dailyLimit = Math.max(1, Math.min(200, Number(el('limit').value) || settings.dailyLimit));
  await store.set({ settings: { ...settings, dailyLimit } });
};

construireCitadelle();
afficherCitation();
setInterval(citationSuivante, 8000);
store.onChange(render);
render();
