import { axiosWithAuth } from './utils';
import { OrgProfile } from 'src/types/Org';

const API_URL = process.env.REACT_APP_API_URL;

export const listOrgMembers = async (search?: string) => {
  const { data } = await axiosWithAuth().get(`${API_URL}/org/members`, {
    params: { search: search || '' },
  });
  return data;
};

type UpdateOrgDetailsProps = {
  name: 'string';
  profile: OrgProfile;
};

export const updateOrgDetails = async (props: UpdateOrgDetailsProps) => {
  const { data } = await axiosWithAuth().put(`${API_URL}/org/details`, props);
  return data;
};

type AddNewOrgMemberProps = {
  username: string;
  role: string;
  password: string;
  profile: any;
};

export const addNewOrgMember = async (props: AddNewOrgMemberProps) => {
  const { data } = await axiosWithAuth().post(`${API_URL}/org/members`, props);
  return data;
};

type UpdateUserRoleAndStatusPropos = {
  role: 'string';
  active: 'boolean';
};

export const updateUserRoleAndStatus = async (
  userID: string,
  payload: UpdateUserRoleAndStatusPropos
) => {
  const { data } = await axiosWithAuth().put(
    `${API_URL}/org/members/${userID}/permission`,
    payload
  );
  return data;
};

export const updateUserPassword = async (userID: string, password: string) => {
  const { data } = await axiosWithAuth().put(
    `${API_URL}/org/members/${userID}/password`,
    {
      password,
    }
  );
  return data;
};

export const updateUserProfile = async (userID: string, profile: any) => {
  const { data } = await axiosWithAuth().put(
    `${API_URL}/org/members/${userID}/profile`,
    {
      profile,
    }
  );
  return data;
};
