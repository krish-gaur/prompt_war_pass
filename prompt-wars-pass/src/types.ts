export interface CropPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PhotoState {
  /** Object URL used by the cropper preview. */
  url: string;
  /** Fully decoded image, used as the canvas draw source. */
  img: HTMLImageElement;
  /** Selected crop region in natural image pixels. */
  crop: CropPixels;
  fileName: string;
}

export interface PassRenderData {
  name: string;
  organisation: string;
  photo?: HTMLImageElement | HTMLCanvasElement | null;
  crop?: CropPixels | null;
  /** Render dimmed template text when fields are empty (preview only). */
  showPlaceholders?: boolean;
}
