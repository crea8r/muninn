import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  Link,
  IconButton,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { deleteCreatorList, listCreatorListsByCreatorID } from 'src/api/list';
import { CreatorList } from 'src/types';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import authService from 'src/services/authService';
import { FaBookmark, FaPlus, FaTrash } from 'react-icons/fa';
import { updateUserProfile } from 'src/api';

interface View {
  id: string;
  name: string;
  description: string;
}

const ViewsPage: React.FC = () => {
  const [views, setViews] = useState<View[]>([]);
  const history = useHistory();
  const [bookmarkViews, setBookmarkViews] = useState<
    { id: string; name: string }[]
  >([]);
  const [foredRefresh, setForcedRefresh] = useState(0);
  const { globalData, refreshGlobalData } = useGlobalContext();
  const toast = useToast();

  const loadViews = async () => {
    const resp = await listCreatorListsByCreatorID();
    const tmp = resp?.map((cl: CreatorList) => ({
      id: cl.id,
      name: cl.list_name,
      description: cl.list_description,
    }));
    setViews(tmp);
  };

  useEffect(() => {
    loadViews();
    const member = globalData?.members.find(
      (m) => m.id === authService.getCreatorId()
    );
    setBookmarkViews(member?.profile.views || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foredRefresh]);

  const handleBookmarkClick = async (viewId: string) => {
    const member = globalData?.members.find(
      (m) => m.id === authService.getCreatorId()
    );
    const found = bookmarkViews.find((v) => v.id === viewId);
    let tmpViews = [...bookmarkViews];
    if (!found) {
      tmpViews.push({
        id: viewId,
        name: views.find((v) => v.id === viewId)?.name || '',
      });
    } else {
      tmpViews = tmpViews.filter((v) => v.id !== viewId);
    }
    const profile = {
      ...member?.profile,
      views: tmpViews,
    };
    if (member) {
      try {
        await updateUserProfile(member.id, profile);
        toast({
          title: 'View bookmarked',
          status: 'success',
          duration: 2000,
        });
        await refreshGlobalData();
        setForcedRefresh(foredRefresh + 1);
      } catch (error) {
        toast({
          title: 'Failed to bookmark view',
          status: 'error',
          duration: 2000,
        });
      }
    }
  };

  const handleDeleteView = async (viewId: string) => {
    try {
      await deleteCreatorList(viewId);
      toast({
        title: 'View deleted',
        status: 'success',
        duration: 2000,
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to delete view',
        status: 'error',
        duration: 2000,
      });
    } finally {
      setForcedRefresh(foredRefresh + 1);
    }
  };

  return (
    <Box>
      <HStack justify='space-between' mb={6}>
        <Heading as='h1' size='xl' color='var(--color-primary)'>
          My Views
        </Heading>
        <Button
          colorScheme='blue'
          bg='var(--color-primary)'
          onClick={() => history.push('/settings/templates')}
          leftIcon={<FaPlus />}
        >
          From template
        </Button>
      </HStack>
      <VStack spacing={4} align='stretch'>
        {!views || views.length === 0 ? (
          <Alert status='info' my={2}>
            <AlertIcon />
            No view found, add more views{' '}
            <Text
              onClick={() => history.push('/settings/templates')}
              mx={1}
              textDecoration={'underline'}
              cursor={'pointer'}
            >
              here{' '}
            </Text>
          </Alert>
        ) : null}
        {views?.map((view) => (
          <Box key={view.id} p={4} bg='white' borderRadius='md' boxShadow='sm'>
            <HStack justify='space-between'>
              <VStack align='start' spacing={1}>
                <Link
                  as={RouterLink}
                  to={`/views/${view.id}`}
                  fontWeight='bold'
                  color='var(--color-primary)'
                >
                  {view.name}
                </Link>
                <Text fontSize='sm' color='gray.500'>
                  {view.description}
                </Text>
              </VStack>
              <HStack>
                <IconButton
                  icon={<FaBookmark />}
                  aria-label='Bookmark'
                  onClick={() => {
                    handleBookmarkClick(view.id);
                  }}
                  colorScheme={
                    bookmarkViews.findIndex((v) => v.id === view.id) > -1
                      ? 'blue'
                      : 'gray'
                  }
                />
                <IconButton
                  icon={<FaTrash />}
                  aria-label='Delete'
                  isDisabled={
                    bookmarkViews.findIndex((v) => v.id === view.id) > -1
                  }
                  colorScheme='red'
                  onClick={() => handleDeleteView(view.id)}
                />
              </HStack>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default ViewsPage;
