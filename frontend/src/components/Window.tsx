import type { PropsWithChildren } from "react";

export default function Window({children}: PropsWithChildren){
   <div className='flex-1 whitespace-pre flex flex-col'>
    {children}
    </div>
}