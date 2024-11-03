export interface AdvancedFilterResponse {
  items: {
    id: string;
    id_string: string;
    name: string;
    description: string;
    created_at: string;
    first_fact_date: string;
    last_fact_date: string;
    search_rank: number;
    tags: Array<{
      id: string;
    }>;
    type_values: Array<{
      id: string;
      objectTypeId: string;
      type_values: Record<string, any>;
    }>;
    steps: Array<{
      id: string;
      stepId: string;
      subStatus: number;
      createdAt: string;
      lastUpdated: string;
    }>;
  }[];
  total_count:
    | number
    | {
        total_count: number;
        step_counts: Record<string, number>;
      };
  page: number;
  page_size: number;
}
