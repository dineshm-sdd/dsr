// src/components/UI/SearchableSelect.jsx
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

/**
 * Searchable dropdown select
 * Props:
 *   options  – string[] | { label, value }[]
 *   value    – currently selected value (string)
 *   onChange – (value: string) => void
 *   placeholder – string
 *   emptyText – string shown when no options match
 */
export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  emptyText = 'No options found',
  disabled = false,
}) {
  const [open,   setOpen]   = useState(false);
  const [query,  setQuery]  = useState('');
  const ref   = useRef(null);
  const input = useRef(null);

  // Normalise to { label, value }
  const normalised = options.map((o) =>
    typeof o === 'string' ? { label: o, value: o } : o
  );

  const filtered = normalised.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  const selected = normalised.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search when opening
  useEffect(() => {
    if (open && input.current) input.current.focus();
  }, [open]);

  const select = (val) => {
    onChange(val);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`input-field flex items-center justify-between text-left ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
        disabled={disabled}
      >
        <span className={selected ? '' : 'text-slate-400 dark:text-slate-500'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={15}
          className={`ml-2 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="
          absolute z-[500] w-full mt-1 rounded-xl shadow-2xl overflow-hidden animate-slide-down
          border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700
        ">
          {/* Search */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-700/50">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={input}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="
                  w-full pl-8 pr-3 py-2 text-sm rounded-lg outline-none
                  bg-slate-50 dark:bg-slate-700/60
                  border border-slate-200 dark:border-slate-600
                  text-slate-800 dark:text-slate-100
                  placeholder-slate-400 dark:placeholder-slate-500
                  focus:ring-1 focus:ring-brand-500
                "
              />
            </div>
          </div>

          {/* Options */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500 text-center">{emptyText}</li>
            ) : (
              filtered.map((o) => (
                <li
                  key={o.value}
                  onClick={() => select(o.value)}
                  className={`
                    flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors
                    ${o.value === value
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }
                  `}
                >
                  {o.label}
                  {o.value === value && <Check size={14} className="text-brand-600 dark:text-brand-400 shrink-0" />}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
