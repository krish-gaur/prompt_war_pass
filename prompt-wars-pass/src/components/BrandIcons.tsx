interface BrandMarkProps {
  size?: number;
  className?: string;
}

/** AlGlorythm-inspired triangular orbit mark. */
export function BrandMark({ size = 36, className = '' }: BrandMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a855f7" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      <path
        d="M32 6 L58 56 L6 56 Z"
        fill="url(#bm-g)"
        stroke="url(#bm-g)"
        strokeWidth="9"
        strokeLinejoin="round"
      />
      <ellipse
        cx="32"
        cy="36"
        rx="26"
        ry="11"
        fill="none"
        stroke="rgba(255,255,255,0.92)"
        strokeWidth="2.6"
        transform="rotate(-30 32 36)"
      />
      <circle cx="32" cy="36" r="3.4" fill="#fff" />
      <path d="M52 12 l2.4 5 5 2.4 -5 2.4 -2.4 5 -2.4-5 -5-2.4 5-2.4z" fill="#e9d5ff" />
    </svg>
  );
}

/** Craftora-style isometric cube mark. */
export function CubeMark({ size = 26, className = '' }: BrandMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M24 6 L42 16 L24 26 L6 16 Z" fill="#93c5fd" />
      <path d="M6 16 L24 26 L24 44 L6 34 Z" fill="#2563eb" />
      <path d="M42 16 L24 26 L24 44 L42 34 Z" fill="#3b82f6" />
    </svg>
  );
}

/** WhatsApp glyph (brand icon not bundled with lucide). */
export function WhatsAppIcon({ size = 18, className = '' }: BrandMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0 0 12.04 2zm0 1.87c2.16 0 4.19.84 5.72 2.37a8.04 8.04 0 0 1 2.37 5.68c0 4.44-3.61 8.04-8.06 8.04-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.02 8.02 0 0 1-1.23-4.23c0-4.44 3.61-8.04 8.06-8.04zm-2.5 4.05c-.17-.39-.35-.4-.5-.41h-.43c-.15 0-.39.06-.6.28-.2.22-.78.76-.78 1.86s.8 2.16.91 2.31c.12.15 1.56 2.47 3.87 3.38 1.9.76 2.29.61 2.71.57.41-.04 1.34-.55 1.53-1.08.19-.53.19-.99.13-1.08-.06-.1-.22-.15-.46-.27-.24-.12-1.34-.66-1.55-.73-.2-.08-.36-.12-.5.12-.15.22-.58.73-.71.88-.13.15-.26.17-.49.06-.24-.12-.94-.35-1.79-1.1-.66-.59-1.11-1.31-1.24-1.54-.13-.22-.02-.34.1-.46.11-.11.24-.27.35-.41.12-.15.16-.25.24-.41.08-.17.04-.31-.02-.43-.06-.13-.5-1.24-.7-1.7z" />
    </svg>
  );
}

export function LinkedInIcon({ size = 18, className = '' }: BrandMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.53C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.74V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

export function InstagramIcon({ size = 18, className = '' }: BrandMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13a5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
    </svg>
  );
}
