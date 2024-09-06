import { TaskStatus } from '../types/Task';

export const fetchObjectDetails = async (objectId: any) => {
  return {
    object: {
      id: 1,
      name: 'string',
      description: 'string',
      tags: [{ id: '1', text: 'string' }],
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

export const fetchAllFunnels = async () => {
  // 3 funnels, one for developer, one for startup and one for artist
  return [
    {
      id: '1',
      name: 'Developer',
      steps: [
        {
          id: '1',
          name: 'Applied',
          order: 1,
          definition: 'just apply',
          example: 'HR receives resume',
          action:
            'decide if you want to interview, send email to schedule interview or reject',
        },
        {
          id: '2',
          name: 'Interviewed',
          order: 2,
          definition: 'interviewed by HR',
          example: 'HR interviews candidate',
          action: 'decide if you want to hire, send offer or reject',
        },
        {
          id: '3',
          name: 'Hired',
          order: 3,
          definition: 'some one is newly hired',
          example: 'new employee starts working',
          action: 'send onboarding package',
        },
      ],
    },
    {
      id: '2',
      name: 'Startup',
      steps: [
        {
          id: '1',
          name: 'Pitched',
          order: 1,
          definition: 'received pitch through email',
          example: 'someone sent you a pitch',
          action: 'decide if you want to invest, send term sheet or reject',
        },
        {
          id: '2',
          name: 'Funded',
          order: 2,
          definition: 'string',
          example: 'string',
          action: 'string',
        },
        {
          id: '3',
          name: 'Launched',
          order: 3,
          definition: 'string',
          example: 'string',
          action: 'string',
        },
      ],
    },
    {
      id: '3',
      name: 'Artist',
      steps: [
        {
          id: '1',
          name: 'Painted',
          order: 1,
          definition: 'string',
          example: 'string',
          action: 'string',
        },
        {
          id: '2',
          name: 'Exhibited',
          order: 2,
          definition: 'string',
          example: 'string',
          action: 'string',
        },
        {
          id: '3',
          name: 'Sold',
          order: 3,
          definition: 'string',
          example: 'string',
          action: 'string',
        },
      ],
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
