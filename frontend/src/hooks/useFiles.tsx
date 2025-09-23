import { type Dispatch, type SetStateAction, useReducer, useState, useCallback, useEffect } from 'react';
import { API_ROOT } from '../App';

export const useFiles = (setOpenFile: Dispatch<SetStateAction<string | null>>, query?: string) => {
  const [refreshFilesIndicator, refreshFiles] = useReducer((v) => ++v, 0);
  const [files, setFiles] = useState<FilesType>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const deleteFile = useCallback(async (file: string) => {
    if (prompt(`Czy napewno chcesz usunąć ${file}?\nNapisz "${file}" jeżeli tak.`) === file) {

      await fetch(API_ROOT + `/files/${file}`, {
        method: "DELETE"
      });

      setFiles((val) => val.filter(name => name !== file));
      setOpenFile(null);
    }
  }, [setOpenFile]);
  const createFile = useCallback(async () => {
    const file = prompt(`Podaj nazwę pliku.`);
    if (file) {
      if (files.includes(file)) {
        setOpenFile(file);
        return;

      } // yeah it should be on the backend too 
      await fetch(API_ROOT + `/files/${file}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: "Tytuł\n\nZawartość\n\nStopka" })
      });

      //setFiles((val) => [...val, file])
      setOpenFile(file);
      refreshFiles();
    }
  }, [files, setOpenFile]);

  useEffect(() => {
    // define async function inside useEffect
    const fetchData = async () => {
      try {
        let queryString = '';
        if (query) {
          queryString = "?" + new URLSearchParams({
            query: query
          }).toString();
        }
        const response = await fetch(API_ROOT + `/files${queryString}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const { files: data }: FilesApiResponseType = await response.json();
        setFiles(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setFiles, setError, setLoading, query, refreshFilesIndicator]);

  return { files, loading, error, deleteFile, createFile };
};export type FilesType = string[];
export type FilesApiResponseType = {
  files: FilesType;
};

