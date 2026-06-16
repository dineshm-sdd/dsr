// src/pages/TeamMembers.jsx
import { useState } from 'react';
import { useDSR } from '../context/DSRContext';
import Modal from '../components/UI/Modal';
import {
  Users, Plus, Pencil, Trash2, Mail, Briefcase, Building2, Search, CheckCircle2,
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '../data/constants';

// ─── Helpers defined OUTSIDE component (fix focus-loss bug) ───────────────────
const EMPTY = { name: '', email: '', password: '', role: '', department: '' };

const ROLE_COLORS = {
  'Developer':       'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700/40',
  'Designer':        'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700/40',
  'Project Manager': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/40',
  'QA Engineer':     'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/40',
  'DevOps':          'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-700/40',
};

const AVATAR_COLORS = [
  'from-brand-500 to-purple-600',
  'from-emerald-500 to-cyan-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-indigo-500 to-blue-600',
];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] || AVATAR_COLORS[0];

// Field wrapper OUTSIDE component — prevents React from remounting inputs on every re-render
function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="label"><Icon size={12} className="text-brand-500" />{label}</label>
      {children}
    </div>
  );
}

// Member card OUTSIDE component — stable reference prevents unnecessary re-mounts
function MemberCard({ member, onEdit, onDelete }) {
  return (
    <div className="card group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarColor(member.name)} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
          {member.name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(member)} className="btn-icon" title="Edit">
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(member.id)}
            className="btn-icon text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{member.name}</p>
        {member.email && (
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
            <Mail size={11} /> {member.email}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {member.role && (
          <span className={`badge ${ROLE_COLORS[member.role] || 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'}`}>
            <Briefcase size={10} /> {member.role}
          </span>
        )}
        {member.department && (
          <span className="badge bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">
            <Building2 size={10} /> {member.department}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function TeamMembers() {
  const { members, addMember, updateMember, deleteMember } = useDSR();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState(EMPTY);
  const [search,    setSearch]    = useState('');
  const [deleteId,  setDeleteId]  = useState(null);
  const [saved,     setSaved]     = useState(false);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const openAdd  = ()  => { setForm(EMPTY); setEditId(null); setModalOpen(true); setSaved(false); };
  const openEdit = (m) => {
    setForm({ name: m.name, email: m.email || '', password: m.password || '', role: m.role || '', department: m.department || '' });
    setEditId(m.id);
    setModalOpen(true);
    setSaved(false);
  };
  const close = () => { setModalOpen(false); setEditId(null); setForm(EMPTY); setSaved(false); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editId) {
      updateMember(editId, form);
    } else {
      addMember(form);
      if (form.email) {
        try {
          const messageBody = `Welcome ${form.name}!\n\nYou have been added as a team member on the DSR Portal.\nYour login email: ${form.email}\nYour password: ${form.password}\n\nPlease keep this information safe.`;
          await emailjs.send(
            EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID,
            {
              to_email:         form.email,
              member_name:      form.name,
              message:          messageBody,
            },
            EMAILJS_PUBLIC_KEY,
          );
        } catch (err) {
          console.warn('Failed to send welcome email:', err);
        }
      }
    }
    setSaved(true);
    setTimeout(close, 600);
  };

  const handleDelete = (id) => {
    deleteMember(id);
    setDeleteId(null);
  };

  const filtered = members.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.role?.toLowerCase().includes(search.toLowerCase()) ||
    m.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-brand-600 flex items-center justify-center shadow-lg">
            <Users size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Team Members</h1>
            <p className="text-sm text-slate-500">{members.length} member{members.length !== 1 ? 's' : ''} registered</p>
          </div>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Member
        </button>
      </div>

      {/* Search bar */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            className="input-field pl-9"
            placeholder="Search by name, role or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Users size={40} className="opacity-30" />
          <p className="text-sm">{search ? 'No members match your search.' : 'No team members yet — add one!'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((m) => (
            <MemberCard
              key={m.id}
              member={m}
              onEdit={openEdit}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={close} title={editId ? 'Edit Member' : 'Add Team Member'}>
        <form onSubmit={handleSave} className="space-y-4">
          {saved && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium animate-fade-in">
              <CheckCircle2 size={16} /> Saved successfully!
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name *" icon={Users}>
              <input
                className="input-field"
                placeholder="John Smith"
                value={form.name}
                onChange={set('name')}
                required
                autoFocus
              />
            </Field>

            <Field label="Email" icon={Mail}>
              <input
                className="input-field"
                placeholder="john@company.com"
                type="email"
                value={form.email}
                onChange={set('email')}
              />
            </Field>

            <Field label="Password" icon={Mail}>
              <input
                className="input-field"
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={set('password')}
              />
            </Field>

            <Field label="Role / Designation" icon={Briefcase}>
              <input
                className="input-field"
                placeholder="e.g. Developer"
                value={form.role}
                onChange={set('role')}
                list="roles-list-modal"
              />
              <datalist id="roles-list-modal">
                {['Developer','Designer','Project Manager','QA Engineer','DevOps','Business Analyst','Scrum Master'].map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </Field>

            <Field label="Department" icon={Building2}>
              <input
                className="input-field"
                placeholder="e.g. Engineering"
                value={form.department}
                onChange={set('department')}
                list="dept-list-modal"
              />
              <datalist id="dept-list-modal">
                {['Engineering','Design','Management','QA','DevOps','Sales','Support'].map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
            <button type="button" onClick={close} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              <Plus size={15} />{editId ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Remove Member" size="sm">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
          Are you sure you want to remove{' '}
          <strong className="text-slate-800 dark:text-slate-200">
            {members.find((m) => m.id === deleteId)?.name}
          </strong>?
          This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
          <button onClick={() => handleDelete(deleteId)} className="btn-danger">
            <Trash2 size={15} /> Remove
          </button>
        </div>
      </Modal>
    </div>
  );
}
