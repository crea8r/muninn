export interface List {
  id: string;
  name: string;
  description: string;
  filter_string: any;
  creator_id: string;
  created_at: string;
  last_updated: string;
  creator_name: string;
}

export interface CreatorList {
  id: string;
  creator_id: string;
  list_id: string;
  list_filter_setting: any;
  params: any;
  created_at: string;
  last_updated: string;
  list_name: string;
  list_description: string;
}
