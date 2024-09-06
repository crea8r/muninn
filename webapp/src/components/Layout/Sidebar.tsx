import React from 'react';
import { Box, VStack, Text, Icon, Flex, Link } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FiHome, FiList, FiFolder, FiSettings } from 'react-icons/fi';

interface SidebarItemProps {
  icon: React.ElementType;
  text: string;
  to: string;
  isActive: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  text,
  to,
  isActive,
}) => (
  <Link
    as={RouterLink}
    to={to}
    textDecoration='none'
    _hover={{ textDecoration: 'none' }}
    w='100%'
  >
    <Flex
      align='center'
      p={3}
      borderRadius='md'
      bg={isActive ? 'blue.100' : 'transparent'}
      color={isActive ? 'blue.700' : 'inherit'}
      _hover={{ bg: isActive ? 'blue.100' : 'gray.100' }}
    >
      <Icon as={icon} mr={3} />
      <Text fontWeight={isActive ? 'bold' : 'normal'}>{text}</Text>
    </Flex>
  </Link>
);

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Box as='nav' w='250px' h='calc(100vh - 72px)' bg='white' boxShadow='sm'>
      <VStack align='stretch' spacing={0} pt={4}>
        <SidebarItem
          icon={FiHome}
          text='Feed'
          to='/feed'
          isActive={isActive('/feed')}
        />
        <SidebarItem
          icon={FiList}
          text='Tasks'
          to='/tasks'
          isActive={isActive('/tasks')}
        />
        <SidebarItem
          icon={FiList}
          text='My Views'
          to='/views'
          isActive={isActive('/views')}
        />
        <SidebarItem
          icon={FiFolder}
          text='All Objects'
          to='/objects'
          isActive={isActive('/objects')}
        />
        <SidebarItem
          icon={FiSettings}
          text='Settings'
          to='/settings'
          isActive={isActive('/settings')}
        />
      </VStack>
    </Box>
  );
};

export default Sidebar;
