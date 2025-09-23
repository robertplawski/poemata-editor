import { type RefObject, useState, useCallback, type ChangeEvent, useEffect } from 'react';
import { API_ROOT } from '../App';
import { downloadFile } from '../utils/downloadFile';

export const useEditor = (iframeRef: RefObject<HTMLIFrameElement | null>) => {

  const [openFile, setOpenFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const downloadPreview = useCallback(() => iframeRef && iframeRef.current && downloadFile(iframeRef.current.src, openFile!.replace(/\.txt$/i, ".html")), [iframeRef, openFile]);
  const printPreview = useCallback(() => iframeRef && iframeRef.current && iframeRef.current.contentWindow?.print(), [iframeRef]);


  const editFile = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setFileContent(newValue);

    const setData = async () => {
      const data = { content: newValue };
      await fetch(API_ROOT + `/files/${openFile}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(data)
      });

      if (iframeRef == null) {
        return;

      }
      if (!iframeRef.current) {
        return;
      }
      // eslint-disable-next-line no-self-assign
      iframeRef.current.src = iframeRef.current.src;
    };

    setData();

  }, [openFile, iframeRef]);

  useEffect(() => {
    const fetchData = async () => {
      if (!openFile) {
        return;
      }
      try {
        const response = await fetch(API_ROOT + `/files/${openFile}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: string = await response.text();
        setFileContent(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setFileContent, openFile]);

  return { openFile, setOpenFile, fileContent, editFile, loading, error, printPreview, downloadPreview };
};
