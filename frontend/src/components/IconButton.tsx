import type { PropsWithChildren, MouseEventHandler } from 'react';

export const IconButton = ({ children, onClick }: IconButtonProps) => {
  return <button onClick={onClick} className='cursor-pointer hover:opacity-[0.75] transition-all'>
    {children}
  </button>;
};export type IconButtonProps = PropsWithChildren<{ onClick: MouseEventHandler<HTMLButtonElement>; }>;

