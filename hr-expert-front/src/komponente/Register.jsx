import { useState, useEffect, useRef } from 'react';
import {
  Flex, Heading, FormControl, FormLabel, Input, InputGroup, InputRightElement,
  Button, Stack, Text, Link, useToast, IconButton, Image, Select
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../util/api';

export default function Register() {
  const toast = useToast();
  const nav   = useNavigate();
  const fileInputRef = useRef();

  const [loading, setLoading]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [roles, setRoles] = useState([]);
  const [deps,  setDeps]  = useState([]);

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role_id: '', department_id: '', image_url: ''
  });
  const [deptOptions, setDeptOptions] = useState([]);
  const [deptDisabled, setDeptDisabled] = useState(false);

  const brandPrimary = '#F06A6A';
  const brandDark = '#0D0E10';
  const brandWhite = '#FFFFFF';

  useEffect(() => {
    Promise.all([api.get('/roles'), api.get('/departments')])
      .then(([rRes, dRes]) => {
        setRoles(rRes.data);
        setDeps(dRes.data);
      })
      .catch(err => toast({
        title: 'Greška pri učitavanju',
        description: err.message, status: 'error', isClosable: true
      }));
  }, []);

  useEffect(() => {
    const role = roles.find(r => String(r.id) === String(form.role_id));
    if (!role) {
      setDeptOptions(deps);
      setDeptDisabled(false);
      setForm(f => ({ ...f, department_id: '' }));
      return;
    }

    switch (role.name) {
      case 'administrator': {
        const itDept = deps.find(d => d.name === 'IT');
        setForm(f => ({ ...f, department_id: itDept?.id || '' }));
        setDeptOptions(itDept ? [itDept] : []);
        setDeptDisabled(true);
        break;
      }
      case 'hr_worker': {
        const hrDept = deps.find(d => d.name === 'Human Resources');
        setForm(f => ({ ...f, department_id: hrDept?.id || '' }));
        setDeptOptions(hrDept ? [hrDept] : []);
        setDeptDisabled(true);
        break;
      }
      case 'employee': {
        const filtered = deps.filter(d => d.name !== 'Human Resources');
        setDeptOptions(filtered);
        setDeptDisabled(false);
        setForm(f => ({ ...f, department_id: '' }));
        break;
      }
      default: {
        setDeptOptions(deps);
        setDeptDisabled(false);
        setForm(f => ({ ...f, department_id: '' }));
      }
    }
  }, [form.role_id, roles, deps]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('key', process.env.REACT_APP_IMGBB_KEY);
    data.append('image', file);

    try {
      const res = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: data
      }).then(r => r.json());

      if (res.success) {
        setForm(f => ({ ...f, image_url: res.data.url }));
        toast({ title: 'Slika otpremljena', status: 'success', isClosable: true });
      } else {
        throw new Error(res.error.message);
      }
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, status: 'error', isClosable: true });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setForm(f => ({ ...f, image_url: '' }));
    fileInputRef.current.value = null;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/register', form);
      toast({ title: 'Registrovan uspešno!', description: res.data.message,
        status: 'success', duration: 3000, isClosable: true });
      nav('/');
    } catch (err) {
      toast({
        title: 'Greška pri registraciji',
        description: err.response?.data?.message || err.message,
        status: 'error', duration: 4000, isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const labelForRole = name => {
    switch (name) {
      case 'administrator': return 'Administrator';
      case 'hr_worker':     return 'HR Worker';
      case 'employee':      return 'Employee';
      default:              return name;
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center"
      bg={brandDark}>
      <Stack spacing={6} w={{ base:'90%', md:'450px' }} p={8}
        bg={brandWhite} boxShadow="2xl" borderRadius="xl" border={`2px solid ${brandPrimary}`}>

        <Flex justify="center">
          <Image src="/images/hr-logo.png" alt="HR Logo" boxSize="100px" width="230px"/>
        </Flex>
        <Heading textAlign="center" color={brandPrimary}>Kreiraj nalog</Heading>

        <FormControl isRequired>
          <FormLabel color={brandDark}>Ime i prezime</FormLabel>
          <Input name="name" value={form.name} onChange={handleChange}
            placeholder="Ime i prezime..." focusBorderColor={brandPrimary} />
        </FormControl>

        <FormControl isRequired>
          <FormLabel color={brandDark}>Email adresa</FormLabel>
          <Input type="email" name="email" value={form.email}
            onChange={handleChange} placeholder="email@primer.com"
            focusBorderColor={brandPrimary} />
        </FormControl>

        <FormControl isRequired>
          <FormLabel color={brandDark}>Lozinka</FormLabel>
          <InputGroup>
            <Input type={showPassword?'text':'password'} name="password"
              value={form.password} onChange={handleChange}
              placeholder="********" focusBorderColor={brandPrimary} />
            <InputRightElement>
              <IconButton
                variant="ghost"
                color={brandPrimary}
                icon={showPassword?<ViewOffIcon/>:<ViewIcon/>}
                onClick={()=>setShowPassword(!showPassword)}
                aria-label="Toggle password"
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl isRequired>
          <FormLabel color={brandDark}>Uloga</FormLabel>
          <Select name="role_id" value={form.role_id}
            onChange={handleChange} focusBorderColor={brandPrimary}
            placeholder="Izaberi ulogu">
            {roles.map(r=>(
              <option key={r.id} value={r.id}>
                {labelForRole(r.name)}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel color={brandDark}>Odeljenje</FormLabel>
          <Select name="department_id"
            value={form.department_id}
            onChange={handleChange}
            focusBorderColor={brandPrimary}
            placeholder={deptDisabled ? undefined : 'Izaberi odeljenje'}
            isDisabled={deptDisabled}>
            {deptOptions.map(d=>(
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel color={brandDark}>Slika profila</FormLabel>
          {form.image_url ? (
            <Stack direction="row" align="center" spacing={4}>
              <Image boxSize="80px" src={form.image_url}
                alt="avatar" borderRadius="md" />
              <IconButton
                icon={<DeleteIcon />}
                color={brandWhite}
                bg={brandPrimary}
                _hover={{ bg: '#d95959' }}
                aria-label="Ukloni"
                onClick={removeImage}
              />
            </Stack>
          ) : (
            <Button leftIcon={<AddIcon />}
              onClick={()=>fileInputRef.current.click()}
              isLoading={uploading}
              bg={brandPrimary}
              color={brandWhite}
              _hover={{ bg: '#d95959' }}
              variant="solid"
            >
              {uploading?'Otpremanje...':'Otpremi sliku'}
            </Button>
          )}
          <Input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            hidden
          />
        </FormControl>

        <Button
          bg={brandPrimary}
          color={brandWhite}
          _hover={{ bg: '#d95959' }}
          isFullWidth
          isLoading={loading}
          loadingText="Šaljem..."
          onClick={handleSubmit}
        >
          Registruj se
        </Button>

        <Text textAlign="center" color={brandDark}>
          Već imaš nalog?{' '}
          <Link as={RouterLink} to="/" color={brandPrimary} fontWeight="bold">
            Prijavi se
          </Link>
        </Text>
      </Stack>
    </Flex>
  );
}
