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
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useHistory } from 'react-router-dom';

const Header: React.FC = () => {
  const history = useHistory();
  return (
    <Box as='header' bg='white' boxShadow='sm' py={4}>
      <Flex
        maxW='container.xl'
        mx='auto'
        alignItems='center'
        justifyContent='space-between'
      >
        <Box w='250px'>
          {/* Logo */}
          <Box as='span' fontWeight='bold' fontSize='xl'>
            Muninn
          </Box>
        </Box>
        <Flex alignItems='center' flex={1}>
          <InputGroup maxW='500px' mx='auto'>
            <InputLeftElement pointerEvents='none'>
              <SearchIcon color='gray.300' />
            </InputLeftElement>
            <Input placeholder='Search...' />
          </InputGroup>
        </Flex>
        <Menu>
          <MenuButton>
            <Avatar size='sm' />
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => history.push('/account')}>
              Account
            </MenuItem>
            <MenuItem onClick={() => history.push('/organisation')}>
              Organisation
            </MenuItem>
            <MenuItem>Log out</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
};

export default Header;
