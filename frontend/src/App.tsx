import { Download, Edit, Eye, FileIcon, FilePlus, Folder, Printer, Search, Trash } from 'lucide-react';
import { useState, useRef, useMemo } from 'react'
import { useFiles } from './hooks/useFiles';
import { useEditor } from './hooks/useEditor';
import { WindowHeader } from './components/WindowHeader';
import { IconButton } from './components/IconButton';

export const API_ROOT = "/api"

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
