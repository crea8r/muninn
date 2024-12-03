import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Icon,
  Flex,
  Link,
  IconButton,
  useMediaQuery,
  Badge,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiList,
  FiFolder,
  FiSettings,
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiCheckSquare,
} from 'react-icons/fi';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import authService from 'src/services/authService';
import { FaFilter, FaIdCard, FaRobot, FaShare, FaTag } from 'react-icons/fa';

interface SidebarItemProps {
  icon: React.ElementType;
  text: string;
  to: string;
  isActive: boolean;
  isCollapsed: boolean;
  badge?: number;
  subItems?: { text: string; to: string; icon?: React.ElementType }[];
  location: any;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  text,
  to,
  isActive,
  isCollapsed,
  badge,
  subItems,
  location,
}) => (
  <Box width='100%'>
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
        bg={isActive && !subItems ? 'blue.100' : 'transparent'}
        color={isActive ? 'blue.700' : 'inherit'}
        _hover={{ bg: 'gray.100' }}
        justify={isCollapsed ? 'center' : 'flex-start'}
      >
        <Icon as={icon} mr={isCollapsed ? 0 : 3} />
        {!isCollapsed && (
          <>
            <Text fontWeight={isActive ? 'bold' : 'normal'}>{text}</Text>
            {badge !== undefined && (
              <Badge ml={2} colorScheme='red' borderRadius='full'>
                {badge}
              </Badge>
            )}
          </>
        )}
      </Flex>
    </Link>
    {!isCollapsed && subItems && (
      <VStack align='stretch' ml={6} mt={1} spacing={1}>
        {subItems.map((subItem) => (
          <Link
            key={subItem.to}
            as={RouterLink}
            to={subItem.to}
            textDecoration='none'
            _hover={{ textDecoration: 'none' }}
          >
            <Flex
              alignItems={'center'}
              gap={2}
              width={'100%'}
              p={2}
              borderRadius='md'
              bg={
                isActive && location.pathname === subItem.to
                  ? 'blue.100'
                  : 'transparent'
              }
              color={
                isActive && location.pathname === subItem.to
                  ? 'blue.700'
                  : 'inherit'
              }
              _hover={{ bg: 'gray.100' }}
            >
              {subItem.icon && <Icon as={subItem.icon} />}
              <Text fontSize='sm'>{subItem.text}</Text>
            </Flex>
          </Link>
        ))}
      </VStack>
    )}
  </Box>
);

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [unseenFeedCount, setUnseenFeedCount] = useState(0);
  const [todoTaskCount, setTodoTaskCount] = useState(0);
  const { globalData } = useGlobalContext();
  const member = globalData?.memberData?.members.find(
    (m) => m.id === authService.getCreatorId()
  );

  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    const fetchCounts = async () => {
      const feedCount = globalData?.summaryData?.unseenFeedsCount || 0;
      const taskCount = globalData?.summaryData?.tasksCount || 0;
      setUnseenFeedCount(feedCount);
      setTodoTaskCount(taskCount);
    };
    fetchCounts();
  }, [globalData]);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const sidebarWidth = isCollapsed ? '60px' : '250px';

  const settingsSubItems = [
    { text: 'Data Types', to: '/settings/data-types', icon: FaIdCard },
    { text: 'Funnels', to: '/settings/funnels', icon: FaFilter },
    { text: 'Tags', to: '/settings/tags', icon: FaTag },
    { text: 'Templates', to: '/settings/templates', icon: FaShare },
    { text: 'Automations', to: '/settings/automations', icon: FaRobot },
  ];

  const sidebarViews =
    member?.profile.views?.map((v: any) => {
      return { text: v.name, to: '/views/' + v.id };
    }) || [];

  return (
    <>
      {isMobile && !isOpen && (
        <IconButton
          aria-label='Open sidebar'
          icon={<FiMenu />}
          position='fixed'
          left={2}
          top={2}
          zIndex={2}
          onClick={toggleSidebar}
        />
      )}
      <Box
        as='nav'
        w={sidebarWidth}
        h='calc(100vh - 72px)'
        bg='white'
        boxShadow='sm'
        position={isMobile ? 'fixed' : 'relative'}
        left={isMobile && !isOpen ? `-${sidebarWidth}` : '0'}
        transition='left 0.3s, width 0.3s'
        zIndex={1}
      >
        <Box position='relative' h='100%'>
          <IconButton
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            onClick={toggleSidebar}
            position='absolute'
            right={isCollapsed ? '50%' : '-20px'}
            top='10px'
            transform={isCollapsed ? 'translateX(50%)' : 'none'}
            zIndex={3}
            bg='white'
            boxShadow='sm'
          />
          <VStack align='stretch' spacing={0} pt={10}>
            <SidebarItem
              icon={FiHome}
              text='Feed'
              to='/feed'
              isActive={isActive('/feed')}
              isCollapsed={isCollapsed}
              badge={unseenFeedCount}
              location={location}
            />
            <SidebarItem
              icon={FiCheckSquare}
              text='Tasks'
              to='/tasks'
              isActive={isActive('/tasks')}
              isCollapsed={isCollapsed}
              badge={todoTaskCount}
              location={location}
            />
            <SidebarItem
              icon={FiList}
              text='My Views'
              to='/views'
              isActive={isActive('/views')}
              isCollapsed={isCollapsed}
              location={location}
              subItems={sidebarViews}
            />
            <SidebarItem
              icon={FiFolder}
              text='Everything'
              to='/objects'
              isActive={isActive('/objects')}
              isCollapsed={isCollapsed}
              location={location}
            />
            <SidebarItem
              icon={FiSettings}
              text='Settings'
              to='/settings'
              isActive={isActive('/settings')}
              isCollapsed={isCollapsed}
              subItems={settingsSubItems}
              location={location}
            />
          </VStack>
        </Box>
      </Box>
    </>
  );
};

export default Sidebar;
