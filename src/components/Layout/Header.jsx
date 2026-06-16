// src/components/Layout/Header.jsx

import { useState } from 'react';
import ThemeToggle from '../UI/ThemeToggle';
import ProfileMenu from '../UI/ProfileMenu';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SmartData" className="h-8 w-auto object-contain" />
            <div className="hidden sm:block">
              <p className="text-lg text-slate-800 font-bold dark:text-white tracking-wide">DSR Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 lg:pr-4 pr-12">
            {/* The pr-12 on mobile is to avoid overlapping with the absolute mobile menu button in the sidebar if needed. */}
            <ThemeToggle />
            <ProfileMenu />
          </div>
        </div>
      </header>       
    </>
  );
}
