import type { PropsWithChildren, MouseEventHandler } from 'react';

export const IconButton = ({ children, disabled, title, onClick }: IconButtonProps) => {
  return <button disabled={disabled} onClick={onClick} title={title} className='cursor-pointer hover:opacity-[0.75] transition-all'>
    {children}
  </button>;
}; export type IconButtonProps = PropsWithChildren<{ disabled?: boolean, title?: string, onClick: MouseEventHandler<HTMLButtonElement>; }>;

