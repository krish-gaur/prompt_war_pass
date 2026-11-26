import { ArrowRight, Calendar, MapPin, ShieldCheck, Timer, Zap } from 'lucide-react';
import PassCanvas from './PassCanvas';

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20">
      {/* Background decoration */}
      <div className="grid-bg absolute inset-0" aria-hidden="true" />
      <div className="orb left-[-140px] top-[-80px] h-[420px] w-[420px] bg-cyan-500/25" aria-hidden="true" />
      <div className="orb right-[-120px] top-[120px] h-[380px] w-[380px] bg-purple-600/25" aria-hidden="true" />
      <div className="orb bottom-[-160px] left-1/3 h-[320px] w-[320px] bg-indigo-600/20" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:px-8">
        {/* Copy */}
        <div className="animate-fade-up text-center lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200">
            <Zap size={13} className="text-yellow-300" />
            Workshop + Build-A-Thon · 12 Dec 2026
          </div>

          <h1 className="text-[2.65rem] font-black leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[4.35rem]">
            READY TO ENTER THE{' '}
            <span className="text-gradient">PROMPT WARS?</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg font-medium text-slate-300 lg:mx-0">
            Create your official participant pass in seconds.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-slate-400 lg:mx-0">
            Your Prompt Wars identity starts here — upload your photo, add your name and college,
            and download a premium pass built to be shared on LinkedIn, Instagram and WhatsApp.
          </p>

          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <button
              type="button"
              onClick={() => scrollTo('creator')}
              className="btn-primary w-full px-8 py-4 text-[15px] sm:w-auto"
            >
              <span className="sheen" aria-hidden="true" />
              CREATE MY PASS
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollTo('event-info')}
              className="btn-ghost w-full px-7 py-3.5 text-sm sm:w-auto"
            >
              Explore the event
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-[12.5px] font-medium text-slate-400 lg:justify-start">
            <span className="inline-flex items-center gap-1.8">
              <ShieldCheck size={15} className="text-emerald-400" /> No sign-up · 100% in-browser
            </span>
            <span className="inline-flex items-center gap-1.8">
              <Timer size={15} className="text-cyan-300" /> Ready in under a minute
            </span>
            <span className="inline-flex items-center gap-1.8">
              <Calendar size={15} className="text-purple-300" /> 12 December 2026
            </span>
            <span className="inline-flex items-center gap-1.8">
              <MapPin size={15} className="text-pink-300" /> Thoughtworks Technologies
            </span>
          </div>
        </div>

        {/* Floating pass mock */}
        <div className="animate-fade-up relative mx-auto w-full max-w-[330px] lg:max-w-[368px]" style={{ animationDelay: '120ms' }}>
          <div
            className="animate-float relative rounded-[26px] neon-ring-strong"
            style={{ transform: 'rotate(2.2deg)' }}
          >
            <div className="absolute -inset-6 rounded-[36px] bg-cyan-400/10 blur-2xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[22px] border border-white/10">
              <PassCanvas name="" college="" photo={null} crop={null} placeholders decorative />
            </div>
          </div>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan-300/30 bg-[#071022]/90 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200 shadow-lg">
            Think · Prompt · Build
          </div>
        </div>
      </div>
    </section>
  );
}
