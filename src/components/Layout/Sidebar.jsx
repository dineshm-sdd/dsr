// src/components/Layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ClipboardList, LayoutDashboard, BarChart3,
  Menu, X, Zap, Users, FolderKanban, LogOut,
} from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from '../UI/ThemeToggle';

const NAV = [
  { to: '/', icon: ClipboardList, label: 'Submit DSR' },
  { to: '/records', icon: LayoutDashboard, label: 'DSR Records' },
  { to: '/analysis', icon: BarChart3, label: 'Project Analysis' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/members', icon: Users, label: 'Team Members' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="
          lg:hidden fixed top-3 right-5 z-50 p-2.5 rounded-xl shadow-md
          bg-white dark:bg-slate-800
          border border-slate-200 dark:border-slate-700
          text-slate-600 dark:text-slate-300
        "
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 lg:z-auto  w-64
        sidebar-bg flex flex-col transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      
      
        {/* Nav */}
        <nav className="flex-1 px-3 py-4  flex flex-col gap-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700/50 flex flex-col gap-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
          <div className="px-2">
            <p className="text-xs text-slate-400 dark:text-slate-600">© 2026 SmartDataInc. All rights reserved.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
