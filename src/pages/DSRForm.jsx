// src/pages/DSRForm.jsx
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import emailjs from '@emailjs/browser';
import {
  Send, User, FolderOpen, Clock, CheckSquare,
  DollarSign, FileText, Calendar, Loader2, Info,
} from 'lucide-react';
import { useDSR } from '../context/DSRContext';
import Toast from '../components/UI/Toast';
import CalendarPicker from '../components/UI/CalendarPicker';
import SearchableSelect from '../components/UI/SearchableSelect';
import {
  STATUSES, BILLING_TYPES, TIME_SPENT_OPTIONS, TIME_SPENT_HOURS,
  EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, COMPANY_EMAIL,
} from '../data/constants';

// ─── Field wrapper defined OUTSIDE the component to prevent focus-loss on re-render ──
function Field({ label, icon: Icon, required, children, hint }) {
  return (
    <div>
      <label className="label">
        {Icon && <Icon size={12} className="text-brand-500" />}
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const todayDate = () => new Date();
const toStr = (d) => { try { return d ? format(d, 'yyyy-MM-dd') : ''; } catch { return ''; } };
const toDate = (s) => { try { return s ? new Date(s + 'T00:00:00') : null; } catch { return null; } };

const EMPTY = {
  memberName: '',
  project: '',
  taskDuration: '',
  status: '',
  timeSpent: '',
  billing: '',
  billingType: '',
  workDescription: '',
  date: toStr(todayDate()),
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function DSRForm() {
  const { addEntry, projects, members } = useDSR();

  const getInitialForm = () => {
    const defaultForm = { ...EMPTY, date: toStr(todayDate()) };
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const role = (parsed?.role || parsed?.designation || "").toLowerCase();
        if (role !== 'admin' && role !== 'administrator') {
          defaultForm.memberName = parsed.name || '';
        }
      } catch (e) { }
    }
    return defaultForm;
  };

  const [isAdmin] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const role = (parsed?.role || parsed?.designation || "").toLowerCase();
        return role === 'admin' || role === 'administrator';
      } catch (e) { }
    }
    return false;
  });

  const [form, setForm] = useState(getInitialForm);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const setV = (field) => (val) => setForm((p) => ({ ...p, [field]: val }));

  // Auto-calculate billing from project rate × time
  useEffect(() => {
    const proj = projects.find((p) => p.name === form.project);
    if (proj && proj.billingRate > 0 && form.timeSpent) {
      const hrs = TIME_SPENT_HOURS[form.timeSpent] || 0;
      const amount = (proj.billingRate * hrs).toFixed(2);
      setForm((p) => ({ ...p, billing: amount }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.project, form.timeSpent]);

  // Auto-set billing type from project
  useEffect(() => {
    const proj = projects.find((p) => p.name === form.project);
    if (proj) {
      setForm((p) => ({ ...p, billingType: proj.billingRate > 0 ? 'Billable' : 'Non-Billable' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.project]);

  const validate = () => {
    const req = ['memberName', 'project', 'taskDuration', 'status', 'timeSpent', 'billingType', 'workDescription', 'date'];
    return req.every((f) => form[f]?.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { setToast({ type: 'error', message: 'Please fill all required fields.' }); return; }
    setLoading(true);
    try {
      await addEntry(form);

      // 1. Create a rich text message for the email body
      const messageBody = `
Daily Status Report for ${form.date}
--------------------------------------------------
Team Member: ${form.memberName}
Project: ${form.project}
Task Duration: ${form.taskDuration}
Time Spent: ${form.timeSpent}
Status: ${form.status}
Billing Type: ${form.billingType}
Billing Amount: $${form.billing || 0}

Work Description:
${form.workDescription}
--------------------------------------------------
      `.trim();

      // 2. Generate Excel file and encode to base64
      let base64Excel = '';
      try {
        const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet([{
          Date: form.date,
          Member: form.memberName,
          Project: form.project,
          Duration: form.taskDuration,
          'Time Spent': form.timeSpent,
          Status: form.status,
          'Billing Type': form.billingType,
          Billing: form.billing || 0,
          Description: form.workDescription,
        }]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'DSR');
        // Generate base64 string
        base64Excel = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
      } catch (err) {
        console.warn('Failed to generate Excel file:', err);
      }

      await emailjs.send(
        EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID,
        {
          to_email: COMPANY_EMAIL,
          member_name: form.memberName,
          project: form.project,
          task_duration: form.taskDuration,
          status: form.status,
          time_spent: form.timeSpent,
          billing: form.billing,
          billing_type: form.billingType,
          work_description: form.workDescription,
          date: form.date,
          message: messageBody,      // Default text variable
          content: base64Excel,      // Default attachment variable in EmailJS
        },
        EMAILJS_PUBLIC_KEY,
      );
      setToast({ type: 'success', message: 'DSR submitted and email sent successfully!' });
      setForm(getInitialForm());
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'DSR saved. Email failed — check your EmailJS config.' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => setForm(getInitialForm());
  const activeProjects = projects.map((p) => p.name);
  const memberNames = members.map((m) => m.name);
  const selectedProj = projects.find((p) => p.name === form.project);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-900/20">
          <Send size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gradient">Submit Daily Status Report</h1>
          <p className="text-sm text-slate-500">Fill in your task details for the day</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card animate-slide-up space-y-6">

        {/* Row 1 — Member | Project | Report Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Field label="Team Member Name" icon={User} required>
            <SearchableSelect
              options={memberNames}
              value={form.memberName}
              onChange={setV('memberName')}
              placeholder="Select member..."
              emptyText="No members. Add via Team Members page."
              disabled={!isAdmin}
            />
          </Field>

          <Field label="Project" icon={FolderOpen} required>
            <SearchableSelect
              options={activeProjects}
              value={form.project}
              onChange={setV('project')}
              placeholder="Select project..."
              emptyText="No projects. Add via Projects page."
            />
          </Field>

          <Field label="Report Date" icon={Calendar} required>
            <CalendarPicker
              selected={toDate(form.date)}
              onChange={(d) => setForm((p) => ({ ...p, date: toStr(d) }))}
              placeholder="Select report date"
              maxDate={new Date()}
            />
          </Field>
        </div>

        {/* Project info banner */}
        {selectedProj && (
          <div className="rounded-xl px-4 py-3 flex flex-wrap items-center gap-4 text-sm animate-fade-in
            bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-700/40
            text-brand-700 dark:text-brand-300">
            <Info size={15} className="shrink-0" />
            <span><strong>{selectedProj.name}</strong>{selectedProj.client ? ` · ${selectedProj.client}` : ''}</span>
            {selectedProj.billingRate > 0 && (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                $ {Number(selectedProj.billingRate).toLocaleString('en-IN')}/hr
              </span>
            )}
            {selectedProj.startDate && <span>📅 {format(new Date(selectedProj.startDate + 'T00:00:00'), 'dd MMM yyyy')}</span>}
            {selectedProj.endDate && <span>→ {format(new Date(selectedProj.endDate + 'T00:00:00'), 'dd MMM yyyy')}</span>}
          </div>
        )}

        {/* Row 2 — Duration | Time Spent | Status | Billing Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Field label="Task Duration" icon={Clock} required hint="e.g. 2 days, 3 hrs">
            <input
              className="input-field"
              placeholder="e.g. 1 day, 4 hrs"
              value={form.taskDuration}
              onChange={set('taskDuration')}
            />
          </Field>

          <Field label="Time Spent" icon={Clock} required>
            <select className="input-field" value={form.timeSpent} onChange={set('timeSpent')}>
              <option value="">Select hours...</option>
              {TIME_SPENT_OPTIONS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="Status" icon={CheckSquare} required>
            <select className="input-field" value={form.status} onChange={set('status')}>
              <option value="">Select status...</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Billing Type" icon={DollarSign} required>
            <select className="input-field" value={form.billingType} onChange={set('billingType')}>
              <option value="">Select type...</option>
              {BILLING_TYPES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </Field>
        </div>

        {/* Row 3 — Billing Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Billing Amount ($)"
            icon={DollarSign}
            hint={
              selectedProj?.billingRate > 0 && form.timeSpent
                ? `Auto-calculated: $${selectedProj.billingRate}/hr × ${TIME_SPENT_HOURS[form.timeSpent] || 0}h`
                : 'Auto-fills when project & time are selected'
            }
          >
            <input
              className="input-field"
              placeholder="Auto-calculated or enter manually"
              value={form.billing}
              onChange={set('billing')}
              type="number"
              min="0"
              step="0.01"
            />
          </Field>

          <div className="flex flex-col">
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-500 mb-1">Today's Date</p>
            <div className="rounded-xl px-4 py-3 w-full border transition-colors
              bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">

              <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                {format(new Date(), 'EEEE, dd MMMM yyyy')}
              </p>
            </div>
          </div>
        </div>

        {/* Work Description */}
        <Field label="Work Description" icon={FileText} required>
          <textarea
            className="input-field resize-none"
            rows={5}
            placeholder="Describe the tasks you worked on in detail..."
            value={form.workDescription}
            onChange={set('workDescription')}
          />
        </Field>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/50">
          <p className="text-xs text-slate-400">
            <span className="text-red-400">*</span> Required fields
          </p>
          <div className="flex gap-3">
            <button type="button" className="btn-secondary" onClick={handleReset}>
              Reset
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                : <><Send size={16} /> Submit DSR</>
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
