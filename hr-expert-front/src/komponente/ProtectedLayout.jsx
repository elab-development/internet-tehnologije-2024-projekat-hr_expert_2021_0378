import { Box, Flex } from '@chakra-ui/react';
import SideMenu from './SideMenu';
import Breadcrumbs from './Breadcrumbs';
import { Outlet } from 'react-router-dom';

export default function ProtectedLayout() {
  return (
    <Flex>
      <SideMenu />
      <Box flex="1" ml="60px">
        <Breadcrumbs />
        <Outlet />
      </Box>
    </Flex>
  );
}
