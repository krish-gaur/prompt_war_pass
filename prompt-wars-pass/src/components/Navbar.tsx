import { Sparkles } from 'lucide-react';
import { BrandMark } from './BrandIcons';

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#04050c]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-3">
          <BrandMark size={34} />
          <div className="leading-tight">
            <div className="text-[15px] font-extrabold tracking-wide text-white">
              Prompt <span className="text-cyan-300">Wars</span>
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
              Pass Generator
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-300 md:flex">
          <a href="#creator" className="transition hover:text-cyan-300">
            Create Pass
          </a>
          <a href="#your-pass" className="transition hover:text-cyan-300">
            Your Pass
          </a>
          <a href="#event-info" className="transition hover:text-cyan-300">
            Event Info
          </a>
        </nav>

        <a href="#creator" className="btn-primary whitespace-nowrap px-3.5 py-2.5 text-[12px] sm:px-5 sm:text-[13px]">
          <Sparkles size={15} />
          <span className="sm:hidden">CREATE</span>
          <span className="hidden sm:inline">CREATE MY PASS</span>
        </a>
      </div>
    </header>
  );
}
