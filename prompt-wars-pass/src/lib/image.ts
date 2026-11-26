export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/** Returns an error message, or null when the file is valid. */
export function validateImageFile(file: File): string | null {
  const type = file.type.toLowerCase();
  if (!ACCEPTED_TYPES.includes(type)) {
    return 'Please upload a JPG, JPEG, PNG or WEBP image.';
  }
  if (file.size > MAX_FILE_SIZE) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return `That photo is ${mb} MB — the maximum size is 5 MB. Please choose a smaller image.`;
  }
  return null;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('We could not read that image. Please try another photo.'));
    img.src = src;
  });
}

/** Generate the download filename from the participant name. */
export function passFileName(name: string): string {
  const clean = name
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w\-]/g, '')
    .slice(0, 60);
  return `PromptWars_${clean || 'Pass'}.png`;
}
