// src/context/DSRContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import db from '../services/storageService';

const DSRContext = createContext(null);

export function DSRProvider({ children }) {
  const [entries,  setEntries]  = useState([]);
  const [projects, setProjects] = useState([]);
  const [members,  setMembers]  = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [entriesData, projectsData, membersData] = await Promise.all([
        db.Entries.getAll(),
        db.Projects.getAll(),
        db.Members.getAll()
      ]);
      setEntries(entriesData);
      setProjects(projectsData);
      setMembers(membersData);
    };
    fetchData();
  }, []);

  // ── DSR Entries ─────────────────────────────────────────────────────────────
  const addEntry = async (entry) => {
    const item = await db.Entries.add(entry);
    setEntries(prev => [item, ...prev]);
    return item;
  };

  const deleteEntry = async (id) => {
    await db.Entries.delete(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  // ── Projects ────────────────────────────────────────────────────────────────
  const addProject = async (project) => {
    const item = await db.Projects.add(project);
    setProjects(prev => [item, ...prev]);
    return item;
  };

  const updateProject = async (id, changes) => {
    const item = await db.Projects.update(id, changes);
    setProjects(prev => prev.map(p => p.id === id ? item : p));
  };

  const deleteProject = async (id) => {
    await db.Projects.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // ── Members ─────────────────────────────────────────────────────────────────
  const addMember = async (member) => {
    const item = await db.Members.add(member);
    setMembers(prev => [item, ...prev]);
    return item;
  };

  const updateMember = async (id, changes) => {
    const item = await db.Members.update(id, changes);
    setMembers(prev => prev.map(m => m.id === id ? item : m));
  };

  const deleteMember = async (id) => {
    await db.Members.delete(id);
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  return (
    <DSRContext.Provider value={{
      entries,  addEntry,    deleteEntry,
      projects, addProject,  updateProject, deleteProject,
      members,  addMember,   updateMember,  deleteMember,
    }}>
      {children}
    </DSRContext.Provider>
  );
}

export const useDSR = () => useContext(DSRContext);
