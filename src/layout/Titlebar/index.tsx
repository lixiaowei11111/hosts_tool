import { css } from "@emotion/react";
import type { FC } from "react";

import Icon from "@/components/Icon";
import BaseTitleBar from "@/components/BaseTitleBar";
import GroupEditor from "@/components/GroupEditor";

import { titlebarButtonStyle } from "@/components/BaseTitleBar";
import { useGroupStore } from "@/store";

const titleStyle = css`
  width: 100%;
  text-align: center;
  line-height: 30px;
  font-size: 16px;
  font-weight: bold;
  flex: 1;
	letter-spacing: 2px;
	word-spacing: 2px;
	pointer-events: none;
`;

interface TitlebarProps {
	onSaveSuccess?: () => void;
}

const Titlebar: FC<TitlebarProps> = ({ onSaveSuccess }) => {
	const group = useGroupStore((state) => state.currentGroup);

	return (
		<BaseTitleBar>
			<div className="flex justify-start items-center h-full">
				<div className="pointer-events-auto">
					<GroupEditor onSaveSuccess={onSaveSuccess}>
						<Icon css={titlebarButtonStyle} type="create" />
					</GroupEditor>
				</div>
				<div css={titleStyle}>
					<Icon type="file" />
					&nbsp;
					{group?.name}
				</div>
			</div>
		</BaseTitleBar>
	);
};

export default Titlebar;
