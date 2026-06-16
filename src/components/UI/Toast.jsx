// src/components/UI/Toast.jsx
import { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-slide-up">
      <div className={`
        flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border max-w-sm backdrop-blur-xl
        ${isSuccess
          ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300'
          : 'bg-red-50 dark:bg-red-950/90 border-red-300 dark:border-red-700/50 text-red-700 dark:text-red-300'
        }
      `}>
        {isSuccess
          ? <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
          : <XCircle      size={20} className="mt-0.5 shrink-0" />
        }
        <div className="flex-1">
          <p className="text-sm font-semibold">{isSuccess ? 'Success' : 'Error'}</p>
          <p className="text-xs mt-0.5 opacity-80">{toast.message}</p>
        </div>
        <button onClick={onClose} className="text-current opacity-60 hover:opacity-100 mt-0.5">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
