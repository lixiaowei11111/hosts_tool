import { useState, useEffect } from "react";
import { useGroupStore } from "@/store";

import { Toaster } from "@/components/ui/toaster";
import Editor from "@/components/CodeEditor";
import Titlebar from "../Titlebar";
import Sidebar from "../Sidebar";

import dayjs from "dayjs";
import { COMMAND, type Group } from "@/lib/ipc";
import { message } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

const MainLayout = () => {
	const [id, setId] = useState<number>(0);
	const [groups, setGroups] = useState<Group[]>([]);

	useEffect(() => {
		getList();
	}, []);

	const getList = async () => {
		try {
			const groups: Group[] = await invoke(COMMAND.READ_CONF);
			console.log("[debug] groups", groups);
			setGroups(groups);
		} catch (error) {
			console.log("[DEBUG] read conf file failed", error);
			message(`read conf file failed ${error}`, "error");
		}
	};

	// group id change
	const handleSidebarChange = (id: number) => {
		setId(id);
	};

	const handleSaveSuccess = () => {
		getList();
	};

	const group = useGroupStore((state) => state.currentGroup);

	return (
		<div className="flex h-screen box-border justify-between border-t-[1px] border-solid border-gray-400">
			<header>
				<Titlebar onSaveSuccess={handleSaveSuccess} />
			</header>
			<Sidebar
				groups={groups}
				onChange={handleSidebarChange}
				onSwitch={handleSaveSuccess}
				onDelete={handleSaveSuccess}
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
