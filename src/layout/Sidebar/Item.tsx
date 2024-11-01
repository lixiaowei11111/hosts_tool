import { Switch } from "@/components/ui/switch";
import type { FC } from "react";
import { type Group, STATUS } from "@/lib/ipc";
import { cn } from "@/lib/utils";
import Icon from "@/components/Icon";

interface ItemProps {
	active: boolean;
	group: Group;
	onSwitch: (id: number, status: STATUS) => void;
	onClick: (id: number) => void;
}

const statusToChecked = (status: STATUS): boolean => status === STATUS.ON;

const checkedToStatus = (checked: boolean): STATUS =>
	checked ? STATUS.ON : STATUS.OFF;

const Item: FC<ItemProps> = ({ group, onSwitch, active, onClick }) => {
	const handleCheckedChange = async (checked: boolean) => {
		onSwitch(group.id, checkedToStatus(checked));
	};

	const handleClick = () => {
		onClick(group.id);
	};

	return (
		<div
			onClick={handleClick}
			className={cn(
				"py-2 px-4 text-white flex items-center justify-between",
				active ? "bg-[hsl(212,100%,48%,0.3)]" : "",
			)}
		>
			<div>
				<Icon className="text-sm" type="file" />
				<span className="ml-1">{group.name}</span>
			</div>
			{group.id !== 0 && (
				<Switch
					id={group.id.toString()}
					checked={statusToChecked(group.status)}
					onCheckedChange={handleCheckedChange}
				/>
			)}
		</div>
	);
};

export default Item;
