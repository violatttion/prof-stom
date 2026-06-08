import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert
} from '@mui/material';
import api from '../../api';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [open, setOpen] = useState(false);
  const [newService, setNewService] = useState({ name: '', category: '', price: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data || []);
    } catch (err) {
      setError('Не удалось загрузить услуги');
    }
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.price) {
      setError('Название и стоимость обязательны');
      return;
    }

    try {
      await api.post('/services', {
        name: newService.name,
        category: newService.category || 'Общая',
        price: Number(newService.price)
      });

      setSuccess('Услуга успешно добавлена');
      setNewService({ name: '', category: '', price: '' });
      setOpen(false);
      fetchServices(); // обновляем список
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при добавлении услуги');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить эту услугу?')) return;

    try {
      await api.delete(`/services/${id}`);
      setSuccess('Услуга удалена');
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при удалении');
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700, mb: 4 }}>
        Управление услугами
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Button variant="contained" sx={{ mb: 3 }} onClick={() => setOpen(true)}>
        Добавить услугу
      </Button>

      <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Название услуги</strong></TableCell>
              <TableCell><strong>Категория</strong></TableCell>
              <TableCell align="right"><strong>Стоимость (₽)</strong></TableCell>
              <TableCell align="center"><strong>Действия</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.length > 0 ? (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.category}</TableCell>
                  <TableCell align="right">{service.price}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(service.id)}
                    >
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">Услуг пока нет</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Диалог добавления услуги */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Добавить новую услугу</DialogTitle>
        <DialogContent>
          <TextField
            label="Название услуги"
            fullWidth
            margin="normal"
            value={newService.name}
            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
          />
          <TextField
            label="Категория"
            fullWidth
            margin="normal"
            value={newService.category}
            onChange={(e) => setNewService({ ...newService, category: e.target.value })}
          />
          <TextField
            label="Стоимость"
            type="number"
            fullWidth
            margin="normal"
            value={newService.price}
            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleAddService}>Добавить</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminServices;