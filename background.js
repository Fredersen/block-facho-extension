// Service worker : récupère la liste, puis bloque un compte à chaque « tick ».
// Les ticks sont planifiés avec chrome.alarms, car un service worker MV3 peut
// être arrêté à tout moment : tout l'état vit donc dans chrome.storage.local.

const LIST_URL = 'https://onbloquelextremedroite.fun/accounts.js';
const DEFAULT_SETTINGS = { dailyLimit: 20, speed: 'prudent' };
// Délai aléatoire entre deux blocages (en secondes), pour ne pas avoir un rythme de robot.
// Plus c'est rapide, plus X risque de restreindre le compte.
const SPEEDS = {
  prudent: { min: 30, max: 100 },
  rapide: { min: 15, max: 40 },
  turbo: { min: 5, max: 15 },
};
const speedOf = (settings) => SPEEDS[settings.speed] ?? SPEEDS.prudent;
const MAX_CONSECUTIVE_ERRORS = 3;

let busy = false;

async function getState() {
  return chrome.storage.local.get({
    running: false,
    status: 'Prêt.',
    accounts: [],
    listDate: '', // jour du dernier téléchargement de la liste
    results: {},
    daily: { date: '', count: 0 },
    settings: DEFAULT_SETTINGS,
    consecutiveErrors: 0,
    tabId: null,
  });
}

function today() {
  return new Date().toLocaleDateString('sv'); // AAAA-MM-JJ, heure locale
}

