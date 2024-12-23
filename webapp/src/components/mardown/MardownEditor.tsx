import React, { useState, useEffect, useCallback, useRef } from 'react';
import MDEditor, { commands, ICommand } from '@uiw/react-md-editor';
import { useSpotLight } from 'src/contexts/SpotLightContext';
import {
  Box,
  Badge,
  Wrap,
  WrapItem,
  Tooltip,
  TabList,
  Tabs,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import MarkdownDisplay from './MarkdownDisplay';
import { SpotLightFilter } from 'src/components/spot-light/SpotLight';
import { extractRelatedItems } from './utils';

interface MarkdownEditorProps {
  initialValue: string;
  onChange: (content: string, relatedItems: any[]) => void;
  filters?: SpotLightFilter[];
  isDisabled?: boolean;
  mode?: 'edit' | 'preview';
  height?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialValue,
  onChange,
  filters = [
    SpotLightFilter.CREATOR,
    SpotLightFilter.OBJECT,
    SpotLightFilter.FACT,
    SpotLightFilter.TASK,
  ],
  isDisabled = false,
  mode = 'edit',
  height,
}) => {
  const [value, setValue] = useState(initialValue);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);
  const { openSpotLight } = useSpotLight();
  const editorRef = useRef<any>(null);
  const [selectedTabIndex, setSelectedTabIndex] = useState(
    mode === 'edit' ? 0 : 1
  );
  useEffect(() => {
    setValue(initialValue);
    const newRelatedItems = extractRelatedItems(initialValue);
    setRelatedItems(newRelatedItems);
  }, [initialValue]);

  const handleValueChange = useCallback(
    (newValue: string | undefined) => {
      if (newValue !== undefined) {
        setValue(newValue);
        const newRelatedItems = extractRelatedItems(newValue);
        setRelatedItems(newRelatedItems);
        onChange(newValue, newRelatedItems);
      }
    },
    [onChange]
  );

  const handleSpotLightSelect = useCallback(
    (item: any) => {
      if (item) {
        const mention = `@[${item.payload.name || item.payload.username}](${
          item.type
        }:${item.payload.id})`;
        const textarea = editorRef.current?.textarea;
        if (textarea) {
          const { selectionStart, selectionEnd } = textarea;
          const newValue =
            value.substring(0, selectionStart) +
            mention +
            value.substring(selectionEnd);
          handleValueChange(newValue);
          // Set cursor position after the inserted mention
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd =
              selectionStart + mention.length;
          }, 0);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editorRef, handleValueChange]
  );

  const handleMentionTrigger = useCallback(() => {
    openSpotLight(filters, () => handleSpotLightSelect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSpotLight, value, handleValueChange]);

  const mentionCommand = {
    name: 'mention',
    keyCommand: 'mention',
    buttonProps: { 'aria-label': 'Insert mention' },
    icon: <span>@</span>,
    execute: handleMentionTrigger,
  } as ICommand;

  return (
    <Box mt={2} mb={2}>
      <Tabs
        index={selectedTabIndex}
        onChange={(e) => {
          setSelectedTabIndex(selectedTabIndex === 0 ? 1 : 0);
        }}
      >
        <TabList>
          <Tab>Write</Tab>
          <Tab>Preview</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0} pt={4} pb={2}>
            <MDEditor
              ref={editorRef}
              value={value}
              onChange={handleValueChange}
              preview={isDisabled ? 'preview' : 'edit'}
              commands={
                filters.length > 0
                  ? [...commands.getCommands(), mentionCommand]
                  : [...commands.getCommands()]
              }
              extraCommands={[]}
              height={height || '200px'}
            />
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
          </TabPanel>
          <TabPanel px={0} pt={4} pb={2}>
            <MarkdownDisplay content={value} characterLimit={200} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default MarkdownEditor;
