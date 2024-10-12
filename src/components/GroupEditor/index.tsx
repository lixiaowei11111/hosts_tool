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

interface GroupEditorProps {
	uuid?: number;
	isEdit: boolean;
	onClose?: MouseEventHandler<HTMLButtonElement>;
}

const GroupEditor: FC<PropsWithChildren<GroupEditorProps>> = ({
	uuid,
	isEdit,
	onClose,
	children,
}) => {
	const [hostname, setHostname] = useState<string>("");

	const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
		setHostname(e.target.value.trim());
	};
	const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
		if (e.key === "Enter") {
			handleAddOrUpdate();
		}
	};
	const handleAddOrUpdate = () => {
		console.log("[debug] submit");
	};

	return (
		<Dialog>
			<DialogTrigger>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle />
					<DialogDescription />
				</DialogHeader>
				<div className="grid gap-4 py-4">
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
