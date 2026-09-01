export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit' | 'thumb';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
}

export class CloudinaryClient {
  private cloudName: string;

  constructor(cloudName: string = '') {
    this.cloudName = cloudName;
  }

  isConfigured(): boolean {
    return Boolean(this.cloudName && this.cloudName.trim() !== '');
  }

  optimizeUrl(publicIdOrUrl: string, options: CloudinaryTransformOptions = {}): string {
    if (!this.isConfigured() || !publicIdOrUrl) return publicIdOrUrl;

    const transforms = [
      options.width ? `w_${options.width}` : '',
      options.height ? `h_${options.height}` : '',
      options.crop ? `c_${options.crop}` : 'c_fill',
      options.quality ? `q_${options.quality}` : 'q_auto',
      options.format ? `f_${options.format}` : 'f_auto',
    ].filter(Boolean).join(',');

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transforms}/${publicIdOrUrl}`;
  }
}

export const cloudinaryClient = new CloudinaryClient();

