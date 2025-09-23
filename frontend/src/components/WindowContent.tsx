import type { PropsWithChildren } from "react";

export default function WindowContent({children}: PropsWithChildren){
    return <div className="p-4 flex-1">{children}</div>
}