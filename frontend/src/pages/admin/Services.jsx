import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
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
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при добавлении услуги');
    }
  };

  return (
    <PageLayout>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ color: '#fff', fontWeight: 700, mb: 4 }}
      >
        Управление услугами
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Button 
        variant="contained" 
        onClick={() => setOpen(true)} 
        sx={{ 
          mb: 3,
          bgcolor: '#fff', 
          color: '#0d47a1',
          '&:hover': { bgcolor: '#e3f2fd' }
        }}
      >
        Добавить услугу
      </Button>

      <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Название</strong></TableCell>
              <TableCell><strong>Категория</strong></TableCell>
              <TableCell><strong>Цена</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell>{service.price} ₽</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
            label="Цена"
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
    </PageLayout>
  );
};

export default AdminServices;