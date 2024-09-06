export interface Fact {
  id: any;
  text: string;
  happened_at: string;
  location: string;
  object_id: any;
}

export type NewFact = Omit<Fact, 'id'>;
