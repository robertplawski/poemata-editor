import type { MouseEventHandler, PropsWithChildren } from "react";

export const IconButton = ({
	children,
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
			className="p-1 cursor-pointer hover:opacity-[0.75] transition-all"
		>
			{children}
		</button>
	);
};
export type IconButtonProps = PropsWithChildren<{
	disabled?: boolean;
	title?: string;
	onClick: MouseEventHandler<HTMLButtonElement>;
}>;
