// Capa de base de dades (junior).
// Motor: sql.js (WASM) en memoria. Persistencia: IndexedDB (blob SQLite, debounced).
// Replica la semantica del port d'escriptori (DatabaseManager).

import initSqlJs from 'sql.js';
import { idbGet, idbSet } from './idb.js';

const SAVE_DELAY = 500;
const DB_KEY = 'db';
const META_KEY = 'meta';

let SQL = null;
let db = null;
let ready = false;
let saveTimer = null;

function initTables() {
  db.exec('CREATE TABLE IF NOT EXISTS PROJECTS (ID INTEGER PRIMARY KEY AUTOINCREMENT, CTIME DATETIME DEFAULT CURRENT_TIMESTAMP, MTIME DATETIME, ALTMD5 TEXT, POS INTEGER, NAME TEXT, JSON TEXT, THUMBNAIL TEXT, OWNER TEXT, GALLERY TEXT, DELETED TEXT, VERSION TEXT)\n');
  db.exec('CREATE TABLE IF NOT EXISTS USERSHAPES (ID INTEGER PRIMARY KEY AUTOINCREMENT, CTIME DATETIME DEFAULT CURRENT_TIMESTAMP, MD5 TEXT, ALTMD5 TEXT, WIDTH TEXT, HEIGHT TEXT, EXT TEXT, NAME TEXT, OWNER TEXT, SCALE TEXT, VERSION TEXT)\n');
  db.exec('CREATE TABLE IF NOT EXISTS USERBKGS (ID INTEGER PRIMARY KEY AUTOINCREMENT, CTIME DATETIME DEFAULT CURRENT_TIMESTAMP, MD5 TEXT, ALTMD5 TEXT, WIDTH TEXT, HEIGHT TEXT, EXT TEXT, OWNER TEXT, VERSION TEXT)\n');
  db.exec('CREATE TABLE IF NOT EXISTS PROJECTFILES (MD5 TEXT PRIMARY KEY, CONTENTS TEXT)\n');
}

function runMigrations() {
  try {
    db.exec('ALTER TABLE PROJECTS ADD COLUMN ISGIFT INTEGER DEFAULT 0');
  } catch (e) {
    // la columna ja existeix
  }
}

export async function initDb() {
  if (ready) return;
  SQL = await initSqlJs({ locateFile: () => 'sql-wasm.wasm' });

  const stored = await idbGet(DB_KEY);
  let isNew = false;
  if (stored) {
    db = new SQL.Database(new Uint8Array(stored));
  } else {
    db = new SQL.Database();
    isNew = true;
  }
  initTables();
  runMigrations();
  ready = true;
  if (isNew) markDirty();
}

export function isReady() {
  return ready;
}

function rows(jsonStrOrObj) {
  const json = typeof jsonStrOrObj === 'string' ? JSON.parse(jsonStrOrObj) : (jsonStrOrObj || {});
  const statement = db.prepare(json.stmt, json.values);
  const out = [];
  try {
    while (statement.step()) {
      out.push(statement.getAsObject());
    }
  } finally {
    statement.free();
  }
  return out;
}

export function query(jsonStrOrObj) {
  try {
    return JSON.stringify(rows(jsonStrOrObj));
  } catch (e) {
    return '[]';
  }
}

export function stmt(jsonStrOrObj) {
  try {
    const json = typeof jsonStrOrObj === 'string' ? JSON.parse(jsonStrOrObj) : (jsonStrOrObj || {});
    const statement = db.prepare(json.stmt, json.values);
    try {
      while (statement.step()) statement.get();
    } finally {
      statement.free();
    }
    const result = db.exec('select last_insert_rowid();');
    markDirty();
    return result[0].values[0][0];
  } catch (e) {
    return -1;
  }
}

export function readProjectFile(md5name) {
  const out = rows({ stmt: 'select CONTENTS from PROJECTFILES where MD5 = ?', values: [md5name] });
  return out.length > 0 ? out[0].CONTENTS : null;
}

export function writeProjectFile(name, contents) {
  try {
    const statement = db.prepare('insert or replace into PROJECTFILES (MD5, CONTENTS) values (?, ?)');
    statement.run([name, contents]);
    statement.free();
    markDirty();
    return name;
  } catch (e) {
    return -1;
  }
}

export function removeProjectFile(name) {
  try {
    const statement = db.prepare('delete from PROJECTFILES where MD5 = ?');
    statement.run([name]);
    statement.free();
    markDirty();
  } catch (e) {
    // ignora
  }
}

export function cleanProjectFiles(fileType) {
  let ext = fileType;
  if (ext === 'wav') ext = 'webm';
  const candidates = rows({ stmt: 'select MD5 from PROJECTFILES where MD5 LIKE ?', values: [`%.${ext}`] });
  candidates.forEach((row) => {
    const name = row.MD5;
    if (!name) return;
    const inProjects = rows({ stmt: 'select ID from PROJECTS where json like ?', values: [`%${name}%`] });
    if (inProjects.length > 0) return;
    const inShapes = rows({ stmt: 'select MD5 from USERSHAPES where MD5 = ?', values: [name] });
    if (inShapes.length > 0) return;
    const inBkgs = rows({ stmt: 'select MD5 from USERBKGS where MD5 = ?', values: [name] });
    if (inBkgs.length > 0) return;
    removeProjectFile(name);
  });
}

export function exportDatabase() {
  return db.export();
}

export async function saveNow() {
  if (!ready) return;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  try {
    await idbSet(DB_KEY, db.export());
    await idbSet(META_KEY, { schema: 1, appVersion: '0.1.0', updatedAt: Date.now() });
  } catch (e) {
    // si falla l'escriptura, es reintentara en el seguent canvi
  }
}

export function markDirty() {
  if (!ready) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { saveNow(); }, SAVE_DELAY);
}

// Desa de manera best-effort quan la pagina s'amaga o es tanca.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveNow();
  });
}
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => { saveNow(); });
}
