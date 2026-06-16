// src/components/UI/ProfileMenu.jsx
import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileMenu() {
  const { theme } = useTheme();
  const [user, setUser] = useState({
    name: "Guest User",
    designation: "Visitor",
    email: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log("Retrieved user from local storage:", storedUser);
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
          setUser({
            name: parsed?.name ?? "Guest User",
            designation: parsed?.designation ?? parsed?.role ?? "Visitor",
            role: parsed?.role ?? parsed?.designation ?? "Member",
            email: parsed?.email ?? ""
          });
        }
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
      }
    }
  }, []);

  const getInitials = (name = "") => {
    const words = name.trim().split(" ");
    if (words.length === 0 || !words[0]) return "U";
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const initials = getInitials(user.name);

  return (
    <div className="flex items-center gap-2 sm:gap-3 p-1 sm:pr-3 rounded-full sm:rounded-xl border border-transparent transition-colors">
      <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white font-semibold shadow-sm shrink-0">
        {initials}
      </div>

      <div className="hidden sm:flex flex-col items-start leading-tight">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {user.name}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium capitalize">
          {user.role || 'Member'}
        </span>
      </div>
    </div>
  );
}
