// src/components/AdminDashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Flex,
  Stack,
  Heading,
  Text,
  IconButton,
  Image,
  CircularProgress,
  CircularProgressLabel,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../util/api';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState([]);
  const [hires, setHires] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingHires, setLoadingHires] = useState(true);
  const [page, setPage] = useState(0);

  const pageSize = 3;

  // Brand colors
  const brandPrimary = '#F06A6A';
  const brandDark = '#0D0E10';
  const brandWhite = '#FFFFFF';

  // Fetch department metrics
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    api
      .get('/admin/metrics', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(r => setMetrics(r.data))
      .catch(console.error)
      .finally(() => setLoadingMetrics(false));
  }, []);

  // Fetch all users and take 9 most recent
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    api
      .get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(r => {
        const all = r.data
          .filter(u => u.created_at)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 9);
        setHires(all);
      })
      .catch(console.error)
      .finally(() => setLoadingHires(false));
  }, []);

  const totalPages = Math.ceil(hires.length / pageSize);
  const currentHires = hires.slice(page * pageSize, page * pageSize + pageSize);

  // Top projects static data
  const projects = useMemo(
    () => [
      { name: 'Project 1', value: 40 },
      { name: 'Project 2', value: 45 },
      { name: 'Project 3', value: 50 },
    ],
    []
  );

  const bg = useColorModeValue(brandWhite, brandDark);
  const cardBg = useColorModeValue(brandWhite, '#1c1c1c');

  return (
    <Box bg={bg} minH="100vh" p={{ base: 4, md: 8 }} color={brandDark}>
      <Stack spacing={8}>

        {/* DEPARTMENT METRICS */}
        <Box
          bg={cardBg}
          rounded="xl"
          shadow="xl"
          p={6}
          border={`2px solid ${brandPrimary}`}
        >
          <Heading size="md" mb={4} color={brandPrimary}>
            Number of Employees per Department
          </Heading>
          {loadingMetrics ? (
            <Text>Loading…</Text>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metrics}>
                <XAxis dataKey="department_name" stroke={brandDark} />
                <YAxis stroke={brandDark} />
                <Tooltip
                  cursor={{ fill: '#fde3e3' }}
                  contentStyle={{
                    backgroundColor: brandWhite,
                    border: `1px solid ${brandPrimary}`,
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="employee_count" fill={brandPrimary} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>

        <Flex gap={8} direction={{ base: 'column', md: 'row' }}>
          {/* RECENT HIRES CAROUSEL */}
          <Box
            flex="1"
            bg={cardBg}
            rounded="xl"
            shadow="xl"
            p={6}
            border={`2px solid ${brandPrimary}`}
          >
            <Heading size="md" mb={4} color={brandPrimary}>
              Recent Hires
            </Heading>
            {loadingHires ? (
              <Text>Loading…</Text>
            ) : (
              <Flex align="center">
                <IconButton
                  icon={<ChevronLeftIcon />}
                  aria-label="Prev"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  isDisabled={page === 0}
                  mr={2}
                  bg={brandPrimary}
                  color={brandWhite}
                  _hover={{ bg: '#d95959' }}
                />
                <Flex flex="1" justify="space-around">
                  {currentHires.map(u => (
                    <Box key={u.id} textAlign="center" w="120px">
                      <Image
                        src={u.image_url || 'https://via.placeholder.com/100'}
                        alt={u.name}
                        boxSize="100px"
                        objectFit="cover"
                        rounded="md"
                        mb={2}
                        border={`2px solid ${brandPrimary}`}
                      />
                      <Text fontWeight="semibold" noOfLines={1}>
                        {u.name}
                      </Text>
                      <Text fontSize="sm" color={brandPrimary}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </Text>
                    </Box>
                  ))}
                </Flex>
                <IconButton
                  icon={<ChevronRightIcon />}
                  aria-label="Next"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  isDisabled={page === totalPages - 1}
                  ml={2}
                  bg={brandPrimary}
                  color={brandWhite}
                  _hover={{ bg: '#d95959' }}
                />
              </Flex>
            )}
          </Box>

          {/* TOP PROJECTS – REVENUE */}
          <Box
            flex="1"
            bg={cardBg}
            rounded="xl"
            shadow="xl"
            p={6}
            border={`2px solid ${brandPrimary}`}
          >
            <Heading size="md" mb={4} color={brandPrimary}>
              Top Projects – Revenue
            </Heading>
            <Flex justify="space-around">
              {projects.map(p => (
                <Box key={p.name} textAlign="center">
                  <CircularProgress
                    value={p.value}
                    size="100px"
                    color={brandPrimary}
                    thickness="8px"
                    mb={2}
                    trackColor="#fce8e8"
                  >
                    <CircularProgressLabel color={brandDark}>
                      {p.value}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  <Text mt={2} color={brandDark}>
                    {p.name}
                  </Text>
                </Box>
              ))}
            </Flex>
          </Box>
        </Flex>
      </Stack>
    </Box>
  );
}
