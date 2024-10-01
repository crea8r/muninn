import { Funnel, FunnelStep, Object } from 'src/types';

export const mockFunnel: Funnel = {
  id: '1',
  name: 'Sales Pipeline',
  description: 'Our main sales funnel',
  steps: [
    {
      id: 'step1',
      name: 'Lead',
      step_order: 1,
      definition: 'Potential customer identified',
      example: 'Someone who downloaded a whitepaper',
      action: 'Reach out via email',
    },
    {
      id: 'step2',
      name: 'Qualified',
      step_order: 2,
      definition: 'Lead that fits our ideal customer profile',
      example: 'A company in our target market with budget',
      action: 'Schedule a discovery call',
    },
    {
      id: 'step3',
      name: 'Proposal',
      step_order: 3,
      definition: 'Qualified lead that received a proposal',
      example: 'Sent a detailed quote for services',
      action: 'Follow up on the proposal',
    },
    {
      id: 'step4',
      name: 'Negotiation',
      step_order: 4,
      definition: 'Prospect is actively considering our proposal',
      example: 'Discussing terms and conditions',
      action: 'Address concerns and emphasize value',
    },
    {
      id: 'step5',
      name: 'Closed Won',
      step_order: 5,
      definition: 'Deal successfully closed',
      example: 'Contract signed and received payment',
      action: 'Begin onboarding process',
    },
  ],
};

export const mockObjects: Object[] = [
  {
    id: 'obj1',
    name: 'Acme Corp',
    idString: 'ACME001',
    description: 'Large manufacturing company',
    tags: [
      {
        id: 'tag1',
        name: 'Manufacturing',
        description: '',
        color_schema: { background: '#FF5733', text: '#FFFFFF' },
      },
    ],
    createdAt: '2023-05-01T10:00:00Z',
    updatedAt: '2023-05-01T10:00:00Z',
    typeValues: [
      {
        id: 'tv1',
        objectTypeId: 'ot1',
        type_values: {
          industry: 'Manufacturing',
          employees: '1000+',
          revenue: '$500M+',
        },
      },
    ],
  },
  {
    id: 'obj2',
    name: 'TechStart Inc',
    idString: 'TECH001',
    description: 'Emerging SaaS startup',
    tags: [
      {
        id: 'tag2',
        name: 'SaaS',
        description: '',
        color_schema: { background: '#3498DB', text: '#FFFFFF' },
      },
    ],
    createdAt: '2023-05-02T14:30:00Z',
    updatedAt: '2023-05-02T14:30:00Z',
    typeValues: [
      {
        id: 'tv2',
        objectTypeId: 'ot1',
        type_values: {
          industry: 'Technology',
          employees: '50-200',
          revenue: '$5M-$20M',
        },
      },
    ],
  },
  // Add more mock objects as needed
];

// Assign mock objects to steps
export const mockObjectsInSteps: { [stepId: string]: Object[] } = {
  step1: mockObjects.slice(0, 2),
  step2: mockObjects.slice(2, 4),
  step3: mockObjects.slice(4, 5),
  step4: mockObjects.slice(5, 6),
  step5: mockObjects.slice(6),
};
