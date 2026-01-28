import { useState, useEffect, useMemo } from 'react';
import {
  Box, Flex, Stack, Heading, Text, Image,
  CircularProgress, CircularProgressLabel,
  Progress, IconButton, Spinner
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import api from '../util/api';
import { useRandomQuote } from '../custom-hooke/useRandomQuote';
import { useRandomFakeUsers } from '../custom-hooke/useRandomFakeUsers';

export default function Home() {
  // 1) Load user & resolved role/department names
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const [roleName, setRoleName] = useState('');
  const [deptName, setDeptName] = useState('');
  const roleLabels = {
    employee:      'Employee',
    hr_worker:     'HR Worker',
    administrator: 'Administrator',
  };

  const brandPrimary = '#F06A6A';
  const brandDark = '#0D0E10';
  const brandWhite = '#FFFFFF';

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (user.role_id) {
      api.get(`/roles/${user.role_id}`, { headers: { Authorization: `Bearer ${token}` } })
         .then(r => setRoleName(roleLabels[r.data.name] || r.data.name))
         .catch(() => setRoleName(''));
    }
    if (user.department_id) {
      api.get(`/departments/${user.department_id}`, { headers: { Authorization: `Bearer ${token}` } })
         .then(r => setDeptName(r.data.name))
         .catch(() => setDeptName(''));
    }
  }, [user.role_id, user.department_id]);

  // 2) Progress animations + static data
  const [circleVal, setCircleVal] = useState(0);
  const [barVals, setBarVals]     = useState([0,0,0,0,0]);
  const projects = useMemo(() => [
    { label:'Project 1', target:90 },
    { label:'Project 2', target:70 },
    { label:'Project 3', target:40 },
    { label:'Project 4', target:80 },
    { label:'Project 5', target:50 },
  ], []);

  useEffect(() => {
    setTimeout(() => {
      setCircleVal(50);
      setBarVals([90,70,40,80,50]);
    }, 100);
  }, []);

  // 3) Quote of the Day
  const { quote, author, loading: qLoading } = useRandomQuote();

  // 4) Fake birthdays carousel
  const birthdays = useRandomFakeUsers(36);
  const pageSize   = 6;
  const totalPages = Math.ceil(birthdays.length / pageSize);
  const [page, setPage] = useState(0);
  const current = birthdays.slice(page * pageSize, page * pageSize + pageSize);

  const bg     = brandDark;
  const cardBg = brandWhite;

  return (
    <Box bg={bg} minH="100vh" p={{ base:4, md:8 }} color={brandDark}>
      <Stack spacing={8}>

        {/* Top Panels */}
        <Flex direction={{ base:'column', md:'row' }} gap={8}>
          {/* Personal Overview */}
          <Box flex="1" bg={cardBg} shadow="xl" rounded="xl" p={6} border={`2px solid ${brandPrimary}`}>
            <Heading size="md" mb={4} color={brandPrimary}>Personal Overview</Heading>
            <Flex justify="center" mb={6}>
              <CircularProgress
                value={circleVal}
                size="140px"
                color={brandPrimary}
                thickness="10px"
                transition="all 1s ease-out"
              >
                <CircularProgressLabel fontSize="lg" color={brandDark}>
                  {circleVal}%
                </CircularProgressLabel>
              </CircularProgress>
            </Flex>
            <Stack spacing={4}>
              {projects.map((p,i) => (
                <Flex key={p.label} align="center">
                  <Text w="25%" fontSize="sm" color={brandDark}>{p.label}</Text>
                  <Box w="60%" mx={2}>
                    <Progress
                      value={barVals[i]}
                      size="sm"
                      borderRadius="md"
                      transition="width 1s ease-out"
                      sx={{
                        '& > div': { backgroundColor: brandPrimary },
                        bg: '#f9d1d1'
                      }}
                    />
                  </Box>
                  <Text w="15%" textAlign="right" fontSize="sm" color={brandDark}>
                    {barVals[i]}%
                  </Text>
                </Flex>
              ))}
            </Stack>
          </Box>

          {/* Welcome & Quote */}
          <Box flex="1" bg={cardBg} shadow="xl" rounded="xl" p={6} border={`2px solid ${brandPrimary}`}>
            <Heading size="md" mb={4} color={brandPrimary}>Welcome {user.name}!</Heading>
            <Flex mb={6} align="center" gap={6}>
              <Box boxSize="100px" rounded="md" overflow="hidden" border={`2px solid ${brandPrimary}`}>
                {user.image_url
                  ? <Image src={user.image_url} alt={user.name} w="100%" h="100%" objectFit="cover"/>
                  : <Text color={brandDark}>No Image</Text>
                }
              </Box>
              <Stack spacing={1}>
                <Text color={brandDark}><Text as="span" fontWeight="bold">Name: </Text>{user.name}</Text>
                <Text color={brandDark}><Text as="span" fontWeight="bold">Email: </Text>{user.email}</Text>
                <Text color={brandDark}><Text as="span" fontWeight="bold">Department: </Text>{deptName}</Text>
                <Text color={brandDark}><Text as="span" fontWeight="bold">Role: </Text>{roleName}</Text>
              </Stack>
            </Flex>
            <Box bg={brandPrimary} p={4} rounded="lg" textAlign="center" minH="80px" color={brandWhite}>
              {qLoading
                ? <Spinner color={brandWhite} />
                : <>
                    <Text fontStyle="italic">“{quote}”</Text>
                    <Text mt={2} fontWeight="bold" fontSize="sm">— {author}</Text>
                  </>
              }
            </Box>
          </Box>
        </Flex>

        {/* Birthdays Carousel */}
        <Box bg={cardBg} shadow="xl" rounded="xl" p={6} border={`2px solid ${brandPrimary}`}>
          <Heading size="md" mb={4} color={brandPrimary}>Today’s Birthdays</Heading>
          <Flex align="center">
            <IconButton
              icon={<ChevronLeftIcon />}
              aria-label="Previous"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              isDisabled={page === 0}
              mr={2}
              bg={brandPrimary}
              color={brandWhite}
              _hover={{ bg: '#d95959' }}
            />
            <Flex flex="1" wrap="wrap" justify="space-around" rowGap={6}>
              {current.length === 0
                ? <Spinner color={brandPrimary} />
                : current.map(b => (
                    <Box
                      key={b.id}
                      textAlign="center"
                      bg={brandWhite}
                      p={4}
                      rounded="xl"
                      shadow="md"
                      w={{ base: '140px', md: '160px' }}
                      border={`1px solid ${brandPrimary}`}
                    >
                      <Image
                        src={b.image_url}
                        alt={b.name}
                        w="100%"
                        h="100px"
                        objectFit="cover"
                        rounded="md"
                        mb={2}
                        border={`2px solid ${brandPrimary}`}
                      />
                      <Text fontWeight="semibold" color={brandDark}>{b.name}</Text>
                      <Text fontSize="xs" color={brandPrimary}>{b.department}</Text>
                      <Text fontSize="xs" color={brandDark}>{b.date}</Text>
                    </Box>
                  ))
              }
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
        </Box>
      </Stack>
    </Box>
  );
}
