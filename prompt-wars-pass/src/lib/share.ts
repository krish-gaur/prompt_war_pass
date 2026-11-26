export const CAPTION =
  "I'm officially part of Prompt Wars 2026 by AlGlorythm! Ready to experiment, create, and push the boundaries of AI through prompts. See you on 12 December 2026! #PromptWars #AlGlorythm #AI";

export function eventUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin + window.location.pathname;
  }
  return 'https://promptwars.alglorythm.com';
}

export function linkedInShareUrl(): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl())}`;
}

export function whatsAppShareUrl(text: string = CAPTION): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function openInNewTab(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers without the async clipboard API.
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/** True when the current browser can share PNG files through the native sheet. */
export function canShareFiles(): boolean {
  try {
    return (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [new File(['x'], 'probe.png', { type: 'image/png' })] })
    );
  } catch {
    return false;
  }
}

export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/** Share the generated pass PNG + caption via the native share sheet (mobile). */
export async function sharePassFile(file: File, text: string): Promise<'shared' | 'unsupported' | 'cancelled'> {
  if (!canShareFiles()) return 'unsupported';
  try {
    await navigator.share({ files: [file], text, title: 'My Prompt Wars Pass' });
    return 'shared';
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
    return 'unsupported';
  }
}

export async function shareTextOnly(text: string): Promise<'shared' | 'unsupported' | 'cancelled'> {
  if (!canNativeShare()) return 'unsupported';
  try {
    await navigator.share({ text, title: 'Prompt Wars 2026' });
    return 'shared';
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
    return 'unsupported';
  }
}

/** Convert a render canvas into a PNG File ready for sharing/downloading. */
export function canvasToPngFile(canvas: HTMLCanvasElement, filename: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Could not generate the PNG. Please try again.'));
        return;
      }
      resolve(new File([blob], filename, { type: 'image/png' }));
    }, 'image/png');
  });
}

export function triggerDownload(file: File): void {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
