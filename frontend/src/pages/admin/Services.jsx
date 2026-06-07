import React, { useState } from 'react';
import { Typography, Paper, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import PageLayout from '../../components/PageLayout';

const AdminServices = () => {
  const [services, setServices] = useState([
    { id: 1, name: 'Лечение кариеса', category: 'Терапия', price: 4500 },
    { id: 2, name: 'Профессиональная чистка', category: 'Гигиена', price: 3500 },
  ]);

  const [open, setOpen] = useState(false);
  const [newService, setNewService] = useState({ name: '', category: '', price: '' });

  const handleAddService = () => {
    if (!newService.name || !newService.price) return;

    setServices([
      ...services,
      {
        id: Date.now(),
        name: newService.name,
        category: newService.category || 'Без категории',
        price: Number(newService.price),
      },
    ]);
    setNewService({ name: '', category: '', price: '' });
    setOpen(false);
  };

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700, mb: 3 }}>
        Управление услугами
      </Typography>

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
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell align="right">{service.price}</TableCell>
                <TableCell align="center">
                  <Button variant="outlined" size="small" color="error">Удалить</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Модальное окно добавления услуги */}
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
    </PageLayout>
  );
};

export default AdminServices;