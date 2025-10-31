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
}