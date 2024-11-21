export enum STATUS {
	ON = "ON",
	OFF = "OFF",
}

export interface Group {
	name: string;
	id: number;
	uuid: string;
	status: STATUS;
	isDelete: boolean;
	updateTime: number;
}

export interface GroupDetail {
	id: number;
	uuid: string;
	content: string;
	updateTime: number;
}

export enum COMMAND {
	READ_CONF = "read_conf",
	UPDATE_CONF = "update_conf",
	UPDATE_GROUP_STATUS = "update_group_status",
	DEL_SINGLE_GROUP = "del_single_group",
	ADD_SINGLE_GROUP = "add_single_group",
	ADD_GROUP_DETAIL = "add_group_detail",
	DEL_GROUP_DETAIL = "del_group_detail",
	UPDATE_GROUP_CONTENT = "update_group_content",
	READ_GROUP_DETAIL = "read_group_detail",
	READ_SYSTEM_HOSTS = "read_system_hosts",
	UPDATE_SYSTEM_HOSTS = "update_system_hosts",
}
