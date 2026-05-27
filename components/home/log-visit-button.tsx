'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PenLine } from 'lucide-react';
import LogVisitModal, { type LogVisitSuccessData } from '@/components/visits/log-visit-modal';

export default function HomeLogVisitButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleSuccess(_data: LogVisitSuccessData) {
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 font-mono text-sm font-bold bg-gold text-navy px-4 py-2 rounded-xl hover:bg-gold/90 transition-colors"
      >
        <PenLine size={14} /> Log a Visit
      </button>

      {open && (
        <LogVisitModal
          onClose={() => setOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
