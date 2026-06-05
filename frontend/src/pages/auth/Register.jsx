import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Paper, TextField, Button, Typography, Box, Alert, MenuItem } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', phone: '', role: 'patient'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Здесь должен быть твой api.post('/auth/register', formData)
      // Пока оставил заглушку
      await new Promise(res => setTimeout(res, 800)); 
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <AnimatedBackground />

      <Paper elevation={12} sx={{ p: 5, borderRadius: 5, maxWidth: 480, width: '100%', mx: 2, position: 'relative', zIndex: 1 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700 }}>
          Регистрация
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField name="fullName" label="ФИО" fullWidth margin="normal" required onChange={handleChange} />
          <TextField name="email" label="Email" type="email" fullWidth margin="normal" required onChange={handleChange} />
          <TextField name="phone" label="Телефон" fullWidth margin="normal" onChange={handleChange} />
          <TextField name="password" label="Пароль" type="password" fullWidth margin="normal" required onChange={handleChange} />

          <TextField
            select
            name="role"
            label="Роль"
            fullWidth
            margin="normal"
            value={formData.role}
            onChange={handleChange}
          >
            <MenuItem value="patient">Пациент</MenuItem>
            <MenuItem value="doctor">Врач</MenuItem>
          </TextField>

          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            size="large" 
            sx={{ mt: 3, py: 1.6, bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' }, borderRadius: 3 }}
            disabled={loading}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>

          <Typography align="center" sx={{ mt: 2 }}>
            Уже есть аккаунт? <Link to="/login" style={{ color: '#1565c0', fontWeight: 600 }}>Войти</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;