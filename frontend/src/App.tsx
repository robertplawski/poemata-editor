import { Delete, DeleteIcon, Download, Edit, Eye, FilePlus, Folder, Info, LucideFilePlus, Printer, Search, Share, Share2, Trash, TrashIcon, type LucideIcon } from 'lucide-react';
import { useEffect, useCallback, useReducer, useState, type ChangeEvent, useRef, type Ref, Children, type PropsWithChildren, type ReactElement } from 'react'

const API_ROOT = "http://localhost:8000"


type FilesApiResponseType = {
  files: FilesType
};

type FilesType = string[] | []

const useFiles = (query?: string) => {
  const [files, setFiles] = useState<FilesType>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [setFiles, setError, setLoading, query]);

  return { files, loading, error }
}


const useEditor = (iframeRef: Ref<HTMLIFrameElement>) => {

  const [openFile, setOpenFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



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

  return { openFile, setOpenFile, fileContent, editFile, loading, error }
}

type WindowHeaderProps = PropsWithChildren & { title: string, icon: ReactElement };


function WindowHeader({ children, icon, title }: WindowHeaderProps) {

  return <div className='w-full flex flex-row gap-4 border-b-1 p-4 mb-2 font-700 justify-between border-neutral-200 '>
    <div className='flex flex-row gap-4 '>{icon}{title}</div> {children}</div>


}

function App() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [query, setQuery] = useState('');

  const { openFile, editFile, setOpenFile, fileContent } = useEditor(iframeRef);
  const { files, loading, error } = useFiles(query);


  return (
    <>
      <div className="flex flex-row  overflow-hidden">
        <div className='overflow-hidden flex flex-col  max-h-[100vh] border-r-1 border-neutral-200 shadow-md'>

          <WindowHeader icon={<Folder />} title="Pliki"></WindowHeader>
          <div className='pl-4 pr-2 border-b-1 border-neutral-200 pb-2 flex flex-row items-center gap-2 w-full gap-4'>
            <Search />
            <input placeholder='Wyszukaj...' className='border-1 border-neutral-200 rounded-xl flex-1 p-2 shadow-sm' value={query} onInput={(e) => setQuery(e.target.value)} type="search" />

          </div>


          <ul className='flex-1 px-4 py-2 overflow-scroll'>
            {!loading && !error && files.map((file, index) =>
              <li key={index} className={(openFile == file ? 'font-bold ' : '') + 'py-2 border-b-1 border-neutral-200 py-2 flex flex-row gap-2 cursor-pointer'} onClick={() => setOpenFile(file)}>
                {file}</li>


            )}
          </ul >
          <div className='border-t-1 justify-between px-4  border-neutral-200 py-2 flex flex-row items-center gap-2 w-full gap-4'>
            <FilePlus />
            <div className='h-full border-r-1 border-neutral-200'></div>
            <Printer />
            <Share2 />
            <Download />
            <Info />
            <Trash />

          </div>
          <div className='pl-4 pr-2 border-t-1 border-neutral-200 py-2 flex flex-row items-center gap-2 w-full gap-4'>
            <Edit />
            <input placeholder='nowy_plik.txt' className='border-1 border-neutral-200 rounded-xl flex-1 p-2 shadow-sm' type="text" value={openFile} />

          </div>

        </div>

        {openFile == null ? <div className="flex flex-1 justify-center items-center">click file on the left to open it</div> : (
          <>
            {fileContent && !loading && !error ?

              <div className=' flex-1 flex border-r-1 border-neutral-200 flex-col justify-center overflow-y-hidden max-h-[100vh] items-center'>
                <WindowHeader icon={<Edit />} title="Edytor">{openFile}</WindowHeader>
                <textarea className='p-4 lg:p-8 w-full h-full resize-none whitespace-pre' onChange={(e) => editFile(e)} value={fileContent} />
              </div> :

              <div className='flex-1'></div>}

            <div className='flex-1 whitespace-pre flex flex-col'>

              <WindowHeader icon={<Eye />} title="Podgląd">
                <select>
                  {/* todo */}
                  <option selected disabled>poem.html</option>
                </select>
              </WindowHeader>
              <iframe ref={iframeRef} src={API_ROOT + `/preview/${openFile}?template=poem.html`} className='flex-1 p-4' />
            </div>
          </>
        )

        }
      </div >

    </>
  )
}

export default App
