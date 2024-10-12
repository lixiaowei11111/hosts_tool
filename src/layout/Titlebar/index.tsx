import BaseTitleBar from "@/components/BaseTitleBar";
import Icon from "@/components/Icon";
import type { FC } from "react";
import GroupEditor from "@/components/GroupEditor";
import { titlebarButtonStyle } from "@/components/BaseTitleBar";

const Titlebar: FC = () => {
	return (
		<BaseTitleBar>
			<div className="flex justify-start items-center">
				<div>
					<GroupEditor isEdit>
						<Icon css={titlebarButtonStyle} type="create" />
					</GroupEditor>
				</div>
			</div>
		</BaseTitleBar>
	);
};

export default Titlebar;
