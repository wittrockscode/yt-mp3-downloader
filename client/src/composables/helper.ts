export type AllowedFormats = "mp3" | "mp4";

export const generate_downloadable_file = (blob: Blob, fileTitle: string) => {
  const newBlob = new Blob([blob]);
  const url = window.URL.createObjectURL(newBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileTitle;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const secondsToHms = (seconds: number): string => {
  if (isNaN(seconds)) return '0:00';

  seconds = Number(seconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor((seconds % 3600) % 60);

  const hDisplay = h > 0 ? h + ':' : '';
  const mDisplay = m > 0 ? (h > 0 && m < 10 ? '0' : '') + m + ':' : '0:';
  const sDisplay = s < 10 ? '0' + s : s;
  return hDisplay + mDisplay + sDisplay;
};