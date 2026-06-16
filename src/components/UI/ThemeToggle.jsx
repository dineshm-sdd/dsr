// src/components/UI/ThemeToggle.jsx
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="
         relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
        bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700
        border border-slate-200 dark:border-slate-700
        text-amber-500 dark:text-brand-400 shrink-0
      "
    >
      <span className={`absolute transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}>
        <Moon size={18} />
      </span>
      <span className={`absolute transition-all duration-300 ${theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}>
        <Sun size={18} />
      </span>
    </button>
  );
}
