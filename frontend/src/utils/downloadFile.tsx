


export function downloadFile(url: string, filename?: string): void {
  fetch(url)
    .then((response: Response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.blob();
    })
    .then((blob: Blob) => {
      const link: HTMLAnchorElement = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename ?? 'download.js';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .catch((error: any) => console.error('Download error:', error));
}
