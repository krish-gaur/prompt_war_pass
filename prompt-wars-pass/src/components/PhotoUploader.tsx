import { useCallback, useEffect, useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Camera, Check, ImagePlus, RefreshCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { loadImage, validateImageFile } from '../lib/image';
import type { CropPixels, PhotoState } from '../types';

interface PhotoUploaderProps {
  photo: PhotoState | null;
  onPhotoReady: (photo: PhotoState) => void;
  onClear: () => void;
  /** Bumps when the parent wants to force-open the file picker. */
  openSignal?: number;
}

export default function PhotoUploader({ photo, onPhotoReady, onClear, openSignal = 0 }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);

  // Crop modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.4);
  const [croppedArea, setCroppedArea] = useState<CropPixels | null>(null);

  // True when the pending image is already in use as the confirmed photo.
  const pendingIsExisting = useRef(false);

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  // Parent can request the picker (e.g. "Change Photo" button elsewhere).
  const lastSignal = useRef(openSignal);
  useEffect(() => {
    if (openSignal !== lastSignal.current) {
      lastSignal.current = openSignal;
      if (openSignal > 0) openPicker();
    }
  }, [openSignal, openPicker]);

  const handleFile = useCallback(
    async (file: File | undefined | null) => {
      setError(null);
      if (!file) return;
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setBusy(true);
      try {
        const url = URL.createObjectURL(file);
        await loadImage(url); // decode check
        pendingIsExisting.current = false;
        setPendingUrl(url);
        setPendingName(file.name);
        setCrop({ x: 0, y: 0 });
        setZoom(1.4);
        setCroppedArea(null);
        setCropModalOpen(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'We could not read that image. Please try another photo.');
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedArea({ x: pixels.x, y: pixels.y, width: pixels.width, height: pixels.height });
  }, []);

  const confirmCrop = useCallback(async () => {
    if (!pendingUrl || !croppedArea) return;
    try {
      const img = await loadImage(pendingUrl);
      onPhotoReady({
        url: pendingUrl,
        img,
        crop: croppedArea,
        fileName: pendingName || 'photo',
      });
      setCropModalOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong preparing your photo.');
    }
  }, [pendingUrl, croppedArea, pendingName, onPhotoReady]);

  const cancelCrop = useCallback(() => {
    setCropModalOpen(false);
    if (pendingUrl && !pendingIsExisting.current) URL.revokeObjectURL(pendingUrl);
    setPendingUrl(null);
  }, [pendingUrl]);

  return (
    <div>
      <label className="mb-2.5 block text-[12px] font-bold uppercase tracking-[0.22em] text-slate-300">
        A. Upload your photo <span className="text-cyan-400">*</span>
      </label>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {!photo ? (
        <button
          type="button"
          onClick={openPicker}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`group flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
            dragOver
              ? 'border-cyan-300 bg-cyan-400/10'
              : 'border-slate-600/70 bg-white/[0.025] hover:border-cyan-400/70 hover:bg-cyan-400/[0.06]'
          }`}
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400/15 to-purple-500/15 text-cyan-300 transition group-hover:scale-105">
            {busy ? <Camera size={26} className="animate-pulse" /> : <ImagePlus size={26} />}
          </span>
          <div>
            <div className="text-[15px] font-bold text-white">
              {busy ? 'Reading your photo…' : 'Tap to upload or drag & drop'}
            </div>
            <div className="mt-1 text-[12.5px] text-slate-400">
              JPG, JPEG, PNG or WEBP · up to 5 MB · portrait photos work best
            </div>
          </div>
        </button>
      ) : (
        <div className="flex items-center gap-4 rounded-2xl border border-cyan-300/25 bg-cyan-400/[0.06] p-4">
          <img
            src={photo.url}
            alt="Your uploaded photo"
            className="h-20 w-20 flex-shrink-0 rounded-xl object-cover ring-2 ring-cyan-300/40"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[13.5px] font-bold text-emerald-300">
              <Check size={15} strokeWidth={3} /> Photo ready
            </div>
            <div className="mt-0.5 truncate text-[12px] text-slate-400">{photo.fileName}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  pendingIsExisting.current = true;
                  setPendingUrl(photo.url);
                  setPendingName(photo.fileName);
                  setCrop({ x: 0, y: 0 });
                  setZoom(1.4);
                  setCroppedArea(photo.crop);
                  setCropModalOpen(true);
                }}
                className="btn-ghost px-3.5 py-1.5 text-[11.5px]"
              >
                <ZoomIn size={13} /> Adjust crop
              </button>
              <button type="button" onClick={openPicker} className="btn-ghost px-3.5 py-1.5 text-[11.5px]">
                <RefreshCcw size={13} /> Replace photo
              </button>
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setError(null);
                }}
                className="btn-ghost px-3.5 py-1.5 text-[11.5px] !border-rose-400/30 !text-rose-300 hover:!border-rose-400/60 hover:!bg-rose-400/10"
              >
                <X size={13} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2.5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3.5 py-2 text-[12.5px] font-medium text-rose-200">
          {error}
        </p>
      )}

      {/* Crop modal */}
      {cropModalOpen && pendingUrl && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="gradient-border w-full max-w-md rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-white">Position your photo</h3>
              <button
                type="button"
                onClick={cancelCrop}
                aria-label="Close crop editor"
                className="rounded-full border border-white/15 p-1.5 text-slate-300 transition hover:border-rose-400/50 hover:text-rose-300"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative h-[300px] w-full overflow-hidden rounded-xl border border-white/10 bg-[#060814]">
              <Cropper
                image={pendingUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                objectFit="cover"
                showGrid={false}
              />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <ZoomOut size={16} className="text-slate-400" />
              <input
                type="range"
                min={1}
                max={4}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10"
                aria-label="Zoom"
              />
              <ZoomIn size={16} className="text-slate-400" />
            </div>
            <p className="mt-2 text-center text-[11.5px] text-slate-400">
              Drag to reposition · use the slider or pinch to zoom
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={cancelCrop} className="btn-ghost py-3 text-sm">
                Cancel
              </button>
              <button type="button" onClick={() => void confirmCrop()} className="btn-primary py-3 text-sm">
                <Check size={16} /> Use photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
