import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
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
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(150deg, #f0f7ff 0%, #eaf4fd 40%, #f4f9ff 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Более заметные, но всё равно мягкие лучи */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(125deg, rgba(21, 101, 192, 0.16) 0%, transparent 42%),
            linear-gradient(140deg, rgba(25, 118, 210, 0.13) 15%, transparent 55%),
            linear-gradient(115deg, rgba(13, 71, 161, 0.14) 28%, transparent 65%)
          `,
          backgroundSize: '200% 200%',
          animation: 'softRaysMove 48s ease-in-out infinite',
          '@keyframes softRaysMove': {
            '0%': { backgroundPosition: '0% 0%' },
            '50%': { backgroundPosition: '32% 38%' },
            '100%': { backgroundPosition: '0% 0%' },
          },
        }}
      />

      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 2 }}>
        <Paper 
          elevation={12} 
          sx={{ 
            p: 5, 
            borderRadius: 5,
            background: 'white',
            boxShadow: '0 20px 60px rgba(13, 71, 161, 0.2)',
            border: '1px solid #bbdefb'
          }}
        >
          <Typography variant="h3" align="center" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700 }}>
            ПРОФ СТОМ
          </Typography>
          
          <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
            Информационная система<br />стоматологической клиники
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
              sx={{ mb: 2.5 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3.5 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                py: 1.7, 
                fontSize: '1.05rem',
                bgcolor: '#1565c0',
                '&:hover': { bgcolor: '#0d47a1' },
                mb: 2.5,
                borderRadius: 3
              }}
              disabled={loading}
            >
              {loading ? 'Вход...' : 'ВОЙТИ В СИСТЕМУ'}
            </Button>

            <Typography align="center" sx={{ color: '#555' }}>
              Нет аккаунта?{' '}
              <Link to="/register" style={{ color: '#1565c0', fontWeight: 600, textDecoration: 'none' }}>
                Зарегистрироваться
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;