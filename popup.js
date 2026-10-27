const DEFAULT_SETTINGS = { dailyLimit: 20 };
const el = (id) => document.getElementById(id);
const today = () => new Date().toLocaleDateString('sv');

const CITATIONS = [
  ["La République, c'est moi !", 'J.-L. M., 2018'],
  ['Ma personne est sacrée !', 'J.-L. M., 2018'],
  ["Qu'ils s'en aillent tous !", 'J.-L. M., 2010'],
  ['Il ne faut pas donner une seule voix à Mme Le Pen ! (×4)', 'J.-L. M., soir du 1er tour 2022'],
  ["Je demande aux Français de m'élire Premier ministre.", 'J.-L. M., 2022'],
  ['Le programme, rien que le programme, mais tout le programme.', 'J.-L. M., 2024'],
  ['Prenez le pouvoir !', 'J.-L. M., campagne 2012'],
  ["L'Avenir en commun.", 'Programme de J.-L. M., 2017'],
  ['Puissants de la Terre, nous voici.', 'J.-L. M., marche pour la VIe République, 2017'],
  ['Quel que soit le problème, la solution est le peuple !', 'J.-L. M., marche pour la VIe République, 2017'],
  ['Nous sommes la révolution citoyenne toujours recommencée.', 'J.-L. M., marche pour la VIe République, 2017'],
  ["Le problème, c'est le banquier !", 'J.-L. M., Tourcoing, 2017'],
  ['On ne prépare pas la paix en préparant la guerre !', 'J.-L. M., Marseille, 2017'],
  ['Mettons de la raison et de la poésie et le monde ira mieux !', 'J.-L. M., De la vertu, 2017'],
  ['Le peuple existe quand il se met en réseau.', "J.-L. M., L'Ère du peuple"],  ['La tortue avance lentement, mais elle avance. Et elle bloque.', 'Sagesse de la tortue'],
  ['Pierre après pierre, la citadelle tombera.', 'Blockfacho'],
  ['Hologramme activé : je bloque depuis plusieurs villes à la fois.', 'Blockfacho'],
  ['Le bruit et la fureur dans la rue, le silence dans ton fil.', 'Blockfacho'],
];
const CRIS_DE_VICTOIRE = [
  ['BOUM ! Une pierre de moins.', 'La citadelle tremble'],
  ['Encore un créneau qui saute !', 'Blockfacho'],
  ['Résistance ! Un de plus dans le fossé.', 'Blockfacho'],
  ["Et un ! Qu'ils s'en aillent tous !", 'La tortue, très en forme'],
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
const TEINTES = ['#7a6c63', '#6f625a', '#83756b', '#655950'];
const briques = [];

function construireCitadelle() {
  const svg = el('citadelle');
  const ns = 'http://www.w3.org/2000/svg';
  const W = 12, H = 7;
  const x0 = (300 - PLAN[0].length * W) / 2;
  const y0 = 91 - PLAN.length * H; // 91 = ligne d'horizon du décor (70 % de 130)
  let graine = 42; // aléatoire reproductible : la citadelle s'écroule toujours pareil
  const hasard = () => (graine = (graine * 16807) % 2147483647) / 2147483647;

  const soleil = document.createElementNS(ns, 'circle');
  Object.entries({ cx: 255, cy: 28, r: 15, fill: '#fff3c4' }).forEach(([k, v]) => soleil.setAttribute(k, v));
  svg.append(soleil);

  PLAN.forEach((ligne, r) => [...ligne].forEach((c, col) => {
    if (c !== 'X') return;
    const rect = document.createElementNS(ns, 'rect');
    Object.entries({ x: x0 + col * W, y: y0 + r * H, width: W, height: H, rx: 1 })
      .forEach(([k, v]) => rect.setAttribute(k, v));
    rect.setAttribute('class', 'brique');
    rect.setAttribute('fill', TEINTES[Math.floor(hasard() * TEINTES.length)]);
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

function afficherCitation([texte, source]) {
  const bulle = el('bulle');
  bulle.style.opacity = 0;
  setTimeout(() => {
    const auteur = document.createElement('small');
    auteur.textContent = `— ${source}`;
    bulle.replaceChildren(texte, auteur);
    bulle.style.opacity = 1;
  }, 300);
}

let citationCourante = 0;
let dernierBoum = 0;
function citationSuivante() {
  if (Date.now() - dernierBoum < 6000) return;
  citationCourante = (citationCourante + 1) % CITATIONS.length;
  afficherCitation(CITATIONS[citationCourante]);
}

function rejouer(element, classe) {
  element.classList.remove(classe);
  void element.offsetWidth; // force le navigateur à relancer l'animation
  element.classList.add(classe);
}

function boum() {
  dernierBoum = Date.now();
  rejouer(el('scene'), 'secousse');
  rejouer(el('boum'), 'actif');
  afficherCitation(CRIS_DE_VICTOIRE[Math.floor(Math.random() * CRIS_DE_VICTOIRE.length)]);
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
  const todayCount = s.daily.date === today() ? s.daily.count : 0;

  el('status').textContent = s.status;
  el('total').textContent = total || '–';
  for (const k of Object.keys(counts)) el(k).textContent = counts[k];
  el('today').textContent = `${todayCount}/${s.settings.dailyLimit}`;
  if (document.activeElement !== el('limit')) el('limit').value = s.settings.dailyLimit;
  el('start').disabled = s.running;
  el('stop').disabled = !s.running;

  const progres = total ? Math.min(1, (counts.blocked + counts.already + counts.notfound) / total) : 0;
  const nbTombees = Math.round(progres * briques.length);
  afficherCitadelle(nbTombees);
  el('pierres').textContent = `${nbTombees} pierre${nbTombees > 1 ? 's' : ''} tombée${nbTombees > 1 ? 's' : ''} sur ${briques.length}`;
  el('pourcent').textContent = `${Math.floor(progres * 100)} %`;
  el('tortue').style.left = `${4 + progres * 86}%`;
  el('scene').classList.toggle('finie', total > 0 && progres >= 1);

  if (blocagesPrecedents !== null && counts.blocked > blocagesPrecedents) boum();
  blocagesPrecedents = counts.blocked;
  premierRendu = false;
}

// Hors de Chrome (ouverture directe du fichier), on simule l'extension pour voir le rendu.
function storeDeDemo() {
  document.body.insertAdjacentHTML('afterbegin', '<div class="apercu">Aperçu hors extension : données fictives</div>');
  const accounts = Array.from({ length: 177 }, (_, i) => ({ handle: `compte${i}` }));
  const results = {};
  for (let i = 0; i < 60; i++) {
    results[`compte${i}`] = { outcome: i % 9 === 0 ? 'already' : i % 23 === 0 ? 'notfound' : 'blocked' };
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
        set({ running: true, status: "À l'assaut !" });
        minuteur = setInterval(() => {
          if (i >= accounts.length) {
            clearInterval(minuteur);
            return set({ running: false, status: 'Terminé : toute la liste a été traitée.' });
          }
          data.results[`compte${i}`] = { outcome: 'blocked' };
          data.daily.count += 1;
          set({ status: `@compte${i++} : bloqué.` });
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
el('limit').onchange = async () => {
  const { settings } = await store.get({ settings: DEFAULT_SETTINGS });
  const dailyLimit = Math.max(1, Math.min(200, Number(el('limit').value) || settings.dailyLimit));
  await store.set({ settings: { ...settings, dailyLimit } });
};

construireCitadelle();
afficherCitation(CITATIONS[0]);
setInterval(citationSuivante, 7000);
store.onChange(render);
render();
