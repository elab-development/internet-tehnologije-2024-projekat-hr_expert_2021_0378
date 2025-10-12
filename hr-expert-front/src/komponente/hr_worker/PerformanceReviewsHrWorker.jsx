import { useState, useEffect, useRef, memo } from 'react';
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
  Select,
  Textarea,
  HStack,
  FormControl,
  FormLabel,
  useColorModeValue,
  Stack,
  Divider,
  Portal,
  VStack,
  Container,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  ViewIcon,
  DownloadIcon,
  EditIcon,
  AddIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import api from '../../util/api';

// Brand colors
const brandPrimary = '#F06A6A';
const brandDark = '#0D0E10';
const brandWhite = '#FFFFFF';
const hoverTint = 'rgba(240,106,106,0.08)'; // subtle primary tint for hovers
const borderTint = '#F06A6A33'; // ~20% alpha for borders/dividers

// Move CustomModal outside and memoize it to prevent recreating
const CustomModal = memo(({ isOpen, onClose, title, children, footer }) => {
  const modalBg = useColorModeValue(brandWhite, brandDark);
  const overlayBg = useColorModeValue('blackAlpha.600', 'blackAlpha.700');
  
  if (!isOpen) return null;
  
  return (
    <Portal>
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex="9999"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {/* Overlay */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg={overlayBg}
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <Box
          position="relative"
          bg={modalBg}
          borderRadius="lg"
          shadow="2xl"
          maxW="500px"
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
          <Box p={4}>
            {children}
          </Box>
          
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

export default function PerformanceReviewsHrWorker() {
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  
  // Modal states - explicit boolean states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const bg = useColorModeValue(brandWhite, brandDark);

  // form state
  const [createForm, setCreateForm] = useState({
    employee_id: '',
    score: 0,
    feedback: '',
  });
  const [editForm, setEditForm] = useState({
    score: 0,
    feedback: '',
  });

  // fetch reviews, users, roles
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    Promise.all([
      api.get('/performance-reviews', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      api.get('/users', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      api.get('/roles', {
        headers: { Authorization: `Bearer ${token}` }
      }),
    ])
    .then(([rRes, uRes, roRes]) => {
      const list = Array.isArray(rRes.data)
        ? rRes.data
        : (rRes.data.data || []);
      setReviews(list);
      setUsers(uRes.data);
      setRoles(roRes.data);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  // helper: list of employees
  const employeeRole = roles.find(r => r.name === 'employee');
  const employeeList = employeeRole
    ? users.filter(u => u.role_id === employeeRole.id)
    : [];

  // refresh reviews
  const refresh = () => {
    setLoading(true);
    const token = sessionStorage.getItem('token');
    api.get('/performance-reviews', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const list = Array.isArray(res.data)
        ? res.data
        : (res.data.data || []);
      setReviews(list);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  };

  const handleViewOpen = (review) => {
    setSelected(review);
    setShowViewModal(true);
  };

  const handleViewClose = () => {
    setShowViewModal(false);
    setSelected(null);
  };

  const handleEditOpen = (review) => {
    setSelected(review);
    setEditForm({
      score: review.score,
      feedback: review.feedback,
    });
    setShowEditModal(true);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setSelected(null);
  };

  const handleCreateOpen = () => {
    setCreateForm({ employee_id: '', score: 0, feedback: '' });
    setShowCreateModal(true);
  };

  const handleCreateClose = () => {
    setShowCreateModal(false);
  };

  const exportPDF = (id) => {
    const token = sessionStorage.getItem('token');
    api.get(`/performance-reviews/${id}/export-pdf`, {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(({ data, headers }) => {
      const blob = new Blob([data], { type: headers['content-type'] });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance_review_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    })
    .catch(console.error);
  };

  const handleCreateSubmit = () => {
    const token = sessionStorage.getItem('token');
    api.post('/performance-reviews', createForm, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      handleCreateClose();
      refresh();
    })
    .catch(console.error);
  };

  const handleEditSubmit = () => {
    if (!selected) return;
    const token = sessionStorage.getItem('token');
    api.put(`/performance-reviews/${selected.id}`, editForm, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      handleEditClose();
      refresh();
    })
    .catch(console.error);
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color={brandPrimary} />
      </Box>
    );
  }

  return (
    <Box bg={bg} shadow="md" rounded="xl" p={6}>
      <HStack justify="space-between" mb={4}>
        <Heading size="lg" color={brandPrimary}>
          Performance Reviews
        </Heading>
        <Button
          leftIcon={<AddIcon />}
          bg={brandPrimary}
          color={brandWhite}
          _hover={{ bg: '#d95959' }}
          onClick={handleCreateOpen}
        >
          New Review
        </Button>
      </HStack>

      {reviews.length === 0 ? (
        <Alert status="info" bg={brandWhite} border={`1px solid ${borderTint}`} color={brandDark}>
          <AlertIcon />
          You don't have any performance reviews yet. Click "New Review" to create one.
        </Alert>
      ) : (
        <Table variant="simple">
          <Thead bg={brandDark}>
            <Tr>
              <Th color={brandWhite}>ID</Th>
              <Th color={brandWhite}>Employee</Th>
              <Th color={brandWhite}>Score</Th>
              <Th color={brandWhite}>Created At</Th>
              <Th textAlign="center" color={brandWhite}>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {reviews.map(r => (
              <Tr key={r.id} _hover={{ bg: hoverTint }}>
                <Td>{r.id}</Td>
                <Td>{r.employee?.name || 'N/A'}</Td>
                <Td>{r.score} / 5</Td>
                <Td>{new Date(r.created_at).toLocaleDateString()}</Td>
                <Td textAlign="center">
                  <Button
                    size="sm"
                    leftIcon={<ViewIcon />}
                    variant="outline"
                    mr={2}
                    borderColor={brandPrimary}
                    color={brandPrimary}
                    _hover={{ bg: hoverTint }}
                    onClick={() => handleViewOpen(r)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<EditIcon />}
                    variant="outline"
                    mr={2}
                    borderColor={brandPrimary}
                    color={brandPrimary}
                    _hover={{ bg: hoverTint }}
                    onClick={() => handleEditOpen(r)}
                  >
                    Edit
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
      )}

      {/* Create Modal */}
      <CustomModal
        isOpen={showCreateModal}
        onClose={handleCreateClose}
        title="New Performance Review"
        footer={
          <HStack justify="flex-end">
            <Button variant="ghost" onClick={handleCreateClose} color={brandDark} _hover={{ bg: hoverTint }}>
              Cancel
            </Button>
            <Button 
              bg={brandPrimary}
              color={brandWhite}
              _hover={{ bg: '#d95959' }}
              onClick={handleCreateSubmit}
              isDisabled={!createForm.employee_id || !createForm.score || !createForm.feedback}
            >
              Create Review
            </Button>
          </HStack>
        }
      >
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel color={brandDark}>Employee</FormLabel>
            <Select
              value={createForm.employee_id}
              onChange={(e) => setCreateForm(prev => ({...prev, employee_id: e.target.value}))}
              placeholder="Select employee"
              focusBorderColor={brandPrimary}
            >
              {employeeList.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel color={brandDark}>Score (Click to select)</FormLabel>
            <HStack spacing={2}>
              {[1, 2, 3, 4, 5].map((val) => (
                <Box
                  key={val}
                  as="button"
                  type="button"
                  w="40px"
                  h="40px"
                  borderRadius="full"
                  bg={createForm.score >= val ? brandPrimary : brandWhite}
                  color={createForm.score >= val ? brandWhite : brandDark}
                  border={`1px solid ${brandPrimary}`}
                  fontWeight="bold"
                  onClick={() => setCreateForm(prev => ({...prev, score: val}))}
                  _hover={{ transform: 'scale(1.1)', bg: createForm.score >= val ? '#d95959' : hoverTint }}
                  transition="all 0.2s"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {val}
                </Box>
              ))}
            </HStack>
            <Text fontSize="sm" mt={1} color={brandDark}>Selected: {createForm.score}/5</Text>
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel color={brandDark}>Feedback</FormLabel>
            <Textarea
              value={createForm.feedback}
              onChange={(e) => setCreateForm(prev => ({...prev, feedback: e.target.value}))}
              rows={5}
              placeholder="Enter performance feedback..."
              focusBorderColor={brandPrimary}
            />
          </FormControl>
        </VStack>
      </CustomModal>

      {/* Edit Modal */}
      <CustomModal
        isOpen={showEditModal}
        onClose={handleEditClose}
        title={selected ? `Edit Review #${selected.id}` : 'Edit Review'}
        footer={
          <HStack justify="flex-end">
            <Button variant="ghost" onClick={handleEditClose} color={brandDark} _hover={{ bg: hoverTint }}>
              Cancel
            </Button>
            <Button 
              bg={brandPrimary}
              color={brandWhite}
              _hover={{ bg: '#d95959' }}
              onClick={handleEditSubmit}
              isDisabled={!editForm.score || !editForm.feedback}
            >
              Update Review
            </Button>
          </HStack>
        }
      >
        {selected && (
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontSize="sm" color={brandDark}>Employee</Text>
              <Text fontWeight="bold" color={brandDark}>{selected.employee?.name || 'N/A'}</Text>
            </Box>
            
            <FormControl isRequired>
              <FormLabel color={brandDark}>Score</FormLabel>
              <HStack spacing={2}>
                {[1, 2, 3, 4, 5].map((val) => (
                  <Box
                    key={val}
                    as="button"
                    type="button"
                    w="40px"
                    h="40px"
                    borderRadius="full"
                    bg={editForm.score >= val ? brandPrimary : brandWhite}
                    color={editForm.score >= val ? brandWhite : brandDark}
                    border={`1px solid ${brandPrimary}`}
                    fontWeight="bold"
                    onClick={() => setEditForm(prev => ({...prev, score: val}))}
                    _hover={{ transform: 'scale(1.1)', bg: editForm.score >= val ? '#d95959' : hoverTint }}
                    transition="all 0.2s"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {val}
                  </Box>
                ))}
              </HStack>
              <Text fontSize="sm" mt={1} color={brandDark}>Selected: {editForm.score}/5</Text>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel color={brandDark}>Feedback</FormLabel>
              <Textarea
                value={editForm.feedback}
                onChange={(e) => setEditForm(prev => ({...prev, feedback: e.target.value}))}
                rows={5}
                focusBorderColor={brandPrimary}
              />
            </FormControl>
          </VStack>
        )}
      </CustomModal>

      {/* View Modal */}
      <CustomModal
        isOpen={showViewModal}
        onClose={handleViewClose}
        title={selected ? `Performance Review #${selected.id}` : 'Performance Review'}
        footer={
          <HStack justify="center">
            <Button
              bg={brandPrimary}
              color={brandWhite}
              _hover={{ bg: '#d95959' }}
              onClick={handleViewClose}
            >
              Close
            </Button>
          </HStack>
        }
      >
        {selected && (
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="bold" color={brandDark} mb={1}>
                Employee
              </Text>
              <Text color={brandDark}>
                {selected.employee?.name || 'N/A'} 
                {selected.employee?.department && ` — ${selected.employee.department}`}
              </Text>
            </Box>
            
            <Divider borderColor={borderTint} />
            
            <Box>
              <Text fontSize="sm" fontWeight="bold" color={brandDark} mb={1}>
                Reviewer
              </Text>
              <Text color={brandDark}>
                {selected.reviewer?.name || 'N/A'}
                {selected.reviewer?.department && ` — ${selected.reviewer.department}`}
              </Text>
            </Box>
            
            <Divider borderColor={borderTint} />
            
            <Box>
              <Text fontSize="sm" fontWeight="bold" color={brandDark} mb={2}>
                Score
              </Text>
              <HStack spacing={2}>
                {[1, 2, 3, 4, 5].map((val) => (
                  <Box
                    key={val}
                    w="30px"
                    h="30px"
                    borderRadius="full"
                    bg={selected.score >= val ? brandPrimary : brandWhite}
                    color={selected.score >= val ? brandWhite : brandDark}
                    border={`1px solid ${brandPrimary}`}
                    fontWeight="bold"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="sm"
                  >
                    {val}
                  </Box>
                ))}
                <Text ml={2} fontWeight="bold" color={brandDark}>{selected.score} / 5</Text>
              </HStack>
            </Box>
            
            <Divider borderColor={borderTint} />
            
            <Box>
              <Text fontSize="sm" fontWeight="bold" color={brandDark} mb={1}>
                Feedback
              </Text>
              <Text whiteSpace="pre-wrap" color={brandDark}>{selected.feedback}</Text>
            </Box>
            
            <Divider borderColor={borderTint} />
            
            <Box>
              <Text fontSize="xs" color={brandPrimary}>
                Created: {new Date(selected.created_at).toLocaleString()}
              </Text>
              <Text fontSize="xs" color={brandPrimary}>
                Updated: {new Date(selected.updated_at).toLocaleString()}
              </Text>
            </Box>
          </VStack>
        )}
      </CustomModal>
    </Box>
  );
}
