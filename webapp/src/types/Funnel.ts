export interface Funnel {
  id: any;
  name: string;
  description: string;
  steps: FunnelStep[];
}

export interface FunnelStep {
  id: any;
  name: string;
  order: number;
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
