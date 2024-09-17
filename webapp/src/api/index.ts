import { TaskStatus } from '../types/Task';

export const fetchObjectDetails = async (objectId: any) => {
  return {
    object: {
      id: 1,
      name: 'string',
      description: 'string',
      tags: [
        {
          id: '1',
          name: 'string',
          description: '',
          color_schema: { text: '#fff', background: '#000' },
        },
      ],
      typeValues: [{ id: '1', objectTypeId: '1', values: { key: 'value' } }],
      createdAt: '1-1-24',
      updatedAt: '1-1-24',
    },
    facts: [
      {
        id: 1,
        text: 'string',
        happened_at: '1-1-24',
        location: 'string',
        object_id: '1',
      },
      {
        id: 1,
        text: 'string',
        happened_at: '1-1-24',
        location: 'string',
        object_id: '1',
      },
      {
        id: 1,
        text: 'string',
        happened_at: '2-1-24',
        location: 'string',
        object_id: '1',
      },
    ],
  };
};

export const updateObject = async (object: any) => {};

export const addFact = async (newFact: any) => {
  return {
    id: 1,
    text: 'string',
    happened_at: '1-1-24',
    location: 'string',
    object_id: '1',
  };
};

export const fetchTasks = async (objectId: any) => {
  return [];
};

export const addTask = async (objectId: any, newTask: any) => {
  return {
    id: 1,
    content: 'string',
    status: TaskStatus.TODO,
    dueDate: '1-1-24',
    assignedTo: 'hieu',
  };
};

export const updateTaskStatus = async (taskId: any, newStatus: any) => {
  return {
    id: 1,
    content: 'string',
    status: TaskStatus.TODO,
    dueDate: '1-1-24',
    assignedTo: 'hieu',
  };
};

export const reassignTask = async (taskId: any, newAssigneeId: any) => {
  return {
    id: 1,
    content: 'string',
    status: TaskStatus.TODO,
    dueDate: '1-1-24',
    assignedTo: 'hieu',
  };
};

export const fetchObjectTypes = async (objectId: any) => {
  return {
    objectTypes: [
      {
        id: '1',
        objectTypeId: '1',
        values: {
          email: 'john@example.com',
          githubProfile: 'https://github.com/johndoe',
          yearsOfExperience: 5,
          skills: ['JavaScript', 'React', 'Node.js'],
        },
      },
    ],
    availableTypes: [
      {
        id: '1',
        name: 'Developer',
        fields: {
          email: 'string',
          githubProfile: 'string',
          yearsOfExperience: 'number',
        },
      },
      {
        id: '2',
        name: 'Designer',
        fields: {
          email: 'string',
          portfolioUrl: 'string',
          specialization: 'string',
        },
      },
      {
        id: '3',
        name: 'Project',
        fields: {
          startDate: 'date',
          endDate: 'date',
          budget: 'number',
          status: 'string',
        },
      },
    ],
  };
};

export const addObjectType = async (
  objectId: any,
  selectedType: any,
  typeValues: any
) => {
  return {
    objectTypeId: 'new',
    id: 'new',
    values: { key: 'value' },
  };
};

export const fetchObjects = async () => {};

export const removeObjectType = async (objectId: any, typeId: any) => {};

export const updateObjectTypeValue = async (
  objectId: any,
  typeId: any,
  field: any,
  value: any
) => {
  return {
    id: 'updated',
    objectTypeId: 'new',
    values: { key: 'value' },
  };
};

export const fetchObjectFunnels = async (objectId: any) => {
  return [
    {
      objectId: 'obj1',
      funnelId: '1',
      stepId: '2',
    },
    {
      objectId: 'obj2',
      funnelId: '2',
      stepId: '1',
    },
    {
      objectId: 'obj3',
      funnelId: '3',
      stepId: '3',
    },
  ];
};

export const addObjectToFunnel = async (
  objectId: string,
  selectedFunnel: string,
  selectedStep: string
) => {
  return {
    objectId: 'new',
    funnelId: 'new',
    stepId: 'new',
  };
};

export const moveObjectInFunnel = async (
  objectId: any,
  funnelId: any,
  newStepId: any
) => {
  return {
    objectId: 'new',
    funnelId: 'new',
    stepId: 'new',
  };
};

export const removeObjectFromFunnel = async (
  objectId: any,
  funnelId: any
) => {};

export const importCSV = async (csvData: any, selectedObjectTypes: any) => {};
