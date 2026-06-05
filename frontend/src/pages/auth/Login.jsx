import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, Paper, TextField, Button, Typography, Box, Alert 
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'doctor') navigate('/doctor');
      else navigate('/patient');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Paper 
        elevation={6} 
        sx={{ 
          p: 5, 
          borderRadius: 4,
          background: 'linear-gradient(145deg, #f8fbff 0%, #e3f2fd 100%)',
          border: '1px solid #bbdefb'
        }}
      >
        <Typography 
          variant="h3" 
          align="center" 
          gutterBottom 
          sx={{ 
            color: '#1565c0', 
            fontWeight: 700,
            letterSpacing: '-1px'
          }}
        >
          ПРОФ СТОМ
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          align="center" 
          color="text.secondary" 
          gutterBottom 
          sx={{ mb: 4 }}
        >
          Информационная система стоматологической клиники
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ 
              py: 1.5, 
              bgcolor: '#1565c0',
              '&:hover': { bgcolor: '#0d47a1' }
            }}
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти в систему'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;