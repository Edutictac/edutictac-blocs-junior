// Magatzem IndexedDB minimal per a EduTicTac Blocs Junior (junior).
// Guarda el fitxer SQLite serialitzat i metadades de l'aplicacio.

const DB_NAME = 'blocsjunior';
const STORE = 'app';
const VERSION = 1;

let dbPromise = null;

function open() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
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
