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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Анимированный фон с полосками */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            repeating-linear-gradient(
              135deg,
              rgba(255,255,255,0.06) 0px,
              rgba(255,255,255,0.06) 2px,
              transparent 2px,
              transparent 12px
            )
          `,
          animation: 'moveStripes 25s linear infinite',
          '@keyframes moveStripes': {
            '0%': { backgroundPosition: '0 0' },
            '100%': { backgroundPosition: '200px 200px' },
          },
        }}
      />

      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper 
          elevation={12} 
          sx={{ 
            p: 5, 
            borderRadius: 4,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(21, 101, 192, 0.2)'
          }}
        >
          <Typography 
            variant="h3" 
            align="center" 
            gutterBottom 
            sx={{ 
              color: '#0d47a1', 
              fontWeight: 700,
              letterSpacing: '-1.5px',
              mb: 1
            }}
          >
            ПРОФ СТОМ
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            align="center" 
            color="text.secondary" 
            gutterBottom 
            sx={{ mb: 4, fontSize: '1.05rem' }}
          >
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
                py: 1.6, 
                fontSize: '1.05rem',
                bgcolor: '#1565c0',
                '&:hover': { bgcolor: '#0d47a1' },
                mb: 2
              }}
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти в систему'}
            </Button>

            <Typography align="center" sx={{ mt: 2 }}>
              Нет аккаунта?{' '}
              <Link 
                to="/register" 
                style={{ 
                  color: '#1565c0', 
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
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