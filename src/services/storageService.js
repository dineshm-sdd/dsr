// src/services/storageService.js
// ─────────────────────────────────────────────────────────────────────────────
// Centralised api layer using json-server as backend.
// ─────────────────────────────────────────────────────────────────────────────

const API_URL = 'http://localhost:3001';

const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();

// ── helpers ──────────────────────────────────────────────────────────────────
const get = async (endpoint) => {
  try {
    const res = await fetch(`${API_URL}/${endpoint}`);
    return await res.json();
  } catch (e) {
    console.error('[StorageDB] GET error', e);
    return [];
  }
};

const post = async (endpoint, data) => {
  try {
    const res = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (e) {
    console.error('[StorageDB] POST error', e);
    return null;
  }
};

const put = async (endpoint, id, data) => {
  try {
    const res = await fetch(`${API_URL}/${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (e) {
    console.error('[StorageDB] PUT error', e);
    return null;
  }
};

const patch = async (endpoint, id, data) => {
  try {
    const res = await fetch(`${API_URL}/${endpoint}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (e) {
    console.error('[StorageDB] PATCH error', e);
    return null;
  }
};

const del = async (endpoint, id) => {
  try {
    await fetch(`${API_URL}/${endpoint}/${id}`, {
      method: 'DELETE'
    });
    return true;
  } catch (e) {
    console.error('[StorageDB] DELETE error', e);
    return false;
  }
};

// ── DSR Entries ───────────────────────────────────────────────────────────────
const Entries = {
  getAll: () => get('entries'),
  add: async (entry) => {
    const item = { ...entry, id: uid(), createdAt: now() };
    return await post('entries', item);
  },
  delete: async (id) => {
    return await del('entries', id);
  },
};

// ── Projects ──────────────────────────────────────────────────────────────────
const Projects = {
  getAll: () => get('projects'),
  add: async (project) => {
    const item = { ...project, id: uid(), createdAt: now() };
    return await post('projects', item);
  },
  update: async (id, changes) => {
    return await patch('projects', id, { ...changes, updatedAt: now() });
  },
  delete: async (id) => {
    return await del('projects', id);
  },
};

// ── Members ───────────────────────────────────────────────────────────────────
const Members = {
  getAll: () => get('members'),
  add: async (member) => {
    const item = { ...member, id: uid(), createdAt: now() };
    return await post('members', item);
  },
  update: async (id, changes) => {
    return await patch('members', id, { ...changes, updatedAt: now() });
  },
  delete: async (id) => {
    return await del('members', id);
  },
};

// ── Public API ────────────────────────────────────────────────────────────────
const db = { Entries, Projects, Members };
export default db;
