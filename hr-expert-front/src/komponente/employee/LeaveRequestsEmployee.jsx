// src/components/LeaveRequestsEmployee.jsx
import React, { useEffect, useState, useMemo, memo } from 'react';
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
  useToast,
  Select,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Portal,
  useColorModeValue,
} from '@chakra-ui/react';
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
        <Box position="absolute" inset="0" bg={overlayBg} onClick={onClose} />

        {/* Modal */}
        <Box
          position="relative"
          bg={modalBg}
          borderRadius="lg"
          shadow="2xl"
          maxW="560px"
          w="90%"
          maxH="90vh"
          overflow="auto"
          zIndex="10000"
          border={`1px solid ${borderTint}`}
        >
          {/* Header */}
          <HStack justify="space-between" p={4} borderBottom="1px" borderColor={borderTint}>
            <Heading size="md" color={brandDark}>
              {title}
            </Heading>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Close"
              onClick={onClose}
              color={brandPrimary}
              _hover={{ bg: hoverTint }}
            >
              ✕
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
export default function LeaveRequestsEmployee() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [current, setCurrent] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hrWorkerName, setHrWorkerName] = useState('');
  const toast = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/leave-requests');
        const list = Array.isArray(res.data) ? res.data : res.data.data || [];
        setRequests(list);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (filterStatus === 'all') return requests;
    return requests.filter(r => r.status === filterStatus);
  }, [requests, filterStatus]);

  const handleDelete = async id => {
    try {
      await api.delete(`/leave-requests/${id}`);
      setRequests(r => r.filter(x => x.id !== id));
      toast({ title: 'Request deleted.', status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      toast({
        title: 'Error deleting request.',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openNew = () => {
    setStartDate('');
    setEndDate('');
    setHrWorkerName('');
    setIsNewOpen(true);
  };

  const handleNewSubmit = async () => {
    if (!startDate || !endDate) {
      toast({ title: 'Enter both dates.', status: 'warning', duration: 2000, isClosable: true });
      return;
    }
    try {
      const payload = { start_date: startDate, end_date: endDate };
      if (hrWorkerName) payload.hr_worker_name = hrWorkerName;
      const res = await api.post('/leave-requests', payload);
      const created = res.data.data || res.data;
      setRequests(r => [created, ...r]);
      toast({ title: 'Request created.', status: 'success', duration: 3000, isClosable: true });
      setIsNewOpen(false);
    } catch (err) {
      toast({
        title: 'Error creating request.',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openEdit = req => {
    setCurrent(req);
    setStartDate(req.start_date);
    setEndDate(req.end_date);
    setHrWorkerName('');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!startDate || !endDate) {
      toast({ title: 'Enter both dates.', status: 'warning', duration: 2000, isClosable: true });
      return;
    }
    try {
      const payload = { start_date: startDate, end_date: endDate };
      const res = await api.put(`/leave-requests/${current.id}`, payload);
      const updated = res.data.data || res.data;
      setRequests(r => r.map(x => (x.id === updated.id ? updated : x)));
      toast({ title: 'Request updated.', status: 'success', duration: 3000, isClosable: true });
      setIsEditOpen(false);
    } catch (err) {
      toast({
        title: 'Error updating request.',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
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
    <Box p={8} bg={brandWhite} color={brandDark} minH="100vh">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="xl" color={brandPrimary}>
          Leave Requests
        </Heading>
        <HStack spacing={3}>
          <Select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            w="160px"
            borderColor={brandPrimary}
            focusBorderColor={brandPrimary}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>
          <Button bg={brandPrimary} color={brandWhite} _hover={{ bg: '#d95959' }} onClick={openNew}>
            New Leave Request
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={[1, null, 2, 3]} spacing="24px">
        {filtered.length === 0 && (
          <Box
            p={6}
            borderWidth="2px"
            borderColor={brandPrimary}
            borderRadius="2xl"
            boxShadow="xl"
            gridColumn="1 / -1"
            bg={brandWhite}
          >
            <Text fontSize="lg" fontWeight="bold" textAlign="center" color={brandDark}>
              You have no leave requests{' '}
              {filterStatus !== 'all' && `with status "${filterStatus}"`}.
            </Text>
          </Box>
        )}

        {filtered.map(req => (
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
              <Text fontWeight="bold">{req.employee.name}</Text>

              <Text>
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

              {req.hr_worker && (
                <Text fontSize="sm">HR: {req.hr_worker.name}</Text>
              )}

              <Flex mt={4} justify="flex-end">
                {req.status === 'pending' && (
                  <Button
                    size="sm"
                    mr={2}
                    border={`1px solid ${brandPrimary}`}
                    color={brandPrimary}
                    bg="transparent"
                    _hover={{ bg: hoverTint }}
                    onClick={() => openEdit(req)}
                  >
                    Update
                  </Button>
                )}
                <Button
                  size="sm"
                  bg={brandDark}
                  color={brandWhite}
                  _hover={{ bg: '#1b1c1e' }}
                  onClick={() => handleDelete(req.id)}
                >
                  Delete
                </Button>
              </Flex>
            </Stack>
          </Box>
        ))}
      </SimpleGrid>

      {/* New Request Modal (Custom) */}
      <CustomModal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        title="Create a New Leave Request"
        footer={
          <HStack justify="flex-end">
            <Button
              variant="outline"
              borderColor={brandPrimary}
              color={brandPrimary}
              mr={3}
              _hover={{ bg: hoverTint }}
              onClick={() => setIsNewOpen(false)}
            >
              Cancel
            </Button>
            <Button
              bg={brandPrimary}
              color={brandWhite}
              _hover={{ bg: '#d95959' }}
              onClick={handleNewSubmit}
            >
              Create
            </Button>
          </HStack>
        }
      >
        <FormControl mb={3}>
          <FormLabel color={brandDark}>Start Date</FormLabel>
          <Input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            focusBorderColor={brandPrimary}
          />
        </FormControl>
        <FormControl mb={3}>
          <FormLabel color={brandDark}>End Date</FormLabel>
          <Input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            focusBorderColor={brandPrimary}
          />
        </FormControl>
        <FormControl>
          <FormLabel color={brandDark}>HR Worker Name (optional)</FormLabel>
          <Input
            placeholder="Exact HR user name"
            value={hrWorkerName}
            onChange={e => setHrWorkerName(e.target.value)}
            focusBorderColor={brandPrimary}
          />
        </FormControl>
      </CustomModal>

      {/* Edit Request Modal (Custom) */}
      <CustomModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={current ? `Update Request #${current.id}` : 'Update Request'}
        footer={
          <HStack justify="flex-end">
            <Button
              variant="outline"
              borderColor={brandPrimary}
              color={brandPrimary}
              mr={3}
              _hover={{ bg: hoverTint }}
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              bg={brandPrimary}
              color={brandWhite}
              _hover={{ bg: '#d95959' }}
              onClick={handleEditSubmit}
            >
              Save
            </Button>
          </HStack>
        }
      >
        <FormControl mb={3}>
          <FormLabel color={brandDark}>Start Date</FormLabel>
          <Input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            focusBorderColor={brandPrimary}
          />
        </FormControl>
        <FormControl mb={3}>
          <FormLabel color={brandDark}>End Date</FormLabel>
          <Input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            focusBorderColor={brandPrimary}
          />
        </FormControl>
      </CustomModal>
    </Box>
  );
}
