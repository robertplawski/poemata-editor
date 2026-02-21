import type { MouseEventHandler, PropsWithChildren } from "react";
import { cn } from "../utils/cn";

export const IconButton = ({
  children,
  className,
  disabled,
  title,
  onClick,
}: IconButtonProps) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={cn(
        "p-1 cursor-pointer hover:opacity-[0.75] transition-all",
        className,
      )}
    >
      {children}
    </button>
  );
};
export type IconButtonProps = PropsWithChildren<{
  disabled?: boolean;
  className?: string;
  title?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}>;
