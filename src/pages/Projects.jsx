// src/pages/Projects.jsx
import { useState } from 'react';
import { useDSR } from '../context/DSRContext';
import Modal from '../components/UI/Modal';
import CalendarPicker from '../components/UI/CalendarPicker';
import { parseISO, format } from 'date-fns';
import {
  FolderKanban, Plus, Pencil, Trash2, DollarSign,
  Calendar, Building2, Search, CheckCircle2, Archive, Users
} from 'lucide-react';

// ─── Helpers defined OUTSIDE component (fix focus-loss bug) ───────────────────
const EMPTY = { name: '', client: '', billingRate: '', fixedCost: '', pmName: '', bdgName: '', approvedHours: '', projectType: 'Billable', startDate: '', endDate: '', description: '', status: 'Active' };

const STATUS_STYLES = {
  Active: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700/40',
  Archived: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700/60 dark:text-slate-400 dark:border-slate-600',
  Completed: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700/40',
};

const toDate = (s) => { try { return s ? parseISO(s) : null; } catch { return null; } };
const toStr = (d) => { try { return d ? format(d, 'yyyy-MM-dd') : ''; } catch { return ''; } };
const fmtDate = (s) => {
  try { return s ? format(new Date(s + 'T00:00:00'), 'dd MMM yyyy') : '—'; } catch { return '—'; }
};

