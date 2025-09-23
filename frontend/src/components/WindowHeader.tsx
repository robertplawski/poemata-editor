import type { PropsWithChildren, ReactElement } from 'react';

export function WindowHeader({ children, icon, title }: WindowHeaderProps) {

  return <div className='w-full flex flex-row gap-4 border-b-1 p-4 mb-2 font-700 justify-between border-neutral-200 '>
    <div className='flex flex-row gap-4 '>{icon}{title}</div> {children}</div>;


}export type WindowHeaderProps = PropsWithChildren & { title: string; icon: ReactElement; };

