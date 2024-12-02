import Item from "./Item";

import type { Group } from "@/lib/ipc";
import type { FC } from "react";
import type { ItemProps } from "./Item";

import {
	useTransition,
	useSprings,
	useSpringRef,
	useChain,
	animated,
	easings,
	SpringRef,
} from "@react-spring/web";

interface SidebarProps {
	id: number;
	groups: Group[];
	onSelect: ItemProps["onClick"];
	onSwitch: ItemProps["onSwitch"];
	onDelete: ItemProps["onDelete"];
}

const Sidebar: FC<SidebarProps> = ({
	id,
	groups,
	onSelect,
	onDelete,
	onSwitch,
}) => {
	const [springs, api] = useSprings(groups.length, () => ({
		from: { opacity: 0, transform: "translateY(100%)" },
		to: { opacity: 1, transform: "translateY(0%)" },
	}));

	const transitions = useTransition(groups, {
		keys: (group) => group.id,
		from: { opacity: 0, transform: "translateX(-100%)" },
		enter: { opacity: 1, transform: "translateX(0%)" },
		leave: { opacity: 0, transform: "translateX(100%)" },
		config: { duration: 360 },
		onRest: (result) => {
			if (result.finished) {
				api.start((i) => ({
					to: { opacity: 1, transform: "translateY(0%)" },
					delay: i * 100,
				}));
			}
		},
	});

	return (
		<div className="h-[calc(100%-54px)] w-80 overflow-auto mt-[30px] text-sm">
			{transitions((style, group, _, i) => (
				<animated.div style={style}>
					<animated.div style={springs[i]}>
						<Item
							key={group.id}
							group={group}
							active={id === group.id}
							onSwitch={onSwitch}
							onClick={onSelect}
							onDelete={onDelete}
						/>
					</animated.div>
				</animated.div>
			))}
		</div>
	);
};

export default Sidebar;
