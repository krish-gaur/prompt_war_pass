import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { onNotify } from '../lib/notify';

export default function Toast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    onNotify((msg) => {
      setMessage(msg);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setMessage(null), 3200);
    });
    return () => {
      window.clearTimeout(timer);
      onNotify(null);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4"
    >
      <div
        className={`flex items-center gap-2.5 rounded-full border border-cyan-300/30 bg-[#071022]/95 px-5 py-3 text-sm font-semibold text-cyan-50 shadow-[0_0_36px_rgba(34,211,238,0.28)] transition-all duration-300 ${
          message ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300">
          <Check size={13} strokeWidth={3} />
        </span>
        {message ?? ''}
      </div>
    </div>
  );
}
