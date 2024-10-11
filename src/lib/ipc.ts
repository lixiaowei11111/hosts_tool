export enum STATUS {
	ON = "ON",
	OFF = "OFF",
	DELETE = "DELETE",
}

export interface Group {
	name: string;
	id: number;
	status: STATUS;
	update_time: number;
}

export interface GroupDetail{
  id: number;
  content: string,
  update_time: number,

}

export enum COMMAND {
  READ_CONF="read_conf",
  UPDATE_CONF="update_conf",
  UPDATE_GROUP_STATUS="update_group_status",
  DEL_SINGLE_GROUP="del_single_group",
  ADD_GROUP="add_group",
  DEL_GROUP="del_group",
  UPDATE_GROUP_CONTENT="update_group_content",
  READ_GROUP="read_group",
  READ_SYSTEM_HOSTS="read_system_hosts",
  UPDATE_SYSTEM_HOSTS="update_system_hosts", 
}