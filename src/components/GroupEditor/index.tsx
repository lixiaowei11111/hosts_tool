import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
	DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import type {
	FC,
	MouseEventHandler,
	PropsWithChildren,
	ChangeEventHandler,
	KeyboardEventHandler,
} from "react";
import { Input } from "../ui/input";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { COMMAND } from "@/lib/ipc";
import { message } from "@tauri-apps/plugin-dialog";
import { useToast } from "@/hooks/use-toast";

interface GroupEditorProps {
	id?: number;
	isEdit?: boolean;
	onClose?: MouseEventHandler<HTMLButtonElement>;
	onSaveSuccess?: () => void;
}

const GroupEditor: FC<PropsWithChildren<GroupEditorProps>> = ({
	// id,
	isEdit = false,
	// onClose,
	children,
	onSaveSuccess,
}) => {
	const [hostname, setHostname] = useState<string>("");
	const [open, setOpen] = useState(false);
	const { toast } = useToast();

	const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
		setHostname(e.target.value.trim());
	};
	const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
		if (e.key === "Enter") {
			handleAddOrUpdate();
		}
	};
	const handleAddOrUpdate = async () => {
		try {
			if (!isEdit) {
				await invoke(COMMAND.ADD_SINGLE_GROUP, { name: hostname });
				toast({
					description: "add group success",
					variant: "success",
				});
				setOpen(false);
				onSaveSuccess?.();
			}
		} catch (error) {
			console.log("[debug] add or update group error", error);
			message(`read conf file failed ${error}`, "error");
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger onClick={() => setOpen(true)}>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle />
					<DialogDescription />
				</DialogHeader>
				<div>
					<div className="flex w-full max-w-sm items-center space-x-2">
						<Input
							value={hostname}
							placeholder="HostName"
							maxLength={64}
							onChange={handleChange}
							onKeyDown={handleKeyDown}
						/>
						<Button type="submit" onClick={handleAddOrUpdate}>
							{isEdit ? "UPDATE" : "Add"}
						</Button>
					</div>
				</div>
				<DialogFooter>
					<DialogClose />
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default GroupEditor;
