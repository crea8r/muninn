const ObjectFeedItem = ({ item, method }: { item: any; method: string }) => {
  return <>{method === 'POST' ? 'New' : 'Update'} Object</>;
};

export default ObjectFeedItem;
