import { create } from "zustand";
import type { GroupDetail, Group } from "@/lib/ipc";

interface GroupState {
	currentGroup: Group | null;
	currentGroupDetail: GroupDetail | null;
}

interface GroupActions {
	updateGroup: (group: Group) => void;
	updateGroupDetail: (groupDetail: GroupDetail) => void;
}

export const useGroupStore = create<GroupState & GroupActions>((set) => ({
	currentGroupDetail: null,
	currentGroup: null,
	updateGroup: (group) => set(() => ({ currentGroup: group })),
	updateGroupDetail: (groupDetail) =>
		set(() => ({ currentGroupDetail: groupDetail })),
}));
