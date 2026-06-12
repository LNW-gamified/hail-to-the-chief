'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

type ToastItem = {
  id: string;
  name: string;
  icon: string;
  points: number;
};

type ToastContextValue = {
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(() => dismissRef.current(), 350);
    }, 4200);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(hide);
    };
  }, []);

  return (
    <div
      className="pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{
        minWidth: 280,
        maxWidth: 360,
        background: '#111F33',
        border: '1.5px solid rgba(201,168,76,0.55)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,168,76,0.08)',
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
      }}
    >
      <span className="shrink-0 text-2xl leading-none">{item.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[9px] tracking-widest text-gold/55 mb-0.5 uppercase">
          Achievement Unlocked
        </p>
        <p className="font-serif text-sm text-cream truncate">{item.name}</p>
      </div>
      <span className="font-mono text-sm font-bold text-gold shrink-0">+{item.points} XP</span>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `ach-toast-${++counterRef.current}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        className="fixed left-1/2 -translate-x-1/2 flex flex-col gap-2.5 items-center pointer-events-none z-[9999] bottom-20 md:bottom-6"
      >
        {toasts.map(t => (
          <Toast key={t.id} item={t} onDismiss={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
