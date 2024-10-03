export interface OrgProfile {
  avatar: string;
  email: string;
  views?: string[];
}

export interface Org {
  id: string;
  name: string;
  createdAt: string;
}

export interface OrgMember {
  id: string;
  profile: any;
  role: string;
  username: string;
  active: boolean;
}
