import type { FC, MouseEventHandler } from "react";

interface IconProps {
	type: string;
	className?: string;
	onClick?: MouseEventHandler<HTMLElement>;
}

const Icon: FC<IconProps> = ({ type, className, onClick }) => {
	return (
		<i
			className={`hosts-tool ht-${type} ${className || ""}`}
			onClick={onClick}
		/>
	);
};

export default Icon;
