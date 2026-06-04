import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert, MenuItem } from '@mui/material';
import api from '../../api';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'patient'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>Регистрация</Typography>

        {error && <Alert severity="error">{error}</Alert>}

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
            <MenuItem value="admin">Администратор</MenuItem>
          </TextField>
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>Зарегистрироваться</Button>
          <Typography align="center" sx={{ mt: 2 }}>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;