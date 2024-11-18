import { type Group, COMMAND, type STATUS } from "@/lib/ipc";
import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect, type FC } from "react";
import { message } from "@tauri-apps/plugin-dialog";
import Item from "./Item";
import { useToast } from "@/hooks/use-toast";
import { useGroupStore } from "@/store";
import type { ItemProps } from "./Item";

interface SidebarProps {
	groups: Group[];
	onChange: (id: number) => void;
	onSwitch: (id?: number, status?: STATUS) => void;
}

const Sidebar: FC<SidebarProps> = ({ groups, onChange, onSwitch }) => {
	const { toast } = useToast();

	const [curId, setCurId] = useState<number>(0);

	const updateGroup = useGroupStore((state) => state.updateGroup);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setCurId(groups[0]?.id);
		updateGroup(groups?.[0]);
		console.log("[debug] sidebar is update", groups, updateGroup);
	}, []);

	const handleSelect: ItemProps["onClick"] = (group: Group) => {
		setCurId(group.id);
		onChange(group.id);
		updateGroup(group);
	};

	const handleSwitch = async (id: number, status: STATUS) => {
		try {
			await invoke(COMMAND.UPDATE_GROUP_STATUS, { id, status });
			onSwitch();
			toast({
				description: "switch group status success",
				variant: "success",
			});
		} catch (error) {
			console.log("[DEBUG]", error);
			message(`switch group status failed ${error}`, "error");
		}
	};

	return (
		<div className="h-[calc(100%-54px)] w-80 overflow-auto mt-[30px] text-sm">
			{groups.map((g) => (
				<Item
					key={g.id}
					group={g}
					active={curId === g.id}
					onSwitch={handleSwitch}
					onClick={handleSelect}
				/>
			))}
		</div>
	);
};

export default Sidebar;
