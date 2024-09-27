export interface Fact {
  id: any;
  text: string;
  happenedAt: string;
  location: string;
  creatorId: string;
  creatorName?: string;
  createdAt: string;
  relatedObjects: any[];
}
