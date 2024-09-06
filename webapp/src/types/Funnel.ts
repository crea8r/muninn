export interface Funnel {
  id: any;
  name: string;
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

export interface ObjectFunnel {
  funnelId: any;
  stepId: string;
}
