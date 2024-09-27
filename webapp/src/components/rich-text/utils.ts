import { MentionItemType } from './RichTextEditor';
import { randomId } from 'src/utils';

export const getInitialValueFromMentionItem = function (
  item: MentionItemType
): any {
  return {
    blocks: [
      {
        key: randomId(5),
        text: item.payload.name || item.payload.username,
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [
          {
            offset: 0,
            length:
              (item.payload.name || item.payload.username || '').length + 1,
            key: 0,
          },
        ],
        data: {},
      },
    ],
    entityMap: {
      '0': {
        type: 'MENTION',
        mutability: 'IMMUTABLE',
        data: {
          mention: {
            type: item.type,
            payload: {
              id: item.payload.id,
              name: item.payload.name,
              username: item.payload.username,
              description: item.payload.description,
              content: item.payload.content,
            },
          },
        },
      },
    },
  };
};
