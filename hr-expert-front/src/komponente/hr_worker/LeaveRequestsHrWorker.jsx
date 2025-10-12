// src/components/LeaveRequestsHrWorker.jsx
import React, { useEffect, useState, memo } from 'react';
import {
  Box,
  Heading,
  Text,
  Badge,
  SimpleGrid,
  Button,
  Spinner,
  Flex,
  Stack,
  Avatar,
  useToast,
  HStack,
  Divider,
  Portal,
  useColorModeValue,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
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
          maxW="540px"
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
export default function LeaveRequestsHrWorker() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // Selected request & pending action for confirm modal
  const [selected, setSelected] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // 'approved' | 'rejected' | null

  // Modal booleans (explicit to avoid flicker)
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const toast = useToast();

  // Load all leave requests
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res  = await api.get('/leave-requests');
        const list = Array.isArray(res.data) ? res.data : res.data.data || [];
        setRequests(list);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Update request status
  const applyStatus = async (id, status) => {
    try {
      await api.patch(`/leave-requests/${id}/status`, { status });
      setRequests(rs => rs.map(r => (r.id === id ? { ...r, status } : r)));
      toast({
        title: `Request ${status === 'approved' ? 'approved' : 'rejected'}.`,
        status: status === 'approved' ? 'success' : 'error',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error updating status.',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Open modals
  const openDetails = (req) => {
    setSelected(req);
    setShowDetailsModal(true);
  };
  const openConfirm = (req, action) => {
    setSelected(req);
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  // Close modals
  const closeDetails = () => {
    setShowDetailsModal(false);
    setSelected(null);
  };
  const closeConfirm = () => {
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const confirmAction = async () => {
    if (selected && pendingAction) {
      await applyStatus(selected.id, pendingAction);
    }
    closeConfirm();
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh" bg={brandDark}>
        <Spinner size="xl" color={brandPrimary} />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={4} bg={brandWhite}>
        <Text color={brandPrimary}>Error: {error}</Text>
      </Box>
    );
  }

  return (
    <Box p={8} bg={brandDark} minH="100vh">
      <Heading as="h1" size="xl" mb={6} textAlign="center" color={brandWhite}>
        Leave Requests for You
      </Heading>

      <SimpleGrid columns={[1, null, 2, 3]} spacing="24px">
        {requests.length === 0 && (
          <Box
            p={6}
            borderWidth="2px"
            borderColor={brandPrimary}
            borderRadius="2xl"
            boxShadow="xl"
            gridColumn="1 / -1"
            bg={brandWhite}
          >
            <Text
              fontSize="lg"
              fontWeight="bold"
              textAlign="center"
              color={brandDark}
            >
              There are no pending leave requests for you...
            </Text>
          </Box>
        )}

        {requests.map(req => (
          <Box
            key={req.id}
            p={6}
            borderWidth="2px"
            borderColor={brandPrimary}
            borderRadius="2xl"
            boxShadow="xl"
            bg={brandWhite}
          >
            <Stack spacing={4}>
              <Flex align="center" justify="space-between">
                <Flex align="center">
                  <Avatar
                    size="md"
                    src={req.employee.image_url}
                    name={req.employee.name}
                    mr={4}
                    border={`2px solid ${brandPrimary}`}
                  />
                  <Box>
                    <Text fontWeight="bold" color={brandDark}>
                      {req.employee.name}
                    </Text>
                    <Text fontSize="sm" color={brandPrimary}>
                      #{req.id}
                    </Text>
                  </Box>
                </Flex>

                <Button
                  size="sm"
                  variant="outline"
                  borderColor={brandPrimary}
                  color={brandPrimary}
                  _hover={{ bg: hoverTint }}
                  onClick={() => openDetails(req)}
                >
                  Details
                </Button>
              </Flex>

              <Text color={brandDark}>
                {new Date(req.start_date).toLocaleDateString()} –{' '}
                {new Date(req.end_date).toLocaleDateString()}
              </Text>

              <Badge
                alignSelf="flex-start"
                bg={
                  req.status === 'approved'
                    ? brandPrimary
                    : req.status === 'rejected'
                    ? brandDark
                    : '#fce4e4'
                }
                color={req.status === 'pending' ? brandDark : brandWhite}
                px={3}
                py={1}
                borderRadius="md"
              >
                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
              </Badge>

              <Flex mt={2} direction="column" gap={2}>
                <Text fontSize="sm" color={brandDark} noOfLines={2}>
                  {req.reason || '—'}
                </Text>
              </Flex>

              <Flex mt={4} justify="flex-end" wrap="wrap">
                {req.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      bg={brandPrimary}
                      color={brandWhite}
                      _hover={{ bg: '#d95959' }}
                      mr={2}
                      onClick={() => openConfirm(req, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      bg={brandDark}
                      color={brandWhite}
                      _hover={{ bg: '#1b1c1e' }}
                      onClick={() => openConfirm(req, 'rejected')}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </Flex>
            </Stack>
          </Box>
        ))}
      </SimpleGrid>

      {/* ====== DETAILS MODAL (CustomModal) ====== */}
      <CustomModal
        isOpen={showDetailsModal}
        onClose={closeDetails}
        title={selected ? `Request #${selected.id} Details` : 'Request Details'}
        footer={
          <HStack justify="flex-end">
            <Button
              variant="outline"
              borderColor={brandPrimary}
              color={brandPrimary}
              _hover={{ bg: hoverTint }}
              mr={3}
              onClick={closeDetails}
            >
              Close
            </Button>

            {selected?.status === 'pending' && (
              <>
                <Button
                  bg={brandPrimary}
                  color={brandWhite}
                  _hover={{ bg: '#d95959' }}
                  mr={2}
                  onClick={() => openConfirm(selected, 'approved')}
                >
                  Approve
                </Button>
                <Button
                  bg={brandDark}
                  color={brandWhite}
                  _hover={{ bg: '#1b1c1e' }}
                  onClick={() => openConfirm(selected, 'rejected')}
                >
                  Reject
                </Button>
              </>
            )}
          </HStack>
        }
      >
        {selected ? (
          <Stack spacing={3}>
            <Flex align="center">
              <Avatar
                size="md"
                src={selected.employee?.image_url}
                name={selected.employee?.name}
                mr={3}
                border={`2px solid ${brandPrimary}`}
              />
              <Box>
                <Text fontWeight="bold" color={brandDark}>
                  {selected.employee?.name}
                </Text>
                <Text fontSize="sm" color={brandPrimary}>
                  {selected.employee?.email}
                </Text>
              </Box>
            </Flex>

            <Divider borderColor={borderTint} />

            <Box>
              <Text fontWeight="bold" color={brandDark}>Dates:</Text>
              <Text color={brandDark}>
                {new Date(selected.start_date).toLocaleDateString()} — {new Date(selected.end_date).toLocaleDateString()}
              </Text>
            </Box>

            <Box>
              <Text fontWeight="bold" color={brandDark}>Status:</Text>
              <Badge
                mt={1}
                bg={
                  selected.status === 'approved'
                    ? brandPrimary
                    : selected.status === 'rejected'
                    ? brandDark
                    : '#fce4e4'
                }
                color={selected.status === 'pending' ? brandDark : brandWhite}
                px={3}
                py={1}
                borderRadius="md"
              >
                {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
              </Badge>
            </Box>

            {selected.hr_worker && (
              <>
                <Divider borderColor={borderTint} />
                <Box>
                  <Text fontWeight="bold" color={brandDark}>Assigned HR:</Text>
                  <Flex align="center" mt={1}>
                    <Avatar
                      size="sm"
                      src={selected.hr_worker.image_url}
                      name={selected.hr_worker.name}
                      mr={2}
                      border={`1px solid ${brandPrimary}`}
                    />
                    <Text color={brandDark}>{selected.hr_worker.name}</Text>
                  </Flex>
                </Box>
              </>
            )}

            <Divider borderColor={borderTint} />

            <Box>
              <Text fontWeight="bold" color={brandDark}>Reason:</Text>
              <Text color={brandDark} whiteSpace="pre-wrap">
                {selected.reason || '—'}
              </Text>
            </Box>
          </Stack>
        ) : (
          <Text color={brandDark}>No request selected.</Text>
        )}
      </CustomModal>

      {/* ====== CONFIRMATION MODAL (CustomModal) ====== */}
      <CustomModal
        isOpen={showConfirmModal}
        onClose={closeConfirm}
        title="Confirm Action"
        footer={
          <HStack justify="flex-end">
            <Button
              variant="outline"
              borderColor={brandPrimary}
              color={brandPrimary}
              _hover={{ bg: hoverTint }}
              mr={3}
              onClick={closeConfirm}
            >
              Cancel
            </Button>
            <Button
              bg={pendingAction === 'approved' ? brandPrimary : brandDark}
              color={brandWhite}
              _hover={{ bg: pendingAction === 'approved' ? '#d95959' : '#1b1c1e' }}
              onClick={confirmAction}
              isDisabled={!selected || !pendingAction}
            >
              {pendingAction === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </HStack>
        }
      >
        <Text color={brandDark}>
          {pendingAction === 'approved'
            ? 'Are you sure you want to approve this request?'
            : 'Are you sure you want to reject this request?'}
        </Text>
      </CustomModal>
    </Box>
  );
}
