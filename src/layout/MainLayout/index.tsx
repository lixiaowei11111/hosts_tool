import Sidebar from "../Sidebar";
import Editor from "@/components/CodeEditor";
import BaseTitleBar from "@/components/BaseTitleBar";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";

const MainLayout = () => {
	const [id, setId] = useState<number>(0);

	// group id change
	const handleSidebarChange = (id: number) => {
		setId(id);
	};

	return (
		<div className="flex h-screen box-border justify-between border-t-[1px] border-solid border-gray-400">
			<header>
				<BaseTitleBar />
			</header>
			<Sidebar onChange={handleSidebarChange} />
			<main className="w-full border-l-[1px] border-solid border-gray-400">
				<div className="h-[calc(100%-54px)] overflow-auto mt-[30px]">
					<Editor id={id} />
				</div>
				<footer className="w-full h-6 text-gray-500 indent-[30px]">
					display some information
				</footer>
			</main>
			<Toaster />
		</div>
	);
};

export default MainLayout;
