// src/pages/DSRRecords.jsx
import { useState, useMemo } from 'react';
import { format, isWithinInterval, parseISO } from 'date-fns';
import {
  Search, Trash2, ChevronLeft, ChevronRight,
  FileSpreadsheet, Download, ClipboardX, Filter,
} from 'lucide-react';
import { useDSR } from '../context/DSRContext';
import DateRangePicker from '../components/UI/DateRangePicker';
import SearchableSelect from '../components/UI/SearchableSelect';

const STATUS_COLORS = {
  'Completed':      'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-400 dark:border-emerald-700/40',
  'In Progress':    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/60 dark:text-blue-400 dark:border-blue-700/40',
  'Blocked':        'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/60 dark:text-red-400 dark:border-red-700/40',
  'On Hold':        'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/60 dark:text-amber-400 dark:border-amber-700/40',
  'Review Pending': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/60 dark:text-purple-400 dark:border-purple-700/40',
};
const BILLING_COLORS = {
  'Billable':     'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/60 dark:text-green-400 dark:border-green-700/40',
  'Non-Billable': 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/60 dark:text-slate-400 dark:border-slate-600',
  'Internal':     'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/60 dark:text-indigo-400 dark:border-indigo-700/40',
  'Support':      'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/60 dark:text-orange-400 dark:border-orange-700/40',
};

const PAGE_SIZE = 10;

export default function DSRRecords() {
  const { entries, deleteEntry, projects } = useDSR();

  // Filters
  const [search,      setSearch]      = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [startDate,   setStartDate]   = useState(null);
  const [endDate,     setEndDate]     = useState(null);
  const [page,        setPage]        = useState(1);
  const [deleteId,    setDeleteId]    = useState(null);

  // Feature 10 — project names from CRUD, searchable
  const projectOptions = [
    { label: 'All Projects', value: '' },
    ...projects.map((p) => ({ label: p.name, value: p.name })),
  ];

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchSearch  = !search  || e.memberName?.toLowerCase().includes(search.toLowerCase()) || e.workDescription?.toLowerCase().includes(search.toLowerCase());
      const matchProject = !projectFilter || e.project === projectFilter;
      let   matchDate    = true;
      // Feature 9 — date range filter
      if (startDate || endDate) {
        try {
          const entryDate = parseISO(e.date);
          const from = startDate || new Date('1970-01-01');
          const to   = endDate   || new Date('2099-12-31');
          matchDate = isWithinInterval(entryDate, { start: from, end: to });
        } catch { matchDate = true; }
      }
      return matchSearch && matchProject && matchDate;
    });
  }, [entries, search, projectFilter, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters = search || projectFilter || startDate || endDate;
  const clearAll   = () => { setSearch(''); setProjectFilter(''); setStartDate(null); setEndDate(null); setPage(1); };

  const exportCSV = () => {
    const headers = ['Date','Member','Project','Duration','Time Spent','Status','Billing Type','Billing','Description'];
    const rows    = filtered.map((e) => [
      e.date, e.memberName, e.project, e.taskDuration, e.timeSpent,
      e.status, e.billingType, e.billing, `"${(e.workDescription || '').replace(/"/g, '""')}"`,
    ]);
    const csv  = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `DSR_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const fmtDate = (s) => {
    try { return s ? format(parseISO(s), 'dd MMM yy') : '—'; } catch { return '—'; }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-brand-600 flex items-center justify-center shadow-lg">
            <FileSpreadsheet size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">DSR Records</h1>
            <p className="text-sm text-slate-500">{filtered.length} entr{filtered.length === 1 ? 'y' : 'ies'} found</p>
          </div>
        </div>
        <button onClick={exportCSV} className="btn-secondary text-sm">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <Filter size={14} /> Filters
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input-field pl-9"
              placeholder="Search member or description..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Feature 10 — Searchable project dropdown */}
          <SearchableSelect
            options={projectOptions}
            value={projectFilter}
            onChange={(v) => { setProjectFilter(v); setPage(1); }}
            placeholder="Filter by project..."
          />
        </div>

        {/* Feature 9 — Date range picker with calendars */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date Range</p>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartChange={(d) => { setStartDate(d); setPage(1); }}
            onEndChange={(d)   => { setEndDate(d);   setPage(1); }}
            onClear={() => { setStartDate(null); setEndDate(null); setPage(1); }}
          />
        </div>

        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-brand-500 hover:text-brand-400 underline underline-offset-2 w-fit">
            Clear all filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <ClipboardX size={40} className="opacity-30" />
            <p className="text-sm">No records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['Date','Member','Project','Duration','Time Spent','Status','Billing Type','Amount','Description',''].map((h) => (
                    <th key={h} className="th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((entry) => (
                  <tr key={entry.id} className="tr group">
                    <td className="td font-medium whitespace-nowrap">{fmtDate(entry.date)}</td>
                    <td className="td font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">{entry.memberName}</td>
                    <td className="td whitespace-nowrap">
                      <span className="badge bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/60 dark:text-brand-400 dark:border-brand-700/40">
                        {entry.project}
                      </span>
                    </td>
                    <td className="td whitespace-nowrap">{entry.taskDuration}</td>
                    <td className="td whitespace-nowrap">{entry.timeSpent}</td>
                    <td className="td whitespace-nowrap">
                      <span className={`badge ${STATUS_COLORS[entry.status] || 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="td whitespace-nowrap">
                      <span className={`badge ${BILLING_COLORS[entry.billingType] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {entry.billingType}
                      </span>
                    </td>
                    <td className="td whitespace-nowrap font-medium text-emerald-600 dark:text-emerald-400">
                      {entry.billing ? `₹${Number(entry.billing).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="td max-w-xs">
                      <p className="truncate max-w-[180px] text-slate-500 dark:text-slate-400" title={entry.workDescription}>
                        {entry.workDescription}
                      </p>
                    </td>
                    <td className="td">
                      <button
                        onClick={() => setDeleteId(entry.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700/50">
            <p className="text-xs text-slate-400">Page {page} of {totalPages} · {filtered.length} total</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary p-2 disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-secondary p-2 disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm inline */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative card max-w-sm w-full animate-scale-in">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">Delete Record</h3>
            <p className="text-sm text-slate-500 mb-5">This DSR entry will be permanently removed.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => { deleteEntry(deleteId); setDeleteId(null); }} className="btn-danger">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
