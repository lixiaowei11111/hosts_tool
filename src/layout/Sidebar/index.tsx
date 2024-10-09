import Item from "./Item";
import { type Group, COMMAND, type STATUS } from "@/lib/ipc";
import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect, type FC } from "react";
import { message } from "@tauri-apps/plugin-dialog";

interface SidebarProps {
	onChange?: (id: number, status: STATUS) => void;
}

const Sidebar: FC<SidebarProps> = ({ onChange }) => {
	const [groups, setGroups] = useState<Group[]>([]);

	useEffect(() => {
		getList();
	}, []);

	const getList = async () => {
		try {
			const groups: Group[] = await invoke(COMMAND.READ_CONF);
			console.log("[DEBUG] read conf file success", groups);
			setGroups(groups);
		} catch (error) {
			console.log("[DEBUG] read conf file failed", error);
			message(`read conf file failed ${error}`, "error");
		}
	};

	return (
		<div className="h-[calc(100%-54px)] w-52 overflow-auto mt-[30px]">
			{groups.map((group) => (
				<Item key={group.id} group={group} onChange={onChange} />
			))}
		</div>
	);
};

export default Sidebar;
