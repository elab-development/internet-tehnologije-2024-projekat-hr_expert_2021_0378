// src/components/employee/PerformanceReviewsEmployee.jsx
import { useState, useEffect, memo } from 'react';
import {
  Box,
  Heading,
  Spinner,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stack,
  Divider,
  Portal,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { ViewIcon, DownloadIcon, CloseIcon } from '@chakra-ui/icons';
import api from '../../util/api';

/* =========================
   Brand colors / helpers
   ========================= */
const brandPrimary = '#F06A6A';
const brandDark = '#0D0E10';
const brandWhite = '#FFFFFF';
const hoverTint = 'rgba(240,106,106,0.08)';
const borderTint = '#F06A6A33';

/* =========================
   CustomModal (memoized)
   ========================= */
const CustomModal = memo(({ isOpen, onClose, title, children, footer }) => {
  const modalBg = useColorModeValue(brandWhite, brandDark);
  const overlayBg = useColorModeValue('blackAlpha.600', 'blackAlpha.700');

  if (!isOpen) return null;

  return (
    <Portal>
      <Box
        position="fixed"
        inset="0"
        zIndex="9999"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {/* Overlay */}
        <Box
          position="absolute"
          inset="0"
          bg={overlayBg}
          onClick={onClose}
        />
        {/* Modal */}
        <Box
          position="relative"
          bg={modalBg}
          borderRadius="lg"
          shadow="2xl"
          maxW="640px"
          w="90%"
          maxH="90vh"
          overflow="auto"
          zIndex="10000"
          border={`1px solid ${borderTint}`}
        >
          {/* Header */}
          <HStack justify="space-between" p={4} borderBottom="1px" borderColor={borderTint}>
            <Heading size="md" color={brandDark}>{title}</Heading>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              aria-label="Close"
              color={brandPrimary}
              _hover={{ bg: hoverTint }}
            >
              <CloseIcon />
            </Button>
          </HStack>

          {/* Body */}
          <Box p={4}>{children}</Box>

          {/* Footer */}
          {footer && (
            <Box p={4} borderTop="1px" borderColor={borderTint}>
              {footer}
            </Box>
          )}
        </Box>
      </Box>
    </Portal>
  );
});
CustomModal.displayName = 'CustomModal';

/* =========================
   Component
   ========================= */
export default function PerformanceReviewsEmployee() {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    api.get('/performance-reviews', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const list = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];
      setReviews(list);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const openDetails = r => {
    setSelected(r);
    setIsOpen(true);
  };

  const closeDetails = () => setIsOpen(false);

  const exportPDF = id => {
    const token = sessionStorage.getItem('token');
    api.get(`/performance-reviews/${id}/export-pdf`, {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(({ data, headers }) => {
      const blob = new Blob([data], { type: headers['content-type'] });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `performance_review_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    })
    .catch(console.error);
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10} bg={brandWhite}>
        <Spinner size="xl" color={brandPrimary} />
      </Box>
    );
  }

  if (reviews.length === 0) {
    return (
      <Box
        bg={brandWhite}
        shadow="md"
        rounded="xl"
        p={6}
        textAlign="center"
        border={`2px solid ${brandPrimary}`}
      >
        <Heading size="lg" color={brandPrimary} mb={4}>
          My Performance Reviews
        </Heading>
        <Text color={brandDark}>You don’t have any performance reviews for now.</Text>
      </Box>
    );
  }

  return (
    <Box
      bg={brandWhite}
      shadow="md"
      rounded="xl"
      p={6}
      border={`2px solid ${brandPrimary}`}
    >
      <Heading mb={4} size="lg" color={brandPrimary}>
        My Performance Reviews
      </Heading>
      <Table variant="simple">
        <Thead bg={brandPrimary}>
          <Tr>
            <Th color={brandWhite}>ID</Th>
            <Th color={brandWhite}>Reviewer</Th>
            <Th color={brandWhite}>Department</Th>
            <Th color={brandWhite}>Score</Th>
            <Th color={brandWhite}>Created At</Th>
            <Th color={brandWhite} textAlign="center">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {reviews.map(r => (
            <Tr key={r.id} _hover={{ bg: '#fde3e3' }}>
              <Td>{r.id}</Td>
              <Td>{r.reviewer.name}</Td>
              <Td>{r.reviewer.department}</Td>
              <Td>{r.score} / 5</Td>
              <Td>{new Date(r.created_at).toLocaleDateString()}</Td>
              <Td textAlign="center">
                <Button
                  size="sm"
                  leftIcon={<ViewIcon />}
                  border={`1px solid ${brandPrimary}`}
                  color={brandPrimary}
                  bg="transparent"
                  _hover={{ bg: hoverTint }}
                  mr={2}
                  onClick={() => openDetails(r)}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  leftIcon={<DownloadIcon />}
                  bg={brandPrimary}
                  color={brandWhite}
                  _hover={{ bg: '#d95959' }}
                  onClick={() => exportPDF(r.id)}
                >
                  PDF
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Details Modal (Custom) */}
      <CustomModal
        isOpen={isOpen && !!selected}
        onClose={closeDetails}
        title={selected ? `Review #${selected.id} Details` : 'Review Details'}
        footer={
          <HStack justify="flex-end">
            <Button
              onClick={closeDetails}
              variant="outline"
              borderColor={brandPrimary}
              color={brandPrimary}
              mr={3}
              _hover={{ bg: hoverTint }}
            >
              Close
            </Button>
            {selected && (
              <Button
                leftIcon={<DownloadIcon />}
                bg={brandPrimary}
                color={brandWhite}
                _hover={{ bg: '#d95959' }}
                onClick={() => exportPDF(selected.id)}
              >
                Export PDF
              </Button>
            )}
          </HStack>
        }
      >
        {selected && (
          <Stack spacing={4}>
            <Box>
              <Text fontWeight="bold" color={brandDark}>Employee:</Text>
              <Text color={brandDark}>
                {selected.employee.name} — {selected.employee.department}
              </Text>
            </Box>
            <Divider borderColor={borderTint} />
            <Box>
              <Text fontWeight="bold" color={brandDark}>Reviewer:</Text>
              <Text color={brandDark}>
                {selected.reviewer.name} — {selected.reviewer.department}
              </Text>
            </Box>
            <Divider borderColor={borderTint} />
            <Box>
              <Text fontWeight="bold" color={brandDark}>Score:</Text>
              <Text color={brandDark}>{selected.score} / 5</Text>
            </Box>
            <Divider borderColor={borderTint} />
            <Box>
              <Text fontWeight="bold" color={brandDark}>Feedback:</Text>
              <Text whiteSpace="pre-wrap" color={brandDark}>
                {selected.feedback}
              </Text>
            </Box>
            <Divider borderColor={borderTint} />
            <Box>
              <Text fontSize="sm" color={brandPrimary}>
                Created at: {new Date(selected.created_at).toLocaleString()}
              </Text>
              <Text fontSize="sm" color={brandPrimary}>
                Updated at: {new Date(selected.updated_at).toLocaleString()}
              </Text>
            </Box>
          </Stack>
        )}
      </CustomModal>
    </Box>
  );
}
