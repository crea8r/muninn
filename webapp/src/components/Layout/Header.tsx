import React from 'react';
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
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useHistory } from 'react-router-dom';
import authService from 'src/services/authService';
// import logo.png from src/assets/logo.png;
import logo from 'src/assets/logo.png';
import { useSpotLight } from 'src/contexts/SpotLightContext';
import { SpotLightFilter } from '../SpotLight';

const Header: React.FC = () => {
  const history = useHistory();
  const details = authService.getDetails();
  const { openSpotLight } = useSpotLight();

  const handleLogout = () => {
    authService.logout();
    history.push('/');
  };
  const handleOpenSearch = () => {
    openSpotLight(
      [
        SpotLightFilter.OBJECT,
        SpotLightFilter.FACT,
        SpotLightFilter.CREATOR,
        SpotLightFilter.TASK,
      ],
      (payload: any) => {
        console.log('Selected', payload);
      }
    );
  };
  return (
    <Box as='header' bg='white' boxShadow='sm' py={4}>
      <Flex
        // maxW='container.xl'
        mx='auto'
        alignItems='center'
        justifyContent='space-between'
      >
        <HStack w='250px' paddingLeft='8px'>
          <img
            src={logo}
            alt='Muninn'
            style={{ width: '24px', height: '24px' }}
          />
          <Box as='span' fontWeight='bold' fontSize='xl'>
            Muninn
          </Box>
        </HStack>
        <Flex alignItems='center' flex={1}>
          <InputGroup maxW='500px' mx='auto' onClick={handleOpenSearch}>
            <InputLeftElement pointerEvents='none'>
              <SearchIcon color='gray.300' />
            </InputLeftElement>
            <Input placeholder='Search...' />
          </InputGroup>
        </Flex>
        <Menu>
          <MenuButton paddingRight='16px'>
            <Avatar size='sm' />
          </MenuButton>
          <MenuList>
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
    </Box>
  );
};

export default Header;
