export const extractRelatedItems = (text: string): any[] => {
  const mentionRegex = /@\[([^\]]+)\]\((\w+):([^)]+)\)/g;
  const items: any[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    const [, name, type, id] = match;
    const item = {
      type,
      payload: { id, name },
    };
    if (!items.some((existingItem) => existingItem.payload.id === id)) {
      items.push(item);
    }
  }

  return items;
};

export const getInitialValueFromMentionItem = ({
  type,
  payload,
}: {
  type: string;
  payload: {
    id: string;
    name: string;
  };
}): string => {
  return `@[${payload.name}](${type}:${payload.id})`;
};
