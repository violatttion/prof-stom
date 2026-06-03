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
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          ПРОФ СТОМ
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
          Вход в информационную систему
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </Button>
          <Typography align="center">
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </Typography>
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" display="block">Тестовые данные:</Typography>
          <Typography variant="caption" display="block">admin@profstom.ru / Admin123</Typography>
          <Typography variant="caption" display="block">doctor1@profstom.ru / Doctor123</Typography>
          <Typography variant="caption" display="block">patient1@profstom.ru / Patient123</Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