// Field wrapper OUTSIDE component — prevents React remounting inputs on re-render
function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="label"><Icon size={12} className="text-brand-500" />{label}</label>
      {children}
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function Projects() {
  const { projects, addProject, updateProject, deleteProject } = useDSR();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [saved, setSaved] = useState(false);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModalOpen(true); setSaved(false); };
  const openEdit = (p) => {
    setForm({
      name: p.name || '',
      client: p.client || '',
      billingRate: String(p.billingRate ?? ''),
      fixedCost: String(p.fixedCost ?? ''),
      pmName: p.pmName || '',
      bdgName: p.bdgName || '',
      approvedHours: String(p.approvedHours ?? ''),
      projectType: p.projectType || 'Billable',
      startDate: p.startDate || '',
      endDate: p.endDate || '',
      description: p.description || '',
      status: p.status || 'Active',
    });
    setEditId(p.id);
    setModalOpen(true);
    setSaved(false);
  };
  const close = () => { setModalOpen(false); setEditId(null); setForm(EMPTY); setSaved(false); };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = { ...form, billingRate: parseFloat(form.billingRate) || 0, fixedCost: parseFloat(form.fixedCost) || 0, approvedHours: parseFloat(form.approvedHours) || 0 };
    if (editId) {
      updateProject(editId, payload);
    } else {
      addProject(payload);
    }
    setSaved(true);
    setTimeout(close, 600);
  };

  const handleDelete = (id) => {
    deleteProject(id);
    setDeleteId(null);
  };

  const filtered = projects.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-brand-600 flex items-center justify-center shadow-lg">
            <FolderKanban size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Projects</h1>
            <p className="text-sm text-slate-500">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Project
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 my-6">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            className="input-field pl-9"
            placeholder="Search by project or client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <FolderKanban size={40} className="opacity-30" />
            <p className="text-sm">{search ? 'No projects match your search.' : 'No projects yet — add one!'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['Project', 'Client', 'Billing Rate', 'Start Date', 'End Date', 'Status', ''].map((h) => (
                    <th key={h} className="th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="tr group">
                    <td className="td">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{p.name}</p>
                        {p.description && (
                          <p className="text-xs text-slate-400 mt-0.5 max-w-[200px] truncate" title={p.description}>
                            {p.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="td">
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Building2 size={13} className="text-slate-400 shrink-0" />
                        {p.client || '—'}
                      </span>
                    </td>
                    <td className="td">
                      {p.billingRate > 0
                        ? <span className="font-semibold text-emerald-600 dark:text-emerald-400">${Number(p.billingRate).toLocaleString('en-IN')}/hr</span>
                        : <span className="text-slate-400">—</span>
                      }
                    </td>
                    <td className="td text-slate-500">{fmtDate(p.startDate)}</td>
                    <td className="td text-slate-500">{fmtDate(p.endDate)}</td>
                    <td className="td">
                      <span className={`badge ${STATUS_STYLES[p.status] || STATUS_STYLES.Active}`}>
                        {p.status === 'Archived' ? <Archive size={10} /> : <CheckCircle2 size={10} />}
                        {p.status}
                      </span>
                    </td>
                    <td className="td">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button onClick={() => openEdit(p)} className="btn-icon text-amber-600 hover:bg-amber-50 dark:text-amber-500 dark:hover:bg-amber-900/20" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="btn-icon text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={close} title={editId ? 'Edit Project' : 'Add Project'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          {saved && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium animate-fade-in">
              <CheckCircle2 size={16} /> Saved successfully!
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Project Name *" icon={FolderKanban}>
              <input
                className="input-field"
                placeholder="e.g. Project Alpha"
                value={form.name}
                onChange={set('name')}
                required
                autoFocus
              />
            </Field>

            <Field label="Client" icon={Building2}>
              <input
                className="input-field"
                placeholder="e.g. Client Corp"
                value={form.client}
                onChange={set('client')}
              />
            </Field>

            <Field label="Project Manager Name" icon={Users}>
              <input
                className="input-field"
                placeholder="e.g. John Doe"
                value={form.pmName}
                onChange={set('pmName')}
              />
            </Field>

            <Field label="BDG Person Name" icon={Users}>
              <input
                className="input-field"
                placeholder="e.g. Jane Smith"
                value={form.bdgName}
                onChange={set('bdgName')}
              />
            </Field>

            <Field label="Approved Hours" icon={Calendar}>
              <input
                className="input-field"
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g. 100"
                value={form.approvedHours}
                onChange={set('approvedHours')}
              />
            </Field>

            <Field label="Project Type" icon={DollarSign}>
              <select className="input-field" value={form.projectType} onChange={set('projectType')}>
                <option value="Billable">Billable</option>
                <option value="Fixed">Fixed</option>
              </select>
            </Field>

            {form.projectType === 'Fixed' ? (
              <Field label="Fixed Cost ($)" icon={DollarSign}>
                <input
                  className="input-field"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 5000"
                  value={form.fixedCost}
                  onChange={set('fixedCost')}
                />
              </Field>
            ) : (
              <Field label="Billing Rate ($/hr)" icon={DollarSign}>
                <input
                  className="input-field"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 1500"
                  value={form.billingRate}
                  onChange={set('billingRate')}
                />
              </Field>
            )}

            <Field label="Status" icon={CheckCircle2}>
              <select className="input-field" value={form.status} onChange={set('status')}>
                <option>Active</option>
                <option>Completed</option>
                <option>Archived</option>
              </select>
            </Field>

            <div className='grid'>
              <label className="label"><Calendar size={12} className="text-brand-500" />Start Date</label>
              <CalendarPicker
                selected={toDate(form.startDate)}
                onChange={(d) => setForm((p) => ({ ...p, startDate: toStr(d) }))}
                placeholder="Project start date"
              />
            </div>

            <div className='grid'>
              <label className="label"><Calendar size={12} className="text-brand-500" />End Date</label>
              <CalendarPicker
                selected={toDate(form.endDate)}
                onChange={(d) => setForm((p) => ({ ...p, endDate: toStr(d) }))}
                placeholder="Project end date"
                minDate={toDate(form.startDate)}
              />
            </div>
          </div>

          <div className='grid'>
            <Field label="Description" icon={FolderKanban}>
              <textarea
                className="input-field resize-none"
                rows={3}
                placeholder="Brief project description..."
                value={form.description}
                onChange={set('description')}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
            <button type="button" onClick={close} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              <Plus size={15} />{editId ? 'Save Changes' : 'Add Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Project" size="sm">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
          Delete{' '}
          <strong className="text-slate-800 dark:text-slate-200">
            {projects.find((p) => p.id === deleteId)?.name}
          </strong>
          ? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
          <button onClick={() => handleDelete(deleteId)} className="btn-danger">
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
