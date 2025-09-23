import { Download, Edit, Eye, FileIcon, FilePlus, Folder, Printer, Search, Trash } from 'lucide-react';
import { useEffect, useCallback, useState, type ChangeEvent, useRef, type PropsWithChildren, type ReactElement, useMemo, type RefObject, type MouseEventHandler, type SetStateAction, type Dispatch, useReducer } from 'react'

const API_ROOT = "/api"


type FilesApiResponseType = {
  files: FilesType
};

type FilesType = string[];

const useFiles = (setOpenFile: Dispatch<SetStateAction<string | null>>, query?: string) => {
  const [refreshFilesIndicator, refreshFiles] = useReducer((v) => ++v, 0);
  const [files, setFiles] = useState<FilesType>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const deleteFile = useCallback(async (file: string) => {
    if (prompt(`Czy napewno chcesz usunąć ${file}?\nNapisz "${file}" jeżeli tak.`) === file) {

      await fetch(API_ROOT + `/files/${file}`, {
        method: "DELETE"
      })

      setFiles((val) => val.filter(name => name !== file))
      setOpenFile(null);
    }
  }, [files])
  const createFile = useCallback(async () => {
    const file = prompt(`Podaj nazwę pliku.`)
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
      })

      //setFiles((val) => [...val, file])
      setOpenFile(file);
      refreshFiles();
    }
  }, [files, refreshFiles])

  useEffect(() => {
    // define async function inside useEffect
    const fetchData = async () => {
      try {
        let queryString = ''
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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setFiles, setError, setLoading, query, refreshFilesIndicator]);

  return { files, loading, error, deleteFile, createFile }
}


const useEditor = (iframeRef: RefObject<HTMLIFrameElement | null>) => {

  const [openFile, setOpenFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const downloadPreview = useCallback(() => iframeRef && iframeRef.current && downloadFile(iframeRef.current.src, openFile!.replace(/\.txt$/i, ".html")), [iframeRef, openFile])
  const printPreview = useCallback(() => iframeRef && iframeRef.current && iframeRef.current.contentWindow?.print(), [iframeRef])


  const editFile = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setFileContent(newValue)

    const setData = async () => {
      const data = { content: newValue };
      await fetch(API_ROOT + `/files/${openFile}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(data)
      })

      if (iframeRef == null) {
        return;

      }
      if (!iframeRef.current) {
        return;
      }
      iframeRef.current.src = iframeRef.current.src;
    }

    setData();

  }, [openFile, iframeRef])

  useEffect(() => {
    const fetchData = async () => {
      if (!openFile) {
        return
      }
      try {
        const response = await fetch(API_ROOT + `/files/${openFile}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: string = await response.text();
        setFileContent(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setFileContent, openFile])

  return { openFile, setOpenFile, fileContent, editFile, loading, error, printPreview, downloadPreview }
}

type WindowHeaderProps = PropsWithChildren & { title: string, icon: ReactElement };


function WindowHeader({ children, icon, title }: WindowHeaderProps) {

  return <div className='w-full flex flex-row gap-4 border-b-1 p-4 mb-2 font-700 justify-between border-neutral-200 '>
    <div className='flex flex-row gap-4 '>{icon}{title}</div> {children}</div>


}
function downloadFile(url: string, filename?: string): void {
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
    .catch((error: any) => console.error('Download error:', error));
}

type IconButtonProps = PropsWithChildren<{ onClick: MouseEventHandler<HTMLButtonElement> }>

const IconButton = ({ children, onClick }: IconButtonProps) => {
  return <button onClick={onClick} className='cursor-pointer hover:opacity-[0.75] transition-all'>
    {children}
  </button>
}

function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [query, setQuery] = useState('');

  const { openFile, editFile, setOpenFile, fileContent, printPreview, downloadPreview } = useEditor(iframeRef);
  const { files, loading, error, deleteFile, createFile } = useFiles(setOpenFile, query);

  const iframeSrc = useMemo(() => API_ROOT + `/preview/${openFile}?template=poem.html`, [openFile])

  return (
    <>
      <div className="flex flex-row  overflow-hidden">
        <div className='overflow-hidden flex flex-col  min-h-[100vh] max-h-[100vh] border-r-1 border-neutral-200 shadow-md'>

          <WindowHeader icon={<Folder />} title="Pliki"></WindowHeader>
          <div className='pl-4 pr-2 border-b-1 border-neutral-200 pb-2 flex flex-row items-center gap-2 w-full gap-4'>
            <Search />
            <input placeholder='Wyszukaj...' className='border-1 border-neutral-200 rounded-xl flex-1 p-2 shadow-sm' value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target?.value)} type="search" />

          </div>


          <ul className='flex-1 px-4 py-2 overflow-scroll'>
            {!loading && !error && files.map((file, index) =>
              <li key={index} className={(openFile == file ? 'font-bold ' : '') + 'py-2 border-b-1 border-neutral-200 py-2 flex flex-row gap-2 cursor-pointer'} onClick={() => setOpenFile(file)}>
                {file}</li>


            )}
          </ul >
          <div className='border-t-1 justify-between  p-4 border-neutral-200  flex flex-row items-center gap-2 w-full gap-4'>
            <IconButton onClick={createFile}>
              <FilePlus />
            </IconButton>
            <div className='h-full border-r-1 border-neutral-200'></div>
            <div className={`flex flex-row gap-4 transition-all ` + (openFile == null ? 'opacity-[0.4] pointer-events-none' : ' ')}>
              <IconButton onClick={printPreview}>
                <Printer />
              </IconButton>
              <IconButton onClick={downloadPreview}>
                <Download />
              </IconButton>
              <IconButton onClick={openFile ? () => deleteFile(openFile) : () => { }}>
                <Trash />
              </IconButton>

            </div>
          </div>
          {/*<div className='pl-4 pr-2 border-t-1 border-neutral-200 py-2 flex flex-row items-center gap-2 w-full gap-4'>
            <Edit />
            <input placeholder='nowy_plik.txt' className='border-1 border-neutral-200 rounded-xl flex-1 p-2 shadow-sm' type="text" value={openFile || ""} />

          </div>*/}

        </div>

        {openFile == null ? <div className="flex flex-1 flex-col gap-2 text-neutral-500 justify-center items-center">
          <FileIcon />
          <p>proszę otwórz plik</p>

        </div> : (
          <>
            {fileContent && !loading && !error ?

              <div className=' flex-1 flex border-r-1 border-neutral-200 flex-col justify-center overflow-y-hidden max-h-[100vh] items-center'>
                <WindowHeader icon={<Edit />} title="Edytor">{openFile}</WindowHeader>
                <textarea className='outline-0 p-4 lg:p-8 w-full h-full resize-none whitespace-pre' onChange={(e) => editFile(e)} value={fileContent} />
              </div> :

              <div className='flex-1'></div>}

            <div className='flex-1 whitespace-pre flex flex-col'>

              <WindowHeader icon={<Eye />} title="Podgląd">
                <select>
                  {/* todo */}
                  <option selected disabled>poem.html</option>
                </select>
              </WindowHeader>
              <iframe ref={iframeRef} src={iframeSrc} className='flex-1 p-4' />
            </div>
          </>
        )

        }
      </div >

    </>
  )
}

export default App
