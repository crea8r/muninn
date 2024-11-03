// steps/ObjectSelectionStep.tsx
import React, { useState } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  Tag,
  Divider,
  Link,
  IconButton,
  Spinner,
  useToast,
  Button,
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Object, ObjectType } from 'src/types';
import { fetchObjects } from 'src/api/object';
import { debounce } from 'lodash';
import { useGlobalContext } from 'src/contexts/GlobalContext';

interface ObjectSelectionStepProps {
  sourceObject: Object | null;
  targetObject: Object | null;
  onSourceSelect: (obj: Object | null) => void;
  onTargetSelect: (obj: Object | null) => void;
}

interface ObjectSelectionPanelProps {
  title: string;
  selectedObject: Object | null;
  onSelect: (obj: Object | null) => void;
  excludeId?: string;
  description: string;
}

const ObjectTypeTag: React.FC<{
  typeId: string;
  objectTypes: ObjectType[];
}> = ({ typeId, objectTypes }) => (
  <Tag size='sm' colorScheme='blue'>
    {objectTypes.find((v: ObjectType) => v.id === typeId)?.name ||
      `Unknown (${typeId})`}
  </Tag>
);

const ObjectCard: React.FC<{
  obj: Object;
  objectTypes: ObjectType[];
  onSelect?: () => void;
  isSelected?: boolean;
}> = ({ obj, objectTypes, onSelect, isSelected }) => (
  <Card
    variant='outline'
    bg={isSelected ? 'blue.50' : 'white'}
    cursor={onSelect ? 'pointer' : 'default'}
    _hover={onSelect ? { bg: 'gray.50' } : undefined}
  >
    <CardBody>
      <VStack align='stretch' spacing={3}>
        <HStack justify='space-between'>
          <Link
            href={`/objects/${obj.id}`}
            isExternal
            color='blue.600'
            fontWeight='bold'
            onClick={(e) => e.stopPropagation()}
          >
            {obj.name} <ExternalLinkIcon mx='2px' />
          </Link>
          {onSelect && (
            <Button size='sm' colorScheme='blue' onClick={onSelect}>
              Select
            </Button>
          )}
        </HStack>

        <Text noOfLines={2}>{obj.description}</Text>

        {obj.tags.length > 0 && (
          <HStack spacing={2} flexWrap='wrap'>
            {obj.tags.map((tag) => (
              <Tag
                key={tag.id}
                size='sm'
                backgroundColor={tag.color_schema.background}
                color={tag.color_schema.text}
              >
                {tag.name}
              </Tag>
            ))}
          </HStack>
        )}

        {obj.typeValues.length > 0 && (
          <Box>
            <Text fontWeight='semibold' fontSize='sm' mb={1}>
              Object Types:
            </Text>
            <HStack spacing={2} flexWrap='wrap'>
              {obj.typeValues.map((tv) => (
                <ObjectTypeTag
                  key={tv.objectTypeId}
                  typeId={tv.objectTypeId}
                  objectTypes={objectTypes}
                />
              ))}
            </HStack>
          </Box>
        )}
      </VStack>
    </CardBody>
  </Card>
);

const ObjectSelectionPanel: React.FC<ObjectSelectionPanelProps> = ({
  title,
  selectedObject,
  onSelect,
  excludeId,
  description,
}) => {
  const [searchResults, setSearchResults] = useState<Object[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { globalData } = useGlobalContext();
  const toast = useToast();

  const handleSearch = debounce(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetchObjects(1, 10, query);
      const filteredResults = response.objects.filter(
        (obj) => obj.id !== excludeId
      );
      setSearchResults(filteredResults);
    } catch (error) {
      toast({
        title: 'Error searching objects',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = event.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleClearSelection = () => {
    onSelect(null);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <Box flex={1}>
      <HStack justify='space-between' mb={4}>
        <Text fontSize='lg' fontWeight='bold'>
          {title}
        </Text>
        {selectedObject && (
          <IconButton
            aria-label='Clear selection'
            icon={<CloseIcon />}
            size='sm'
            onClick={handleClearSelection}
          />
        )}
      </HStack>

      <Text color='gray.600' mb={4} fontSize='sm'>
        {description}
      </Text>

      {!selectedObject && (
        <>
          <InputGroup mb={4}>
            <InputLeftElement>
              {isSearching ? (
                <Spinner size='sm' color='gray.400' />
              ) : (
                <SearchIcon color='gray.300' />
              )}
            </InputLeftElement>
            <Input
              placeholder='Search objects...'
              value={searchQuery}
              onChange={handleSearchInputChange}
            />
          </InputGroup>

          <VStack spacing={2} align='stretch' maxH='400px' overflowY='auto'>
            {searchResults.map((obj) => (
              <ObjectCard
                key={obj.id}
                obj={obj}
                objectTypes={globalData?.objectTypeData?.objectTypes || []}
                onSelect={() => onSelect(obj)}
              />
            ))}
            {searchQuery.length >= 2 &&
              !isSearching &&
              searchResults.length === 0 && (
                <Text textAlign='center' color='gray.500' py={4}>
                  No objects found matching your search
                </Text>
              )}
          </VStack>
        </>
      )}

      {selectedObject && (
        <ObjectCard
          obj={selectedObject}
          objectTypes={globalData?.objectTypeData?.objectTypes || []}
          isSelected
        />
      )}
    </Box>
  );
};

const ObjectSelectionStep: React.FC<ObjectSelectionStepProps> = ({
  sourceObject,
  targetObject,
  onSourceSelect,
  onTargetSelect,
}) => {
  return (
    <HStack spacing={8} align='stretch'>
      <ObjectSelectionPanel
        title='Source Object'
        description='This object will be merged into the target object and then archived'
        selectedObject={sourceObject}
        onSelect={onSourceSelect}
        excludeId={targetObject?.id}
      />
      <Divider orientation='vertical' />
      <ObjectSelectionPanel
        title='Target Object'
        description='This object will receive all data from the source object'
        selectedObject={targetObject}
        onSelect={onTargetSelect}
        excludeId={sourceObject?.id}
      />
    </HStack>
  );
};

export default ObjectSelectionStep;
