import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, MenuItem, Grid, CircularProgress, Box
} from '@mui/material';
import api from '../../api';

const AdminStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'doctor',
    specialization: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    setError('');
    try {
      const doctorsRes = await api.get('/doctors');
      const doctors = (doctorsRes.data || []).map(d => ({
        ...d.User,
        id: d.id,
        role: 'doctor',
        specialization: d.specialization,
        cabinet: d.cabinet
      }));
      setStaff(doctors);
    } catch (err) {
      console.error('Ошибка загрузки сотрудников:', err);
      setError('Не удалось загрузить список сотрудников');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddStaff = async () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('ФИО, Email и Пароль обязательны');
      return;
    }

    setError('');
    setSuccess('');

    try {
      await api.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        specialization: formData.role === 'doctor' ? formData.specialization : undefined
      });

      const isAdmin = formData.role === 'admin';
      
      setSuccess(
        isAdmin 
          ? 'Администратор успешно добавлен (но не отображается в этом списке — здесь только врачи)' 
          : 'Врач успешно добавлен'
      );
      
      setOpen(false);
      setFormData({
        fullName: '', email: '', password: '', phone: '', role: 'doctor', specialization: ''
      });
      
      // ← Главное исправление: список обновляется сразу
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при добавлении сотрудника');
    }
  };

  const handleDelete = async (id) => {
    alert('Удаление сотрудников временно недоступно (нет соответствующего эндпоинта на бэкенде). Функция будет добавлена позже.');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700, mb: 4 }}>
        Сотрудники клиники
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Button variant="contained" sx={{ mb: 3 }} onClick={() => setOpen(true)}>
        Добавить сотрудника
      </Button>

      <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ФИО</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Телефон</strong></TableCell>
              <TableCell><strong>Роль</strong></TableCell>
              <TableCell><strong>Специализация / Кабинет</strong></TableCell>
              <TableCell align="center"><strong>Действия</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.length > 0 ? (
              staff.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || '—'}</TableCell>
                  <TableCell>{user.role === 'doctor' ? 'Врач' : 'Администратор'}</TableCell>
                  <TableCell>{user.specialization || user.cabinet || '—'}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(user.id)}
                    >
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">Сотрудники не найдены</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Диалог добавления */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить нового сотрудника</DialogTitle>
        <DialogContent>
          <TextField name="fullName" label="ФИО" fullWidth margin="normal" value={formData.fullName} onChange={handleChange} required />
          <TextField name="email" label="Email" type="email" fullWidth margin="normal" value={formData.email} onChange={handleChange} required />
          <TextField name="password" label="Пароль" type="password" fullWidth margin="normal" value={formData.password} onChange={handleChange} required />
          <TextField name="phone" label="Телефон" fullWidth margin="normal" value={formData.phone} onChange={handleChange} />

          <TextField
            select
            name="role"
            label="Роль"
            fullWidth
            margin="normal"
            value={formData.role}
            onChange={handleChange}
          >
            <MenuItem value="doctor">Врач</MenuItem>
            <MenuItem value="admin">Администратор</MenuItem>
          </TextField>

          {formData.role === 'doctor' && (
            <TextField
              name="specialization"
              label="Специализация"
              fullWidth
              margin="normal"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="Стоматолог-терапевт"
            />
          )}

          {formData.role === 'admin' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Администраторы не отображаются в этом списке (здесь только врачи).
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleAddStaff}>Добавить</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminStaff;