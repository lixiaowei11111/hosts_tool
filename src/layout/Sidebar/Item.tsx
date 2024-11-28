import { Switch } from "@/components/ui/switch";
import { useState, type FC } from "react";
import { type Group, STATUS } from "@/lib/ipc";
import { cn } from "@/lib/utils";
import Icon from "@/components/Icon";
import { animated, useSpring } from "@react-spring/web";

export interface ItemProps {
	active: boolean;
	group: Group;
	onSwitch: (id: number, status: STATUS) => void;
	onClick: (group: Group) => void;
	onDelete: (id: number) => void;
}

const statusToChecked = (status: STATUS): boolean => status === STATUS.ON;

const checkedToStatus = (checked: boolean): STATUS =>
	checked ? STATUS.ON : STATUS.OFF;

const Item: FC<ItemProps> = ({
	group,
	active,
	onSwitch,
	onClick,
	onDelete,
}) => {
	const [isHovered, setIsHovered] = useState(false);

	const deleteIconSpring = useSpring({
		opacity: isHovered ? 1 : 0,
		config: { tension: 300, friction: 10 },
	});

	const shakeSpring = useSpring({
		transform: isHovered
			? "rotate(-5deg) translateX(-2px)"
			: "rotate(0deg) translateX(0px)",
		config: { tension: 300, friction: 5, mass: 5 },
		loop: isHovered ? { reverse: true } : false,
	});

	const handleCheckedChange = async (checked: boolean) => {
		onSwitch(group.id, checkedToStatus(checked));
	};

	const handleSwitchClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
	};

	const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		onDelete(group.id);
	};

	const handleClick = () => {
		onClick(group);
	};

	const handleMouseEnter = () => setIsHovered(true);
	const handleMouseLeave = () => setIsHovered(false);

	return (
		<div
			onClick={handleClick}
			className={cn(
				"py-2 px-4 text-white flex items-center justify-between cursor-pointer",
				active ? "bg-[hsl(212,100%,48%,0.3)]" : "",
			)}
		>
			<div className="flex items-center overflow-hidden mr-2 flex-grow">
				<Icon className="text-sm flex-shrink-0" type="file" />
				<span className="ml-1 truncate">{group.name}</span>
			</div>
			{group.id !== 0 && (
				<div
					className="flex items-center flex-shrink-0"
					style={{ width: "60px" }}
				>
					<Switch
						id={group.id.toString()}
						checked={statusToChecked(group.status)}
						onCheckedChange={handleCheckedChange}
						onClick={handleSwitchClick}
					/>
					<animated.div
						className="ml-1"
						style={{ ...deleteIconSpring, ...shakeSpring }}
						onMouseEnter={handleMouseEnter}
						onMouseLeave={handleMouseLeave}
					>
						<Icon
							className="cursor-pointer text-2xl"
							type="delete"
							onClick={handleDeleteClick}
						/>
					</animated.div>
				</div>
			)}
		</div>
	);
};

export default Item;