async function fetchAccounts() {
  const res = await fetch(LIST_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Liste inaccessible (HTTP ${res.status})`);
  const text = await res.text();
  // Le fichier a la forme `const accounts = [ ... ];`
  const match = text.match(/const accounts = (\[[\s\S]*?\n\]);?/);
  if (!match) throw new Error('Format de liste inattendu : le site a peut-être changé.');
  return JSON.parse(match[1])
    .filter((a) => a.handle)
    .map((a) => ({ handle: a.handle, name: a.name, category: a.category }));
}

function randomDelay(settings) {
  const { min, max } = speedOf(settings);
  return min + Math.random() * (max - min);
}

function scheduleNext(sec) {
  if (sec >= 30) {
    chrome.alarms.create('tick', { delayInMinutes: sec / 60 });
    return;
  }
  // chrome.alarms ne descend pas sous 30 s : on passe par setTimeout, et l'alarme
  // à 30 s sert de filet si Chrome a mis le service worker en veille entre-temps.
  setTimeout(tick, sec * 1000);
  chrome.alarms.create('tick', { delayInMinutes: 0.5 });
}

function msUntilTomorrow() {
  const d = new Date();
  d.setHours(24, 5 + Math.floor(Math.random() * 30), 0, 0);
  return d - Date.now();
}

async function ensureTab(tabId) {
  if (tabId !== null) {
    try {
      await chrome.tabs.get(tabId);
      return tabId;
    } catch {
      // l'onglet a été fermé : on en recrée un
    }
  }
  const tab = await chrome.tabs.create({ url: 'about:blank', active: false });
  await chrome.storage.local.set({ tabId: tab.id });
  return tab.id;
}

function navigateAndWait(tabId, url, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error('La page X ne se charge pas.'));
    }, timeoutMs);
    function listener(id, info) {
      if (id === tabId && info.status === 'complete') {
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }
    chrome.tabs.onUpdated.addListener(listener);
    chrome.tabs.update(tabId, { url }).catch(reject);
  });
}

// Injectée dans la page du profil X. Elle doit être autonome (pas de variables
// extérieures) car Chrome la sérialise. Elle clique comme le ferait l'utilisateur.
async function blockOnProfile() {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (sel) => document.querySelector(sel);
  const waitFor = async (sel, timeout) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = $(sel);
      if (el) return el;
      await sleep(300);
    }
    return null;
  };

  const start = Date.now();
  let emptySince = null;
  while (Date.now() - start < 20000) {
    if ($('[data-testid$="-unblock"]')) return 'already';
    if ($('[data-testid="userActions"]')) break;
    if (location.pathname.startsWith('/i/flow/login') || $('[data-testid="loginButton"]')) {
      return 'loggedout';
    }
    // Compte suspendu ou inexistant : X affiche un état vide sans bouton « ... ».
    if ($('[data-testid="emptyState"]')) {
      emptySince ??= Date.now();
      if (Date.now() - emptySince > 3000) return 'notfound';
    }
    await sleep(400);
  }

  const more = $('[data-testid="userActions"]');
  if (!more) return 'notfound';
  more.click();

  const item = await waitFor('[data-testid="block"], [data-testid="unblock"]', 5000);
  if (!item) return 'error';
  if (item.dataset.testid === 'unblock') {
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return 'already';
  }
  await sleep(500 + Math.random() * 1000);
  item.click();

  const confirm = await waitFor('[data-testid="confirmationSheetConfirm"]', 5000);
  if (!confirm) return 'error';
  await sleep(300 + Math.random() * 700);
  confirm.click();

  return (await waitFor('[data-testid$="-unblock"]', 8000)) ? 'blocked' : 'error';
}

async function tick() {
  if (busy) return;
  busy = true;
  try {
    await chrome.alarms.clear('tick'); // annule le filet de sécurité de scheduleNext
    const state = await getState();
    if (!state.running) return;
    const { settings, results } = state;

    // Une campagne qui dure plusieurs jours ne travaille jamais sur une liste de plus d'un jour.
    if (state.listDate !== today()) {
      try {
        state.accounts = await fetchAccounts();
      } catch (e) {
        // Site injoignable : on garde l'ancienne copie et on réessaiera demain.
        console.warn('Blockfacho : liste non rechargée', e);
      }
      await chrome.storage.local.set({ accounts: state.accounts, listDate: today() });
    }

    const daily = state.daily.date === today() ? state.daily : { date: today(), count: 0 };
    if (daily.count >= settings.dailyLimit) {
      await chrome.storage.local.set({
        daily,
        status: `Limite du jour atteinte (${daily.count}). Reprise automatique demain.`,
      });
      chrome.alarms.create('tick', { when: Date.now() + msUntilTomorrow() });
      return;
    }

    const next = state.accounts.find((a) => !results[a.handle.toLowerCase()]);
    if (!next) {
      await chrome.storage.local.set({ running: false, status: 'Terminé : toute la liste a été traitée.' });
      if (state.tabId !== null) chrome.tabs.remove(state.tabId).catch(() => {});
      await chrome.storage.local.set({ tabId: null });
      return;
    }

    await chrome.storage.local.set({ status: `Traitement de @${next.handle}…` });
    const tabId = await ensureTab(state.tabId);
    let outcome;
    try {
      await navigateAndWait(tabId, `https://x.com/${encodeURIComponent(next.handle)}`);
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId },
        func: blockOnProfile,
      });
      outcome = result;
    } catch (e) {
      console.warn('Blockfacho', next.handle, e);
      outcome = 'error';
    }

    if (outcome === 'loggedout') {
      await chrome.storage.local.set({ running: false, status: 'Connecte-toi à X puis relance.' });
      return;
    }

    results[next.handle.toLowerCase()] = { outcome, at: Date.now() };
    if (outcome === 'blocked') daily.count += 1;
    const consecutiveErrors = outcome === 'error' ? state.consecutiveErrors + 1 : 0;

    if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      await chrome.storage.local.set({
        results, daily, consecutiveErrors: 0, running: false,
        status: 'Arrêt après plusieurs erreurs (X limite peut-être les blocages). Réessaie plus tard.',
      });
      return;
    }

    await chrome.storage.local.set({ results, daily, consecutiveErrors });
    // L'utilisateur a pu cliquer sur « Pause » pendant le traitement.
    if (!(await getState()).running) return;

    // Pas besoin d'attendre longtemps si aucun blocage n'a eu lieu.
    const sec = outcome === 'blocked' || outcome === 'error' ? randomDelay(settings) : speedOf(settings).min;
    const labels = { blocked: 'bloqué', already: 'déjà bloqué', notfound: 'introuvable', error: 'erreur' };
    await chrome.storage.local.set({
      status: `@${next.handle} : ${labels[outcome]}. Prochain compte dans ${Math.round(sec)} s…`,
    });
    scheduleNext(sec);
  } finally {
    busy = false;
  }
}

async function start() {
  await chrome.storage.local.set({ status: 'Récupération de la liste…' });
  try {
    const accounts = await fetchAccounts();
    await chrome.storage.local.set({ accounts, listDate: today(), running: true, consecutiveErrors: 0 });
  } catch (e) {
    await chrome.storage.local.set({ running: false, status: `Erreur : ${e.message}` });
    return;
  }
  tick();
}

async function stop() {
  await chrome.alarms.clear('tick');
  await chrome.storage.local.set({ running: false, status: 'En pause.' });
}

async function retryErrors() {
  const { results } = await getState();
  for (const [handle, r] of Object.entries(results)) {
    if (r.outcome === 'error') delete results[handle];
  }
  await chrome.storage.local.set({ results });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'tick') tick();
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  const actions = { start, stop, retryErrors };
  const action = actions[msg.type];
  if (action) action().then(() => sendResponse({ ok: true }));
  return true;
});
