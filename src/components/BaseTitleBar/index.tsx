import Icon from "@/components/Icon";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useMemo, useState } from "react";
import { css } from "@emotion/react";
import { useToast } from "@/hooks/use-toast";
import type {
	FC,
	MouseEvent,
	MouseEventHandler,
	PropsWithChildren,
} from "react";

const titlebarStyle = css`
	height: 30px;
  background: #fff;
  user-select: none;
  display: flex;
  justify-content: flex-end;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
`;

export const titlebarButtonStyle = css`
 	display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  user-select: none;
  -webkit-user-select: none;
	color: #222;
	&:hover {
  	background: #eee;
	}
`;

const closeButtonSeyle = css([
	titlebarButtonStyle,
	{ "&:hover": { background: "#dc2626" } },
]);

const BaseTitleBar: FC<PropsWithChildren> = ({ children }) => {
	const [isMaximized, setIsMaximized] = useState<boolean>(false);
	const { toast } = useToast();

	const appWindow = useMemo(() => {
		return getCurrentWindow();
	}, []);

	const handleMinimize = async (e: MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		try {
			await appWindow.minimize();
		} catch (error) {
			toast({
				description: `minimize window occurred error${error}`,
				variant: "destructive",
			});
		}
	};
	const handleToggleMaximize: MouseEventHandler<HTMLDivElement> = async (e) => {
		e.stopPropagation();
		try {
			await appWindow.toggleMaximize();
			const isMaximized = await appWindow.isMaximized();
			setIsMaximized(isMaximized);
		} catch (error) {
			toast({
				description: `toggle maximize window occurred error${error}`,
				variant: "destructive",
			});
		}
	};
	const handleClose: MouseEventHandler<HTMLElement> = async (e) => {
		e.stopPropagation();
		try {
			await appWindow.close();
		} catch (error) {
			toast({
				description: `close window occurred error${error}`,
				variant: "destructive",
			});
		}
	};

	const handleMouseDown: MouseEventHandler<HTMLDivElement> = async (e) => {
		try {
			if (e.buttons === 1 && e.detail !== 2 && e.target === e.currentTarget) {
				await appWindow.startDragging();
			}
		} catch (error) {
			toast({
				description: `start dragging window occurred error${error}`,
				variant: "destructive",
			});
		}
	};

	return (
		<div css={titlebarStyle} onMouseDown={handleMouseDown}>
			<div>{children}</div>
			<div>
				<Icon
					css={titlebarButtonStyle}
					type="window-minimize"
					onClick={handleMinimize}
				/>
				<Icon
					css={titlebarButtonStyle}
					className="text-[14px]"
					type={isMaximized ? "window-restore" : "window-maximize"}
					onClick={handleToggleMaximize}
				/>
				<Icon
					css={closeButtonSeyle}
					type="window-close"
					onClick={handleClose}
				/>
			</div>
		</div>
	);
};

export default BaseTitleBar;
