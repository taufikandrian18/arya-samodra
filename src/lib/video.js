// Pick the hero rendition: 720p on small or data-saving screens, else 1080p.
export function pickRendition({ width, dpr = 1, saveData = false }) {
  return saveData || width * dpr <= 1400 ? '720' : '1080';
}
