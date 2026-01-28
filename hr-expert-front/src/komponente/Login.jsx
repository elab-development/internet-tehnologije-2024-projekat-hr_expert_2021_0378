import { useState } from 'react';
import {
  Flex,
  Heading,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Stack,
  Text,
  Link,
  useToast,
  IconButton,
  Image,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../util/api';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  // brand colors
  const brandPrimary = '#F06A6A';
  const brandDark = '#0D0E10';
  const brandWhite = '#FFFFFF';

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/login', form);
      const { token, user } = res.data;

      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      toast({
        title: 'Prijava uspešna!',
        description: res.data.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      let roleName = '';
      try {
        const roleRes = await api.get(`/roles/${user.role_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        roleName = roleRes.data.name;
      } catch {
        roleName = '';
      }

      if (roleName === 'administrator') navigate('/admin-dashboard');
      else navigate('/home');
    } catch (err) {
      toast({
        title: 'Greška pri prijavi',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={brandDark}
    >
      <Stack
        spacing={6}
        w={{ base: '90%', md: '400px' }}
        p={8}
        bg={brandWhite}
        boxShadow="2xl"
        borderRadius="xl"
        border={`2px solid ${brandPrimary}`}
      >
        <Flex justify="center">
          <Image src="/images/hr-logo.png" alt="HR Logo" boxSize="100px" width="230px" />
        </Flex>
        <Heading textAlign="center" color={brandPrimary}>
          Prijava
        </Heading>

        <FormControl id="email" isRequired>
          <FormLabel color={brandDark}>Email adresa</FormLabel>
          <Input
            type="email"
            name="email"
            placeholder="email@primer.com"
            value={form.email}
            onChange={handleChange}
            focusBorderColor={brandPrimary}
          />
        </FormControl>

        <FormControl id="password" isRequired>
          <FormLabel color={brandDark}>Lozinka</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="********"
              value={form.password}
              onChange={handleChange}
              focusBorderColor={brandPrimary}
            />
            <InputRightElement>
              <IconButton
                variant="ghost"
                color={brandPrimary}
                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                onClick={() => setShowPassword(v => !v)}
                aria-label="Toggle password visibility"
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <Button
          bg={brandPrimary}
          color={brandWhite}
          _hover={{ bg: '#d95959' }}
          isFullWidth
          isLoading={loading}
          loadingText="Proveravam..."
          onClick={handleSubmit}
        >
          Prijavi se
        </Button>

        <Text textAlign="center" color={brandDark}>
          Nemate nalog?{' '}
          <Link as={RouterLink} to="/register" color={brandPrimary} fontWeight="bold">
            Registrujte se
          </Link>
        </Text>
      </Stack>
    </Flex>
  );
}
