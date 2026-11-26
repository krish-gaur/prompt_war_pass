import { useState } from 'react';
import { GraduationCap, Sparkles, User, Zap } from 'lucide-react';
import PhotoUploader from './PhotoUploader';
import PassCanvas from './PassCanvas';
import type { PhotoState } from '../types';

interface PassCreatorProps {
  name: string;
  college: string;
  photo: PhotoState | null;
  openSignal: number;
  onNameChange: (v: string) => void;
  onCollegeChange: (v: string) => void;
  onPhotoReady: (p: PhotoState) => void;
  onPhotoClear: () => void;
  onGenerate: () => void;
}

export default function PassCreator({
  name,
  college,
  photo,
  openSignal,
  onNameChange,
  onCollegeChange,
  onPhotoReady,
  onPhotoClear,
  onGenerate,
}: PassCreatorProps) {
  const [touched, setTouched] = useState(false);

  const nameError = touched && !name.trim() ? 'Please enter your full name.' : null;
  const collegeError = touched && !college.trim() ? 'Please enter your college or university.' : null;
  const photoError = touched && !photo ? 'Please upload your photograph.' : null;

  const handleGenerate = () => {
    setTouched(true);
    if (!photo || !name.trim() || !college.trim()) return;
    onGenerate();
  };

  return (
    <section id="creator" className="relative py-16 sm:py-20">
      <div className="orb right-[-120px] top-20 h-[340px] w-[340px] bg-cyan-500/15" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.32em] text-cyan-300">
            Pass Creator
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Build your <span className="text-gradient">Prompt Wars identity</span>
          </h2>
          <p className="mt-4 text-slate-400">
            Upload your photograph, add your details, and watch your pass come alive in real time.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
          {/* ---------------- Form ---------------- */}
          <div className="gradient-border order-2 rounded-3xl p-6 sm:p-8 lg:order-1">
            <div className="space-y-7">
              <PhotoUploader
                photo={photo}
                onPhotoReady={onPhotoReady}
                onClear={onPhotoClear}
                openSignal={openSignal}
              />
              {photoError && (
                <p role="alert" className="-mt-4 text-[12.5px] font-medium text-rose-300">
                  {photoError}
                </p>
              )}

              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2.5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.22em] text-slate-300"
                >
                  <User size={14} className="text-cyan-300" /> B. Your full name{' '}
                  <span className="text-cyan-400">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={name}
                  maxLength={42}
                  autoComplete="name"
                  placeholder="e.g. Aarav Sharma"
                  onChange={(e) => onNameChange(e.target.value)}
                  className={`field ${nameError ? '!border-rose-400/70' : ''}`}
                />
                {nameError ? (
                  <p role="alert" className="mt-2 text-[12.5px] font-medium text-rose-300">
                    {nameError}
                  </p>
                ) : (
                  <p className="mt-2 text-[11.5px] text-slate-500">
                    Long names are supported — the pass auto-fits the text.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="college"
                  className="mb-2.5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.22em] text-slate-300"
                >
                  <GraduationCap size={14} className="text-purple-300" /> C. Your college / university{' '}
                  <span className="text-cyan-400">*</span>
                </label>
                <input
                  id="college"
                  type="text"
                  value={college}
                  maxLength={58}
                  autoComplete="organization"
                  placeholder="e.g. Delhi Technological University"
                  onChange={(e) => onCollegeChange(e.target.value)}
                  className={`field ${collegeError ? '!border-rose-400/70' : ''}`}
                />
                {collegeError ? (
                  <p role="alert" className="mt-2 text-[12.5px] font-medium text-rose-300">
                    {collegeError}
                  </p>
                ) : (
                  <p className="mt-2 text-[11.5px] text-slate-500">
                    Full college or university name — it will resize automatically to fit.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                className="btn-primary w-full px-6 py-4 text-[15px]"
              >
                <span className="sheen" aria-hidden="true" />
                <Zap size={18} /> GENERATE MY PASS
              </button>

              <p className="flex items-center justify-center gap-2 text-center text-[11.5px] text-slate-500">
                <Sparkles size={13} className="text-cyan-400" />
                Everything runs locally in your browser — your photo never leaves your device.
              </p>
            </div>
          </div>

          {/* ---------------- Live preview ---------------- */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-24">
            <div className="mb-4 flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.26em] text-cyan-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-cyan-400" />
                  <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-40 blur-[3px]" />
                </span>
                Live preview
              </div>
              <div className="text-[11px] font-medium text-slate-500">Updates as you type</div>
            </div>

            <div className="relative mx-auto w-full max-w-[380px] sm:max-w-[420px] lg:max-w-none">
              <div className="absolute -inset-3 rounded-[30px] bg-gradient-to-br from-cyan-400/15 via-indigo-500/10 to-purple-500/15 blur-xl" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[22px] border border-white/10 neon-ring">
                <PassCanvas
                  name={name}
                  college={college}
                  photo={photo?.img ?? null}
                  crop={photo?.crop ?? null}
                  placeholders
                />
              </div>
            </div>

            <p className="mt-4 text-center text-[11.5px] leading-relaxed text-slate-500">
              The final download is a high-resolution PNG (1024 × 1536) with no watermark and no
              extra margins.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
