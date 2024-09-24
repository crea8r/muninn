export interface OrgMemberProfile {
  avatar: string;
  fullname: string;
  email: string;
}

export interface OrgProfile {
  avatar: string;
  email: string;
}

export interface Org {
  id: string;
  name: string;
  createdAt: string;
}

export interface OrgMember {
  id: string;
  profile: OrgMemberProfile;
  role: string;
  username: string;
  active: boolean;
}
