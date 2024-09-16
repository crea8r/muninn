export interface Funnel {
  id: string;
  name: string;
  description: string;
  steps: FunnelStep[];
}

export interface FunnelStep {
  id: string;
  name: string;
  step_order: number;
  definition: string;
  example: string;
  action: string;
}

export type NewFunnelStep = Omit<FunnelStep, 'id'>;
export interface NewFunnel {
  name: string;
  description: string;
  steps: NewFunnelStep[];
}
export interface ObjectFunnel {
  funnelId: any;
  stepId: string;
}

export interface FunnelUpdate {
  id: any;
  name: string;
  description: string;
  steps: {
    create: FunnelStep[];
    update: FunnelStep[];
    delete: string[];
  };
}

// export interface FunnelUpdate {
//   id: string;
//   name?: string;
//   description?: string;
//   steps?: FunnelStep[];
// }
