import Sidebar from "../Sidebar";
import Editor from "@/components/CodeEditor";

const MainLayout = () => {
	return (
		<div className="flex h-screen box-border justify-between border-t-[1px] border-solid border-gray-400">
			<Sidebar />
			<main className="w-full border-l-[1px] border-solid border-gray-400">
				<div className="h-[calc(100%-24px)] overflow-auto">
					<Editor />
				</div>
				<footer className="w-full h-6 bg-slate-300">
					display some information
				</footer>
			</main>
		</div>
	);
};

export default MainLayout;
