import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Icon,
  Button,
  Tooltip,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiHome,
  FiCalendar,
  FiBarChart2,
  FiUsers,
  FiLogOut,
} from 'react-icons/fi';
import { FaGlobeAmericas } from "react-icons/fa";
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../util/api';

export default function SideMenu() {
  const navigate = useNavigate();

  // Brand colors
  const brandPrimary = '#F06A6A';
  const brandDark = '#0D0E10';
  const brandWhite = '#FFFFFF';

  const bg       = useColorModeValue(brandDark, brandDark);
  const activeBg = useColorModeValue(brandPrimary, brandPrimary);
  const hoverBg  = useColorModeValue('#f59696', '#f59696');

  const [roleName, setRoleName] = useState('');

  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem('user') || '{}');
    const token  = sessionStorage.getItem('token');
    if (stored.role_id && token) {
      api.get(`/roles/${stored.role_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setRoleName(res.data.name))
      .catch(() => setRoleName(''));
    }
  }, []);

  let links = [];
  if (roleName === 'administrator') {
    links = [
      { label: 'Dashboard', icon: FiHome,    to: '/admin-dashboard' },
      { label: 'Users',     icon: FiUsers,   to: '/view-users'     },
      { label: 'Our Locations', icon: FaGlobeAmericas, to: '/world-map' },
    ];
  } else {
    const reviewsPath = roleName === 'hr_worker'
      ? '/performance-reviews-hr'
      : '/performance-reviews';
    const leaveRequestsPath = roleName === 'hr_worker'
      ? '/leave-requests-hr'
      : '/leave-requests';

    links = [
      { label: 'Home',               icon: FiHome,      to: '/home'               },
      { label: 'Leave Requests',     icon: FiCalendar,  to: leaveRequestsPath     },
      { label: 'Performance Reviews',icon: FiBarChart2, to: reviewsPath          },
    ];
  }

  const handleLogout = async () => {
    const token = sessionStorage.getItem('token');
    try {
      await api.post('/logout', null, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      sessionStorage.clear();
      delete api.defaults.headers.common['Authorization'];
      navigate('/');
    }
  };

  return (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      h="100vh"
      w="70px"
      bg={bg}
      boxShadow="md"
      display="flex"
      flexDir="column"
      justify="space-between"
      align="center"
      py={4}
    >
      <VStack spacing={6} flex="1">
        {links.map(({ label, icon, to }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              width: '100%',
              textAlign: 'center',
              background: isActive ? activeBg : 'transparent',
              borderRadius: 8,
            })}
          >
            {({ isActive }) => (
              <Tooltip label={label} placement="right" openDelay={300}>
                <HStack
                  justify="center"
                  p={3}
                  color={isActive ? brandWhite : brandPrimary}
                  _hover={{ bg: hoverBg, color: brandWhite }}
                  borderRadius="md"
                  transition="0.2s ease-in-out"
                >
                  <Icon as={icon} boxSize={6} />
                </HStack>
              </Tooltip>
            )}
          </NavLink>
        ))}
      </VStack>

      <Box>
        <Divider borderColor={brandPrimary} mb={4} />
        <Tooltip label="Logout" placement="right" openDelay={300}>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="lg"
            p={0}
            mb={2}
            _hover={{ bg: hoverBg, color: brandWhite }}
            color={brandPrimary}
          >
            <Icon as={FiLogOut} boxSize={6} />
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
}
