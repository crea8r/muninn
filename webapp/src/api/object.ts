// src/mocks/objectsApi.ts

import { Object, ObjectType, ObjectTypeValue } from '../types/';

const mockObjects: Object[] = Array.from({ length: 100 }, (_, i) => ({
  id: `obj-${i + 1}`,
  name: `Object ${i + 1}`,
  description: `This is a description for Object ${i + 1}`,
  tags: [{ id: `tag-${(i % 5) + 1}`, text: `Tag ${(i % 5) + 1}` }],
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  updatedAt: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
}));

const mockObjectTypes: ObjectType[] = [
  {
    id: 'dev',
    name: 'Developer',
    fields: {
      email: 'string',
      githubProfile: 'string',
      yearsOfExperience: 'number',
    },
  },
  {
    id: 'designer',
    name: 'Designer',
    fields: {
      email: 'string',
      portfolioUrl: 'string',
      specialization: 'string',
    },
  },
  {
    id: 'project',
    name: 'Project',
    fields: {
      startDate: 'date',
      endDate: 'date',
      budget: 'number',
      status: 'string',
    },
  },
];

const mockObjectTypeValues: { [key: string]: ObjectTypeValue[] } =
  mockObjects.reduce((acc, obj) => {
    acc[obj.id] = mockObjectTypes
      .slice(0, Math.floor(Math.random() * 3) + 1)
      .map((type) => ({
        objectTypeId: type.id,
        values: window.Object.fromEntries(
          window.Object.entries(type.fields).map(([key, _]) => [
            key,
            `${key}-value-for-${obj.id}`,
          ])
        ),
      }));
    return acc;
  }, {} as { [key: string]: ObjectTypeValue[] });

export const fetchObjects = async (
  page: number,
  pageSize: number,
  search?: string
): Promise<{ objects: Object[]; totalCount: number }> => {
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

  let filteredObjects = mockObjects;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredObjects = mockObjects.filter(
      (obj) =>
        obj.name.toLowerCase().includes(searchLower) ||
        obj.description.toLowerCase().includes(searchLower) ||
        obj.tags.some((tag) => tag.text.toLowerCase().includes(searchLower)) ||
        mockObjectTypeValues[obj.id].some((typeValue) =>
          window.Object.values(typeValue.values).some((value) =>
            value.toString().toLowerCase().includes(searchLower)
          )
        )
    );
  }

  const start = (page - 1) * pageSize;
  const paginatedObjects = filteredObjects.slice(start, start + pageSize);

  return {
    objects: paginatedObjects,
    totalCount: filteredObjects.length,
  };
};

export const fetchObjectTypeValues = async (
  objectId: string
): Promise<ObjectTypeValue[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay
  return mockObjectTypeValues[objectId] || [];
};
