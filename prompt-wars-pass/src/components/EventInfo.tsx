import { Calendar, MapPin, Wrench, Sparkles } from 'lucide-react';
import { BrandMark, CubeMark } from './BrandIcons';

const items = [
  {
    icon: <Calendar size={22} />,
    label: 'Date',
    value: '12 December 2026',
    accent: 'from-cyan-400 to-sky-500',
  },
  {
    icon: <MapPin size={22} />,
    label: 'Venue',
    value: 'Thoughtworks Technologies',
    accent: 'from-indigo-400 to-violet-500',
  },
  {
    icon: <Wrench size={22} />,
    label: 'Format',
    value: 'Workshop + Build-A-Thon',
    accent: 'from-fuchsia-400 to-purple-500',
  },
  {
    icon: <Sparkles size={22} />,
    label: 'Category',
    value: 'Participant · Think · Prompt · Build',
    accent: 'from-amber-300 to-yellow-500',
  },
];

export default function EventInfo() {
  return (
    <section id="event-info" className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.32em] text-cyan-300">
            Event Information
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Everything about <span className="text-gradient">Prompt Wars</span>
          </h2>
          <p className="mt-4 text-slate-400">
            A one-day workshop + build-a-thon where you experiment, create, and push the boundaries
            of AI through prompts.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div
              key={it.label}
              className="gradient-border rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-1"
            >
              <div
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${it.accent} text-[#06121f]`}
              >
                {it.icon}
              </div>
              <div className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                {it.label}
              </div>
              <div className="mt-1.5 text-lg font-bold leading-snug text-white">{it.value}</div>
            </div>
          ))}
        </div>

        <div className="gradient-border mt-6 flex flex-col items-center justify-between gap-6 rounded-2xl p-7 sm:flex-row">
          <div className="flex items-center gap-4">
            <BrandMark size={44} />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Organized by
              </div>
              <div className="text-xl font-extrabold text-white">AlGlorythm</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Sponsored by
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white">
              OSEN
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white">
              <CubeMark size={16} /> Craftora
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
