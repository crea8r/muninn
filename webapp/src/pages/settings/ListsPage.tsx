import {
  Alert,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Spacer,
  useToast,
  VStack,
} from '@chakra-ui/react';
import BreadcrumbComponent from 'src/components/Breadcrumb';
import {
  createCreatorList,
  listCreatorListsByCreatorID,
  listListsByOrgID,
  deleteList,
} from 'src/api/list';
import { useEffect, useState } from 'react';
import { CreatorList, List } from 'src/types';
import { useHistory } from 'react-router-dom';
import LoadingPanel from 'src/components/LoadingPanel';
import { DeleteIcon } from '@chakra-ui/icons';

type ListItemProps = {
  item: List;
  creatorList: CreatorList | undefined;
  openView: (id: string) => void;
  createView: (id: string) => void;
  onDelete: (id: string) => void;
};
const ListItem = ({
  item,
  creatorList,
  openView,
  createView,
  onDelete,
}: ListItemProps) => {
  return (
    <Box
      key={item.id}
      px={4}
      py={2}
      bg='white'
      borderRadius='md'
      boxShadow='sm'
    >
      <HStack>
        <Box>
          <Box alignItems={'top'}>
            {item.name} <Badge>{item.creator_name}</Badge>
          </Box>
          <Box color={'gray.500'}>{item.description}</Box>
        </Box>
        <Spacer />
        <Flex direction={'row'}>
          {creatorList ? (
            <Button onClick={() => openView(creatorList.id)} mr={2}>
              Open view
            </Button>
          ) : (
            <Button onClick={() => createView(item.id)} mr={2}>
              Use
            </Button>
          )}
          <IconButton
            aria-label='delete'
            colorScheme='red'
            icon={<DeleteIcon />}
            onClick={() => onDelete(item.id)}
          />
        </Flex>
      </HStack>
    </Box>
  );
};

const ListsPage = () => {
  const [lists, setLists] = useState<List[]>([]);
  const [creatorLists, setCreatorLists] = useState<CreatorList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const history = useHistory();
  const handleOpenView = (id: string) => {
    history.push(`/views/${id}`);
  };
  const handleCreateCreatorList = async (listId: string) => {
    try {
      const creatorList = await createCreatorList(listId);
      history.push(`/views/${creatorList.id}`);
      toast({
        title: 'View created',
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to create creator list',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };
  const handleDeteleList = async (id: string) => {
    setIsLoading(true);
    console.log('delete list', id);
    try {
      await deleteList(id);
      toast({
        title: 'List deleted',
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
      await loadData();
    } catch (e) {
      toast({
        title: 'Error',
        description: 'List is still in use, cannot delete',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const loadData = async () => {
    setIsLoading(true);
    try {
      const resp1 = await listListsByOrgID(1, 100);
      setLists(resp1.lists || []);
      const resp2 = await listCreatorListsByCreatorID();
      setCreatorLists(resp2 || []);
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to load lists',
        status: 'error',
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  // const [forcedRefresh, setForcedRefresh] = useState(0);
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Box>
      <BreadcrumbComponent label='Templates' />

      {isLoading ? (
        <LoadingPanel />
      ) : lists.length === 0 ? (
        <Alert status='info' my={2}>
          No lists found.
        </Alert>
      ) : (
        <VStack spacing={2} align='stretch'>
          {lists?.map((list: List, k) => {
            const found = creatorLists.find((cl) => cl.list_id === list.id);
            return (
              <ListItem
                item={list}
                creatorList={found}
                key={k}
                openView={handleOpenView}
                createView={handleCreateCreatorList}
                onDelete={handleDeteleList}
              />
            );
          })}
        </VStack>
      )}
    </Box>
  );
};

export default ListsPage;
