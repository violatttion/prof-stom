import React, { useState, useEffect } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button } from '@mui/material';
import PageLayout from '../../components/PageLayout';

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');

  // TODO: Здесь будет реальный запрос к API
  useEffect(() => {
    // Временные данные
    setPatients([
      { id: 1, fullName: 'Иванов Иван Иванович', email: 'ivanov@mail.ru', phone: '+7 999 123-45-67' },
      { id: 2, fullName: 'Петрова Анна Сергеевна', email: 'petrova@mail.ru', phone: '+7 999 987-65-43' },
    ]);
  }, []);

  const filteredPatients = patients.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700, mb: 4 }}>
        Управление пациентами
      </Typography>

      <TextField
        label="Поиск по имени или email"
        variant="outlined"
        fullWidth
        sx={{ mb: 3 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ФИО</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Телефон</strong></TableCell>
              <TableCell align="center"><strong>Действия</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.fullName}</TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell align="center">
                  <Button variant="outlined" size="small" sx={{ mr: 1 }}>Карта</Button>
                  <Button variant="outlined" color="error" size="small">Удалить</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </PageLayout>
  );
};

export default AdminPatients;