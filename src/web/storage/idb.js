// Magatzem IndexedDB minimal per a EduTicTac Blocs Junior (junior).
// Guarda el fitxer SQLite serialitzat i metadades de l'aplicacio.

const DB_NAME = 'blocsjunior';
const STORE = 'app';
const VERSION = 1;

const OPEN_TIMEOUT = 5000;

let dbPromise = null;

function log(msg) {
  if (typeof window !== 'undefined' && window.__juniorLog) window.__juniorLog(msg);
}

// Error de WebKit (iPad/Safari): indexedDB.open pot quedar penjat sense cap
// resposta fins que es crida indexedDB.databases(). També posem un temps màxim
// perquè l'aplicació no es quede en blanc si el navegador no respon mai.
// Nomes si open() tarda, es "desperta" WebKit cridant databases() periodicament.
const WAKE_DELAY = 500;

function openOnce() {
  return new Promise((resolve, reject) => {
    let poke = null;
    const wake = setTimeout(() => {
      if (!indexedDB.databases) return;
      log('idb slow, poking databases()');
      poke = setInterval(() => { indexedDB.databases().catch(() => {}); }, 100);
    }, WAKE_DELAY);
    const timer = setTimeout(() => {
      clearTimeout(wake);
      clearInterval(poke);
      reject(new Error('indexedDB.open timeout'));
    }, OPEN_TIMEOUT);
    const done = (fn, value) => { clearTimeout(timer); clearTimeout(wake); clearInterval(poke); fn(value); };
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => done(resolve, request.result);
    request.onerror = () => done(reject, request.error);
    request.onblocked = () => log('idb open blocked');
  });
}

function open() {
  if (dbPromise) return dbPromise;
  dbPromise = openOnce()
    .catch((e) => {
      log('idb open failed (' + ((e && e.message) || e) + '), retrying');
      return openOnce();
    })
    .catch((e) => {
      dbPromise = null;
      throw e;
    });
  return dbPromise;
}

function tx(mode, fn) {
  return open().then((db) => new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const store = transaction.objectStore(STORE);
    let result;
    try {
      result = fn(store);
    } catch (e) {
      reject(e);
      return;
    }
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  }));
}

export function idbGet(key) {
  return open().then((db) => new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readonly');
    const request = transaction.objectStore(STORE).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }));
}

export function idbSet(key, value) {
  return tx('readwrite', (store) => store.put(value, key));
}

export function idbDelete(key) {
  return tx('readwrite', (store) => store.delete(key));
}
