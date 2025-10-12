import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { Link, useLocation } from 'react-router-dom';

const LABELS = {
  'leave-requests':        'Leave Requests',
  'performance-reviews':   'Performance Reviews',
  'performance-reviews-hr':'Performance Reviews',
  'leave-requests-hr':     'Leave Requests',
  'world-map':             'Our Locations',
  'view-users':            'Users',
};

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);

  const brandPrimary = '#F06A6A';
  const brandDark = '#0D0E10';
  const brandWhite = '#FFFFFF';

  const isAdminHome = pathname.startsWith('/admin-dashboard');
  const homePath    = isAdminHome ? '/admin-dashboard' : '/home';
  const homeLabel   = isAdminHome ? 'Admin Dashboard' : 'Home';

  if (
    parts.length === 0 ||
    parts[0] === 'register' ||
    pathname === '/home' ||
    pathname === '/admin-dashboard'
  ) {
    return null;
  }

  return (
    <Box
      bg={brandWhite}
      px={{ base: 4, md: 8 }}
      py={2}
      boxShadow="sm"
      mb={4}
      borderBottom={`2px solid ${brandPrimary}`}
    >
      <Breadcrumb
        spacing="8px"
        separator={<Icon as={ChevronRightIcon} color={brandPrimary} />}
        fontSize="sm"
      >
        {/* First crumb */}
        <BreadcrumbItem>
          <BreadcrumbLink
            as={Link}
            to={homePath}
            color={brandPrimary}
            fontWeight="semibold"
            _hover={{ color: '#d95959' }}
          >
            {homeLabel}
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Remaining crumbs */}
        {parts.map((segment, idx) => {
          const to     = '/' + parts.slice(0, idx + 1).join('/');
          const isLast = idx === parts.length - 1;
          const label  = LABELS[segment] || segment;

          return (
            <BreadcrumbItem key={to} isCurrentPage={isLast}>
              {isLast ? (
                <BreadcrumbLink color={brandDark} fontWeight="bold">
                  {label}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbLink
                  as={Link}
                  to={to}
                  color={brandDark}
                  _hover={{ color: brandPrimary }}
                >
                  {label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
    </Box>
  );
}
