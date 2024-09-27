import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  Editor,
  EditorState,
  RichUtils,
  CompositeDecorator,
  convertToRaw,
  convertFromRaw,
  DraftHandleValue,
  ContentState,
  Modifier,
  SelectionState,
  ContentBlock,
  getDefaultKeyBinding,
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import { useSpotLight } from 'src/contexts/SpotLightContext';
import {
  Badge,
  Box,
  Button,
  HStack,
  IconButton,
  Spacer,
  Tooltip,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { FaList, FaListOl } from 'react-icons/fa';
import { SpotLightFilter } from '../SpotLight';
import { randomId } from 'src/utils';
import { keyBy } from 'lodash';

interface WYSIWYGEditorProps {
  initialValue: any;
  onChange: (content: string, relatedItems: any[]) => void;
  filters?: SpotLightFilter[];
}

export type MentionItemType = {
  type: SpotLightFilter;
  payload: {
    id: string;
    name?: string;
    username?: string;
    description?: string;
    content?: string;
  };
};

export const convertToMentionItem = function (item: any): MentionItemType {
  return {
    type: item.type,
    payload: {
      id: item.payload.id,
      name: item.payload.name,
      username: item.payload.username,
      description: item.payload.description,
      content: item.payload.content,
    },
  };
};

const WYSIWYGEditor: React.FC<WYSIWYGEditorProps> = ({
  initialValue,
  onChange,
  filters = [
    SpotLightFilter.CREATOR,
    SpotLightFilter.OBJECT,
    SpotLightFilter.FACT,
    SpotLightFilter.TASK,
  ],
}) => {
  const editorRef = useRef<Editor>(null);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);
  const { openSpotLight } = useSpotLight();

  // Create a persistent decorator
  const decorator = useMemo(() => {
    return new CompositeDecorator([
      {
        strategy: findLinkEntities,
        component: Link,
      },
      {
        strategy: findMentionEntities,
        component: Mention,
      },
    ]);
  }, []);

  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(decorator)
  );

  useEffect(() => {
    editorRef.current?.editorContainer?.style.setProperty(
      'min-height',
      '100px'
    );
    const initialEditorState = parseInitialValue(initialValue);
    setEditorState(initialEditorState);
  }, [initialValue, decorator]);

  const parseInitialValue = (value: any): EditorState => {
    let contentState;
    if (typeof value === 'string') {
      try {
        const parsedValue = JSON.parse(value);
        contentState = convertFromRaw(parsedValue);
      } catch {
        contentState = ContentState.createFromText(value);
      }
    } else if (typeof value === 'object') {
      contentState = convertFromRaw(value);
    } else {
      contentState = ContentState.createFromText('');
    }
    const editorState = EditorState.createWithContent(contentState, decorator);
    setRelatedItems(getRelatedItemsFromEditorState(editorState));
    return editorState;
  };

  const handleEditorChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
    const newRelatedItems = getRelatedItemsFromEditorState(newEditorState);
    setRelatedItems(newRelatedItems);
  };

  const handleBlur = () => {
    const content = JSON.stringify(
      convertToRaw(editorState.getCurrentContent())
    );
    onChange(content, relatedItems);
  };
  const handleSpotLightSelect = useCallback(
    (item: any) => {
      if (item) {
        const currentContent = editorState.getCurrentContent();
        const selection = editorState.getSelection();

        const contentWithEntity = currentContent.createEntity(
          'MENTION',
          'IMMUTABLE',
          { mention: convertToMentionItem(item) }
        );
        const entityKey = contentWithEntity.getLastCreatedEntityKey();

        const mentionText = `@${item.payload.name || item.payload.username}`;
        let contentWithMention = Modifier.insertText(
          contentWithEntity,
          selection,
          mentionText,
          undefined,
          entityKey
        );

        contentWithMention = Modifier.insertText(
          contentWithMention,
          contentWithMention.getSelectionAfter(),
          ' '
        );

        const blockKey = selection.getAnchorKey();
        const newOffset = selection.getAnchorOffset() + mentionText.length + 1;
        const newSelection = SelectionState.createEmpty(blockKey).merge({
          anchorOffset: newOffset,
          focusOffset: newOffset,
        });

        const newEditorState = EditorState.push(
          editorState,
          contentWithMention,
          'insert-characters'
        );

        const finalEditorState = EditorState.forceSelection(
          newEditorState,
          newSelection
        );

        setEditorState(finalEditorState);
        setRelatedItems((prevItems) => [
          ...prevItems,
          convertToMentionItem(item),
        ]);

        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.focus();
          }
        }, 0);
      }
    },
    [editorState, setEditorState, setRelatedItems]
  );

  const handleBeforeInput = useCallback(
    (chars: string, editorState: EditorState): DraftHandleValue => {
      if (chars === '@') {
        openSpotLight(filters, () => handleSpotLightSelect);
        return 'handled';
      }
      return 'not-handled';
    },
    [openSpotLight, handleSpotLightSelect]
  );

  const getRelatedItemsFromEditorState = (state: EditorState): any[] => {
    const contentState = state.getCurrentContent();
    const blockMap = contentState.getBlockMap();
    const relatedItems: any[] = [];
    const seenEntityKeys = new Set();

    blockMap.forEach((contentBlock: ContentBlock | undefined) => {
      contentBlock?.findEntityRanges(
        (character) => {
          const entityKey = character.getEntity();
          if (entityKey === null) {
            return false;
          }
          const entity = contentState.getEntity(entityKey);
          return entity.getType() === 'MENTION';
        },
        (start, end) => {
          const entityKey = contentBlock.getEntityAt(start);
          if (entityKey && !seenEntityKeys.has(entityKey)) {
            seenEntityKeys.add(entityKey);
            const entity = contentState.getEntity(entityKey);
            const mention = entity.getData().mention;
            if (mention && mention.payload && mention.payload.id) {
              const existingItem = relatedItems.find(
                (item) => item.payload.id === mention.payload.id
              );
              if (!existingItem) {
                relatedItems.push(mention);
              }
            }
          }
        }
      );
    });

    return relatedItems;
  };
  const keyBindingFn = (e: React.KeyboardEvent): string | null => {
    // if (e.key === '@') {
    //   return 'mention';
    // }
    return getDefaultKeyBinding(e);
  };
  const handleReturn = useCallback(
    (e: React.KeyboardEvent, editorState: EditorState): DraftHandleValue => {
      const newEditorState = RichUtils.insertSoftNewline(editorState);
      if (newEditorState !== editorState) {
        handleEditorChange(newEditorState);
        return 'handled';
      }
      return 'not-handled';
    },
    []
  );

  const handleKeyCommand = useCallback(
    (command: string, editorState: EditorState): DraftHandleValue => {
      const newState = RichUtils.handleKeyCommand(editorState, command);
      if (newState) {
        handleEditorChange(newState);
        return 'handled';
      }
      return 'not-handled';
    },
    []
  );

  const toggleInlineStyle = (inlineStyle: string) => {
    handleEditorChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const toggleBlockType = (blockType: string) => {
    handleEditorChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  const handleStyleButtonClick = (
    e: React.MouseEvent,
    styleFunction: () => void
  ) => {
    e.preventDefault();
    styleFunction();
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }, 0);
  };

  return (
    <Box mt={2} mb={2}>
      <HStack spacing={1} background='gray.100' px={2} py={1} mb={1}>
        <Button
          size={'sm'}
          onMouseDown={(e) =>
            handleStyleButtonClick(e, () => toggleInlineStyle('BOLD'))
          }
        >
          B
        </Button>
        <Button
          size={'sm'}
          onMouseDown={(e) =>
            handleStyleButtonClick(e, () => toggleInlineStyle('ITALIC'))
          }
        >
          I
        </Button>
        <IconButton
          icon={<FaListOl />}
          size='sm'
          onMouseDown={(e) =>
            handleStyleButtonClick(e, () =>
              toggleBlockType('ordered-list-item')
            )
          }
          aria-label={'Ordered List'}
        />
        <IconButton
          icon={<FaList />}
          size='sm'
          onMouseDown={(e) =>
            handleStyleButtonClick(e, () =>
              toggleBlockType('unordered-list-item')
            )
          }
          aria-label={'Unordered List'}
        />
      </HStack>
      <Box border={'solid #ccc 1px'} p={1}>
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={handleEditorChange}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={keyBindingFn}
          handleBeforeInput={handleBeforeInput}
          handleReturn={handleReturn}
          onBlur={handleBlur}
          placeholder='Enter @ to mention other contacts'
        />
      </Box>
      <Wrap spacing={2} mt={2}>
        {relatedItems.map((item) => (
          <WrapItem key={item.payload.id}>
            <Tooltip
              label={`${item.payload.username || item.payload.name}, ${
                item.type
              }`}
            >
              <Badge colorScheme='blue'>
                {item.payload.name || item.payload.username}
              </Badge>
            </Tooltip>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  );
};

const findLinkEntities = (
  contentBlock: any,
  callback: any,
  contentState: any
) => {
  contentBlock.findEntityRanges((character: any) => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === 'LINK'
    );
  }, callback);
};

const Link = (props: any) => {
  const { url } = props.contentState.getEntity(props.entityKey).getData();
  return (
    <a href={url} style={{ color: '#3b5998', textDecoration: 'underline' }}>
      {props.children}
    </a>
  );
};

const findMentionEntities = (
  contentBlock: any,
  callback: any,
  contentState: any
) => {
  contentBlock.findEntityRanges((character: any) => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === 'MENTION'
    );
  }, callback);
};

const Mention = (props: any) => {
  const { mention } = props.contentState.getEntity(props.entityKey).getData();
  return (
    <span
      style={{
        backgroundColor: 'yellow',
        padding: '1px 3px',
        borderRadius: '2px',
        fontWeight: 'bold',
      }}
    >
      {props.children}
    </span>
  );
};

export default WYSIWYGEditor;
