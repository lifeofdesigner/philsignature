/**
 * Converts a YouTube or Instagram URL to an embeddable URL.
 * Returns null for unsupported URLs.
 */
export function convertToEmbedUrl(url: string): string | null {
  if (!url || !url.trim()) return null;

  const trimmed = url.trim();

  // YouTube: https://www.youtube.com/watch?v=XXXXX or https://youtu.be/XXXXX
  const ytMatch =
    trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/) ||
    trimmed.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // Instagram reel: https://www.instagram.com/reel/XXXXX/
  const igMatch = trimmed.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  if (igMatch) {
    return `https://www.instagram.com/p/${igMatch[1]}/embed/`;
  }

  return null;
}

export function detectVideoProvider(url: string): 'youtube' | 'instagram' | null {
  if (!url) return null;
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/instagram\.com/.test(url)) return 'instagram';
  return null;
}
