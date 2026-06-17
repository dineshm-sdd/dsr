// src/pages/ProjectAnalysis.jsx
import { useMemo, useState } from 'react';
import { useDSR } from '../context/DSRContext';
import { isWithinInterval, parseISO } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { TrendingUp, Users, Clock, DollarSign, BarChart3, Search } from 'lucide-react';
import { format } from 'date-fns';
import SearchableSelect from '../components/UI/SearchableSelect';
import DateRangePicker from '../components/UI/DateRangePicker';

const COLORS = ['#4f6bff', '#a78bfa', '#34d399', '#f59e0b', '#f87171', '#38bdf8', '#fb7185'];

const parseTime = (str = '') => {
  const hrMatch = str.match(/(\d+(?:\.\d+)?)\s*h/i);
  const minMatch = str.match(/(\d+)\s*m/i);
  return (hrMatch ? parseFloat(hrMatch[1]) : 0) + (minMatch ? parseInt(minMatch[1]) / 60 : 0);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 shadow-xl text-sm border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="text-xs">
          {p.name}: <span className="font-bold">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function ProjectAnalysis() {
  const { entries, projects } = useDSR();

  // Feature 11 — searchable project + date range filter
  const [selectedProject, setSelectedProject] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Project options with search
  const projectOptions = [
    { label: 'All Projects', value: '' },
    ...projects.map((p) => ({ label: p.name, value: p.name })),
  ];

  // Base filtered entries
  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchProject = !selectedProject || e.project === selectedProject;
      let matchDate = true;
      if (startDate || endDate) {
        try {
          const d = parseISO(e.date);
          const from = startDate || new Date('1970-01-01');
          const to = endDate || new Date('2099-12-31');
          matchDate = isWithinInterval(d, { start: from, end: to });
        } catch { matchDate = true; }
      }
      return matchProject && matchDate;
    });
  }, [entries, selectedProject, startDate, endDate]);

  // KPIs
  const kpis = useMemo(() => {
    const totalHrs = filtered.reduce((s, e) => s + parseTime(e.timeSpent), 0);
    const billable = filtered.filter((e) => e.billingType === 'Billable');
    const billableHrs = billable.reduce((s, e) => s + parseTime(e.timeSpent), 0);
    const totalBill = billable.reduce((s, e) => s + (parseFloat(e.billing) || 0), 0);
    const members = new Set(filtered.map((e) => e.memberName)).size;
    return { totalHrs, billableHrs, totalBill, members, count: filtered.length };
  }, [filtered]);

  // Hours per project
  const projectHoursData = useMemo(() => {
    const projectList = selectedProject
      ? projects.filter((p) => p.name === selectedProject)
      : projects;
    return projectList
      .map((p) => ({
        name: p.name,
        hours: filtered.filter((e) => e.project === p.name).reduce((s, e) => s + parseTime(e.timeSpent), 0),
        tasks: filtered.filter((e) => e.project === p.name).length,
      }))
      .filter((d) => d.tasks > 0);
  }, [filtered, projects, selectedProject]);

  // Billing distribution
  const billingData = useMemo(() => {
    const map = {};
    filtered.forEach((e) => { map[e.billingType] = (map[e.billingType] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // Status breakdown
  const statusData = useMemo(() => {
    const map = {};
    filtered.forEach((e) => { map[e.status] = (map[e.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // Daily trend (last 14 days)
  const trendData = useMemo(() => {
    const map = {};
    filtered.forEach((e) => {
      if (!e.date) return;
      map[e.date] = (map[e.date] || 0) + parseTime(e.timeSpent);
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, hours]) => ({ date: format(parseISO(date), 'dd MMM'), hours: +hours.toFixed(1) }));
  }, [filtered]);

  // Member contribution
  const memberData = useMemo(() => {
    const map = {};
    filtered.forEach((e) => {
      if (!e.memberName) return;
      if (!map[e.memberName]) map[e.memberName] = { hours: 0, tasks: 0 };
      map[e.memberName].hours += parseTime(e.timeSpent);
      map[e.memberName].tasks += 1;
    });
    return Object.entries(map)
      .map(([name, d]) => ({ name, hours: +d.hours.toFixed(1), tasks: d.tasks }))
      .sort((a, b) => b.hours - a.hours);
  }, [filtered]);

  const KPICard = ({ icon: Icon, label, value, sub, gradient }) => (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-lg`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );

  const noData = (msg = 'No data yet') => (
    <p className="text-slate-400 text-sm text-center py-10">{msg}</p>
  );

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <BarChart3 size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Project Analysis</h1>
            <p className="text-sm text-slate-500">Insights from {entries.length} total entries</p>
          </div>
        </div>
      </div>

      {/* Feature 11 — Searchable project + date range filter */}
      <div className="card space-y-4">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Search size={14} /> Filter Analysis
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Project</p>
            <SearchableSelect
              options={projectOptions}
              value={selectedProject}
              onChange={setSelectedProject}
              placeholder="Search & select project..."
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date Range</p>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
              onClear={() => { setStartDate(null); setEndDate(null); }}
            />
          </div>
        </div>
        {(selectedProject || startDate || endDate) && (
          <button
            onClick={() => { setSelectedProject(''); setStartDate(null); setEndDate(null); }}
            className="text-xs text-brand-500 hover:text-brand-400 underline underline-offset-2 w-fit"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Clock} label="Total Hours" value={`${kpis.totalHrs.toFixed(1)}h`} sub={`${kpis.billableHrs.toFixed(1)}h billable`} gradient="from-brand-600 to-brand-700" />
        <KPICard icon={TrendingUp} label="Total Entries" value={kpis.count} sub="DSR submissions" gradient="from-purple-600 to-purple-700" />
        <KPICard icon={Users} label="Team Members" value={kpis.members} sub="unique contributors" gradient="from-cyan-600 to-cyan-700" />
        <KPICard icon={DollarSign} label="Billable Value" value={kpis.totalBill ? `$ ${kpis.totalBill.toLocaleString('en-IN')}` : '—'} sub="from billable entries" gradient="from-emerald-600 to-emerald-700" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4">Hours per Project</h2>
          {projectHoursData.length === 0 ? noData() : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={projectHoursData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700/60" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-slate-500" />
                <YAxis tick={{ fontSize: 11 }} className="text-slate-500" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" name="Hours" radius={[6, 6, 0, 0]}>
                  {projectHoursData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4">Billing Distribution</h2>
          {billingData.length === 0 ? noData() : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={billingData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {billingData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4">Daily Hours Trend</h2>
          {trendData.length === 0 ? noData() : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700/60" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="hours" name="Hours" stroke="#4f6bff" strokeWidth={2.5}
                  dot={{ fill: '#4f6bff', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4">Status Breakdown</h2>
          {statusData.length === 0 ? noData() : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} layout="vertical" barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700/60" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={115} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Tasks" radius={[0, 6, 6, 0]}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Member Contribution Table */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/50">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Team Member Contribution</h2>
        </div>
        {memberData.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-slate-400">
            <Users size={36} className="opacity-30" />
            <p className="text-sm">No entries yet. Submit a DSR to see data here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['Rank', 'Member', 'Tasks', 'Total Hours', 'Avg hrs/task'].map((h) => (
                    <th key={h} className="th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {memberData.map((m, i) => (
                  <tr key={m.name} className="tr">
                    <td className="td">
                      <span className={`badge ${i === 0 ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-700/40' :
                          i === 1 ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600' :
                            'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-500 dark:border-orange-700/30'
                        }`}>#{i + 1}</span>
                    </td>
                    <td className="td font-semibold text-slate-800 dark:text-slate-100">{m.name}</td>
                    <td className="td">{m.tasks}</td>
                    <td className="td font-medium text-brand-600 dark:text-brand-400">{m.hours}h</td>
                    <td className="td text-slate-500">{(m.hours / m.tasks).toFixed(1)}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
