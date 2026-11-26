import { useMemo, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  MessageCircle,
  Pencil,
  RefreshCcw,
  Share2,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import PassCanvas from './PassCanvas';
import { InstagramIcon, LinkedInIcon, WhatsAppIcon } from './BrandIcons';
import {
  CAPTION,
  canShareFiles,
  canvasToPngFile,
  copyText,
  linkedInShareUrl,
  openInNewTab,
  sharePassFile,
  triggerDownload,
  whatsAppShareUrl,
} from '../lib/share';
import { passFileName } from '../lib/image';
import { renderPass } from '../lib/drawPass';
import { notify } from '../lib/notify';
import type { PhotoState } from '../types';

interface ResultSectionProps {
  name: string;
  college: string;
  photo: PhotoState | null;
  onEditDetails: () => void;
  onChangePhoto: () => void;
  onRegenerate: () => void;
  onCreateAnother: () => void;
}

export default function ResultSection({
  name,
  college,
  photo,
  onEditDetails,
  onChangePhoto,
  onRegenerate,
  onCreateAnother,
}: ResultSectionProps) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const exportRef = useRef<HTMLCanvasElement | null>(null);

  const displayName = name.trim() || 'Participant';
  const fileName = useMemo(() => passFileName(name), [name]);

  /** Render an offscreen full-res pass and get a PNG File. */
  const buildFile = async (): Promise<File | null> => {
    try {
      let canvas = exportRef.current;
      if (!canvas) {
        canvas = document.createElement('canvas');
        exportRef.current = canvas;
      }
      await renderPass(canvas, {
        name: name.trim(),
        college: college.trim(),
        photo: photo?.img ?? null,
        crop: photo?.crop ?? null,
        showPlaceholders: false,
      });
      return await canvasToPngFile(canvas, fileName);
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Could not generate the PNG. Please try again.');
      return null;
    }
  };

  const handleDownload = async () => {
    const file = await buildFile();
    if (!file) return;
    triggerDownload(file);
    notify('Your pass has been downloaded!');
  };

  const handleCopy = async () => {
    const ok = await copyText(CAPTION);
    setCopied(ok);
    notify(ok ? 'Announcement copied to clipboard!' : 'Copy failed — please try again.');
    if (ok) window.setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    setSharing(true);
    try {
      const file = await buildFile();
      if (!file) return;
      if (canShareFiles()) {
        const result = await sharePassFile(file, CAPTION);
        if (result === 'shared') notify('Thanks for sharing Prompt Wars!');
        else if (result === 'unsupported') {
          triggerDownload(file);
          notify('Pass downloaded — attach it when you share.');
        }
      } else {
        triggerDownload(file);
        notify('Pass downloaded — attach it when you share.');
      }
    } finally {
      setSharing(false);
    }
  };

  const handleLinkedIn = async () => {
    const file = await buildFile();
    if (file && canShareFiles()) {
      const result = await sharePassFile(file, CAPTION);
      if (result === 'shared' || result === 'cancelled') return;
    }
    await copyText(CAPTION);
    if (file) triggerDownload(file);
    openInNewTab(linkedInShareUrl());
    notify(
      file
        ? 'Pass downloaded and caption copied — attach the image to your LinkedIn post.'
        : 'Caption copied — paste it and attach your pass image on LinkedIn.',
    );
  };

  const handleWhatsApp = async () => {
    const file = await buildFile();
    if (file && canShareFiles()) {
      const result = await sharePassFile(file, CAPTION);
      if (result === 'shared' || result === 'cancelled') return;
    }
    if (file) triggerDownload(file);
    openInNewTab(whatsAppShareUrl());
    notify(
      file
        ? 'Pass downloaded — attach it in WhatsApp to share your Prompt Wars card.'
        : 'Opening WhatsApp — attach your downloaded pass to share it.',
    );
  };

  const handleInstagram = async () => {
    if (canShareFiles()) {
      const file = await buildFile();
      if (file) {
        const result = await sharePassFile(file, CAPTION);
        if (result === 'shared') return;
        if (result === 'unsupported') {
          triggerDownload(file);
          notify('Pass downloaded — now share it on Instagram!');
          return;
        }
        return;
      }
    }
    await handleDownload();
    notify('Pass downloaded — open Instagram and add it to your story or feed!');
  };

  return (
    <section id="your-pass" className="relative scroll-mt-20 py-16 sm:py-20">
      <div className="orb left-[-130px] top-24 h-[360px] w-[360px] bg-purple-600/20" aria-hidden="true" />
      <div className="orb right-[-100px] bottom-10 h-[320px] w-[320px] bg-cyan-500/15" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          {/* -------- Final pass showcase -------- */}
          <div className="relative mx-auto w-full max-w-[400px] lg:max-w-[440px]">
            <div className="absolute -inset-5 rounded-[36px] bg-gradient-to-br from-cyan-400/20 via-indigo-500/12 to-purple-500/20 blur-2xl" aria-hidden="true" />
            <div className="animate-float relative rounded-[24px] neon-ring-strong">
              <PassCanvas
                name={name}
                college={college}
                photo={photo?.img ?? null}
                crop={photo?.crop ?? null}
                placeholders={false}
                decorative={false}
              />
            </div>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-emerald-300/30 bg-emerald-400/15 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-emerald-300">
              1024 × 1536 · PNG · No watermark
            </div>
          </div>

          {/* -------- Actions + sharing -------- */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.32em] text-cyan-300">
              Final Pass
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Your pass is ready, <span className="text-gradient">{displayName}</span>!
            </h2>
            <p className="mt-3 text-slate-400">
              {college.trim() || 'Your college'} · Participant · Prompt Wars 2026 by AlGlorythm
            </p>

            <button
              type="button"
              onClick={() => void handleDownload()}
              className="btn-primary mt-7 w-full px-7 py-4 text-[17px]"
            >
              <span className="sheen" aria-hidden="true" />
              <Download size={21} /> DOWNLOAD MY PASS
            </button>

            <button
              type="button"
              onClick={() => void handleNativeShare()}
              disabled={sharing}
              className="btn-ghost mt-3 w-full px-7 py-3.5 text-sm"
            >
              <Share2 size={17} /> {sharing ? 'Preparing your share…' : 'Share My Pass'}
            </button>

            {/* Share block */}
            <div className="gradient-border mt-7 rounded-2xl p-6">
              <h3 className="flex items-center gap-2.5 text-[15px] font-extrabold uppercase tracking-[0.12em] text-white">
                <Sparkles size={17} className="text-yellow-300" /> Share your Prompt Wars moment!
              </h3>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4 text-[12.5px] leading-relaxed text-slate-300">
                {CAPTION}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => void handleLinkedIn()}
                  className="btn-ghost justify-start px-4 py-3 text-[13px]"
                >
                  <LinkedInIcon size={17} className="text-[#0a66c2]" /> Share on LinkedIn
                </button>
                <button
                  type="button"
                  onClick={() => void handleWhatsApp()}
                  className="btn-ghost justify-start px-4 py-3 text-[13px]"
                >
                  <WhatsAppIcon size={17} className="text-[#25d366]" /> Share on WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => void handleInstagram()}
                  className="btn-ghost justify-start px-4 py-3 text-[13px]"
                >
                  <InstagramIcon size={17} className="text-pink-400" /> Share on Instagram
                </button>
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  className="btn-ghost justify-start px-4 py-3 text-[13px]"
                >
                  {copied ? <Check size={17} className="text-emerald-400" /> : <Copy size={17} />}
                  {copied ? 'Announcement copied!' : 'Copy event announcement'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => void handleDownload()}
                className="btn-ghost mt-2.5 w-full px-4 py-3 text-[13px]"
              >
                <Download size={16} /> Download Pass Again
              </button>

              <p className="mt-4 flex gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-[11.5px] leading-relaxed text-slate-400">
                <MessageCircle size={15} className="mt-0.5 flex-shrink-0 text-slate-500" />
                <span>
                  <strong className="text-slate-300">Instagram note:</strong> Instagram doesn't allow
                  direct publishing from the browser. Download your pass (or tap Share My Pass on
                  mobile to open the share sheet), then post it to your feed or story — tag{' '}
                  <strong className="text-slate-300">@AlGlorythm</strong> so we can reshare it!
                </span>
              </p>
            </div>

            {/* Secondary actions */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              <button type="button" onClick={onRegenerate} className="btn-ghost px-4 py-2.5 text-[12.5px]">
                <RefreshCcw size={14} /> Regenerate Pass
              </button>
              <button type="button" onClick={onChangePhoto} className="btn-ghost px-4 py-2.5 text-[12.5px]">
                <UserPlus size={14} /> Change Photo
              </button>
              <button type="button" onClick={onEditDetails} className="btn-ghost px-4 py-2.5 text-[12.5px]">
                <Pencil size={14} /> Edit Details
              </button>
              <button type="button" onClick={onCreateAnother} className="btn-ghost px-4 py-2.5 text-[12.5px]">
                <Sparkles size={14} /> Create Another Pass
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
