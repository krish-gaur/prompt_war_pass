import { BrandMark } from './BrandIcons';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.07] bg-[#03040a] py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <BrandMark size={30} />
          <div className="text-lg font-extrabold text-white">
            Prompt <span className="text-cyan-300">Wars</span>
            <span className="ml-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              by AlGlorythm
            </span>
          </div>
        </div>

        <div className="text-sm text-slate-400">Made with creativity by AlGlorythm.</div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          <span>Think · Prompt · Build</span>
          <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:block" />
          <span>12 December 2026</span>
          <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:block" />
          <span>Workshop + Build-A-Thon</span>
        </div>

        <p className="max-w-xl text-[11px] leading-relaxed text-slate-600">
          Your photo is processed entirely in your browser. Nothing is uploaded or stored on any
          server.
        </p>
      </div>
    </footer>
  );
}
