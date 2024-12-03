import React, { useState } from 'react';
import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  useDisclosure,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, AttachmentIcon } from '@chakra-ui/icons';
import { useHistory } from 'react-router-dom';
import authService from 'src/services/authService';
import { useSpotLight } from 'src/contexts/SpotLightContext';
import { SpotLightFilter } from '../spot-light/SpotLight';
import { shortenText } from 'src/utils';
import ImporterDialog from 'src/features/importer-dialog/index';
import ObjectForm from 'src/components/forms/object/ObjectForm';
import { createObject } from 'src/api/object';
import { NewObject } from 'src/types';

const Header: React.FC = () => {
  const history = useHistory();
  const details = authService.getDetails();
  const { openSpotLight } = useSpotLight();
  const {
    isOpen: isImportOpen,
    onOpen: onImportOpen,
    onClose: onImportClose,
  } = useDisclosure();
  const [isCreatingObject, setIsCreatingObject] = useState(false);
  const toast = useToast();

  const handleLogout = () => {
    authService.logout();
    history.push('/');
  };

  const handleObjectClick = (params: any) => {
    if (params.type === SpotLightFilter.OBJECT) {
      history.push('/objects/' + params.payload.id);
    }
  };

  const handleOpenSearch = () => {
    openSpotLight(
      [
        SpotLightFilter.OBJECT,
        SpotLightFilter.FACT,
        SpotLightFilter.CREATOR,
        SpotLightFilter.TASK,
      ],
      () => handleObjectClick
    );
  };

  const handleAddNewObject = async (data: NewObject) => {
    try {
      const newObject = await createObject(data);
      history.push('/objects/' + newObject.id);
    } catch (e) {
      toast({
        title: 'Error creating object',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const name = details?.profile?.fullname
    ? details?.profile?.fullname
    : details?.name;

  return (
    <Box as='header' bg='white' boxShadow='sm' py={2}>
      <Flex mx='auto' alignItems='center' justifyContent='space-between'>
        {/* Left section - Logo and Org name */}
        <HStack w={{ base: '200px', md: '250px' }} paddingLeft={2}>
          <Box as='span' fontWeight='bold' fontSize='xl' ml={8}>
            {shortenText(details?.orgName || 'Muninn', 20)}
          </Box>
        </HStack>

        {/* Center section - Search and action buttons */}
        <Flex
          alignItems='center'
          flex={1}
          justifyContent='center'
          gap={1}
          maxW='800px'
        >
          <InputGroup maxW='500px'>
            <InputLeftElement height={'32px'}>
              <SearchIcon color='gray.300' fontSize={'16px'} />
            </InputLeftElement>
            <Input
              placeholder='Search...'
              width={'100%'}
              size={'sm'}
              value={''}
              onChange={() => {
                handleOpenSearch();
              }}
              onClick={handleOpenSearch}
            />
          </InputGroup>

          <IconButton
            size='sm'
            aria-label='Create new object'
            title='Create new object'
            icon={<AddIcon />}
            variant={'subtle'}
            onClick={() => setIsCreatingObject(true)}
          />

          <IconButton
            aria-label='Import CSV'
            title='Import CSV'
            size='sm'
            icon={<AttachmentIcon />}
            variant={'subtle'}
            onClick={onImportOpen}
          />
        </Flex>

        {/* Right section - User menu */}
        <Menu>
          <MenuButton paddingRight='16px'>
            <Avatar size='sm' title={name} />
          </MenuButton>
          <MenuList>
            <Box pl={3} pb={1} borderBottom={'1px solid #ccc'}>
              {name}
            </Box>
            <MenuItem onClick={() => history.push('/account')}>
              Account
            </MenuItem>
            {details?.role === 'admin' && (
              <MenuItem onClick={() => history.push('/organisation')}>
                Organisation
              </MenuItem>
            )}
            <MenuItem onClick={handleLogout}>Log out</MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      {/* Modals */}
      <ImporterDialog isOpen={isImportOpen} onClose={onImportClose} />

      <ObjectForm
        isOpen={isCreatingObject}
        onClose={() => setIsCreatingObject(false)}
        onCreateObject={handleAddNewObject}
      />
    </Box>
  );
};

export default Header;
