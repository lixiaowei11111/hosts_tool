import { useState, useEffect } from "react";
import { useGroupStore } from "@/store";
import { useToast } from "@/hooks/use-toast";

import { Toaster } from "@/components/ui/toaster";
import Editor from "@/components/CodeEditor";
import Titlebar from "../Titlebar";
import Sidebar from "../Sidebar";

import dayjs from "dayjs";
import { COMMAND, STATUS, type Group } from "@/lib/ipc";
import { message } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

import type { ItemProps } from "../Sidebar/Item";

const MainLayout = () => {
	const { toast } = useToast();

	const [id, setId] = useState<number>(0);
	const [isDeleted, setDeleted] = useState(false);
	const [groups, setGroups] = useState<Group[]>([]);

	const updateGroup = useGroupStore((state) => state.updateGroup);
	const group = useGroupStore((state) => state.currentGroup);

	useEffect(() => {
		getList();
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (isDeleted) {
			const lastGroup = groups[groups.length - 1];
			setId(lastGroup?.id);
			updateGroup(lastGroup);
			setDeleted(false);
		}
	}, [isDeleted]);

	const getList = async () => {
		try {
			const groups: Group[] = await invoke(COMMAND.READ_CONF, {
				needSystem: true,
			});
			console.log("[debug] groups", groups);
			setGroups(groups);
		} catch (error) {
			console.log("[DEBUG] read conf file failed", error);
			message(`read conf file failed ${error}`, "error");
		}
	};

	const handleSidebarChange: ItemProps["onClick"] = (group) => {
		setId(group.id);
		group && updateGroup(group);
	};

	const handleSwitch: ItemProps["onSwitch"] = async (id, status) => {
		try {
			await invoke(COMMAND.UPDATE_GROUP_STATUS, { id, status });
			toast({
				description: "switch group status success",
				variant: "success",
			});
			await getList();
		} catch (error) {
			console.log("[DEBUG]", error);
			message(`switch group status failed ${error}`, "error");
		}
	};

	const handleDelete: ItemProps["onDelete"] = async (id) => {
		try {
			await invoke(COMMAND.DEL_SINGLE_GROUP, { id });
			await handleSwitch(id, STATUS.OFF);
			await invoke(COMMAND.UPDATE_SYSTEM_HOSTS);
			await getList();
			setDeleted(true);
			toast({
				description: "delete group status success",
				variant: "success",
			});
		} catch (error) {
			console.log("[DEBUG]", error);
			message(`delete group status failed ${error}`, "error");
		}
	};

	const handleSaveSuccess = async (id: number) => {
		await getList();
		setId(id);
		const group = groups.find((item) => item.id === id);
		group && updateGroup(group);
	};

	return (
		<div className="flex h-screen box-border justify-between border-t-[1px] border-solid border-gray-400">
			<header>
				<Titlebar onSaveSuccess={handleSaveSuccess} />
			</header>
			<Sidebar
				id={id}
				groups={groups}
				onSelect={handleSidebarChange}
				onSwitch={handleSwitch}
				onDelete={handleDelete}
			/>
			<main className="w-full border-l-[1px] border-solid border-gray-400">
				<div className="h-[calc(100%-54px)] overflow-auto mt-[30px]">
					<Editor id={id} />
				</div>
				<footer className="w-full h-6 text-gray-500 indent-[32px] text-xs">
					最后修改时间:
					{dayjs((group?.updateTime || 0) * 1000).format("YYYY-MM-DD HH:mm:ss")}
				</footer>
			</main>
			<Toaster />
		</div>
	);
};

export default MainLayout;
