export type VideoPlatform = 'youtube' | 'instagram' | 'vimeo' | 'tiktok' | 'unknown';

/**
 * Converts any pasted video URL into a valid embeddable iframe URL.
 * Always uses youtube-nocookie.com for YouTube (privacy-enhanced, no cookie consent banner).
 * Returns null for unrecognised URLs.
 */
export function getEmbedUrl(url: string): string | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();

  // YouTube — watch, short, mobile, shorts, embed
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/
  ) || trimmed.match(/youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  }

  // Instagram Reels / Posts
  const igMatch = trimmed.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  if (igMatch) {
    return `https://www.instagram.com/p/${igMatch[1]}/embed/`;
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // TikTok
  const ttMatch = trimmed.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/);
  if (ttMatch) {
    return `https://www.tiktok.com/embed/v2/${ttMatch[1]}`;
  }

  return null;
}

/** Returns a thumbnail image URL for the video, or null if unavailable. */
export function getVideoThumbnail(url: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/
  ) || url.match(/youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }
  return null;
}

/** Detects which platform a URL belongs to. */
export function detectPlatform(url: string): VideoPlatform {
  if (!url) return 'unknown';
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/instagram\.com/.test(url)) return 'instagram';
  if (/vimeo\.com/.test(url)) return 'vimeo';
  if (/tiktok\.com/.test(url)) return 'tiktok';
  return 'unknown';
}

/** @deprecated Use getEmbedUrl instead */
export const convertToEmbedUrl = getEmbedUrl;

/** @deprecated Use detectPlatform instead */
export function detectVideoProvider(url: string): 'youtube' | 'instagram' | null {
  const p = detectPlatform(url);
  if (p === 'youtube') return 'youtube';
  if (p === 'instagram') return 'instagram';
  return null;
}
