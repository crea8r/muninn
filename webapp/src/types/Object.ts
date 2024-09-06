export interface Object {
  id: any;
  name: string;
  description: string;
  tags: { id: string; text: string }[];
  createdAt: string;
  updatedAt: string;
}
