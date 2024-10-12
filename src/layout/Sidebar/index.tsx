import { type Group, COMMAND, type STATUS } from "@/lib/ipc";
import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect, type FC } from "react";
import { message } from "@tauri-apps/plugin-dialog";
import Item from "./Item";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
	onChange: (uuid: string) => void;
}

const Sidebar: FC<SidebarProps> = ({ onChange }) => {
	const { toast } = useToast();

	const [groups, setGroups] = useState<Group[]>([]);
	const [curId, setCurId] = useState<string>();

	useEffect(() => {
		getList(true);
	}, []);

	const handleSelect = (uuid: string) => {
		setCurId(uuid);
		onChange(uuid);
	};

	const handleSwitch = async (uuid: string, status: STATUS) => {
		try {
			await invoke(COMMAND.UPDATE_GROUP_STATUS, { uuid, status });
			await getList();
			toast({
				description: "switch group status success",
				variant: "success",
			});
		} catch (error) {
			console.log("[DEBUG]", error);
			message(`switch group status failed ${error}`, "error");
		}
	};

	const getList = async (setInitId = false) => {
		try {
			const groups: Group[] = await invoke(COMMAND.READ_CONF);
			setGroups(groups);
			setInitId && setCurId(groups[0].uuid);
		} catch (error) {
			console.log("[DEBUG] read conf file failed", error);
			message(`read conf file failed ${error}`, "error");
		}
	};

	return (
		<div className="h-[calc(100%-54px)] w-80 overflow-auto mt-[30px] text-sm">
			{groups.map((g) => (
				<Item
					key={g.uuid}
					group={g}
					active={curId === g.uuid}
					onSwitch={handleSwitch}
					onClick={handleSelect}
				/>
			))}
		</div>
	);
};

export default Sidebar;
