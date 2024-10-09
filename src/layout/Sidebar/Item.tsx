import { Switch } from "@/components/ui/switch";
import { invoke } from "@tauri-apps/api/core";
import { message } from "@tauri-apps/plugin-dialog";
import type { FC } from "react";
import { type Group, STATUS, COMMAND } from "@/lib/ipc";

interface ItemProps {
	group: Group;
	onChange?: (id: number, status: STATUS) => void;
}

const statusToChecked = (status: STATUS): boolean => status === STATUS.ON;

const checkedToStatus = (checked: boolean): STATUS =>
	checked ? STATUS.ON : STATUS.OFF;

const Item: FC<ItemProps> = ({ group, onChange }) => {
	const handleCheckedChange = async (checked: boolean) => {
		const status = checkedToStatus(checked);
		try {
			await invoke(COMMAND.UPDATE_GROUP_STATUS, { id: group.id, status });
			onChange?.(group.id, status);
		} catch (error) {
			console.log("[DEBUG]", error);
			message("switch group status failed", "error");
		}
	};
	return (
		<div className="py-1 px-2 text-white flex items-center justify-between">
			<span>{group.name}</span>
			<Switch
				id={group.id.toString()}
				checked={statusToChecked(group.status)}
				onCheckedChange={handleCheckedChange}
			/>
		</div>
	);
};

export default Item;
