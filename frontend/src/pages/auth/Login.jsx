import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import MouseTrail from '../../components/MouseTrail';

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
    <Box sx={{ 
      minHeight: '100vh', 
      width: '100%',           // ← исправлено (было 100vw)
      overflow: 'hidden',
      position: 'relative'
    }}>
      <AnimatedBackground />
      <MouseTrail />

      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2 
      }}>
        <Paper elevation={12} sx={{ p: 5, borderRadius: 5, maxWidth: 420, width: '100%', mx: 2 }}>
          <Typography variant="h3" align="center" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700 }}>
            ПРОФ СТОМ
          </Typography>
          
          <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
            Информационная система стоматологической клиники
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField margin="normal" required fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2.5 }} />
            <TextField margin="normal" required fullWidth label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 3.5 }} />
            
            <Button type="submit" fullWidth variant="contained" size="large" sx={{ py: 1.7, bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' }, mb: 2.5, borderRadius: 3 }} disabled={loading}>
              {loading ? 'Вход...' : 'ВОЙТИ В СИСТЕМУ'}
            </Button>

            <Typography align="center">
              Нет аккаунта? <Link to="/register" style={{ color: '#1565c0', fontWeight: 600 }}>Зарегистрироваться</Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;