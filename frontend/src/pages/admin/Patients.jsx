import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data || []);
    } catch (err) {
      setError('Не удалось загрузить список пациентов');
    }
  };

  const filteredPatients = patients.filter(p => {
    const fullName = p.User?.full_name || p.full_name || '';
    const phone = p.User?.phone || p.phone || '';
    const email = p.User?.email || p.email || '';
    const s = search.toLowerCase();

    return fullName.toLowerCase().includes(s) ||
           phone.includes(search) ||
           email.toLowerCase().includes(s);
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пациента?')) return;

    try {
      await api.delete(`/patients/${id}`);
      setSuccess('Пациент успешно удалён');
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при удалении пациента');
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700, mb: 4 }}>
        Управление пациентами
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <TextField
        label="Поиск по ФИО, телефону или email"
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
              <TableCell><strong>Телефон</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell align="center"><strong>Действия</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id} hover>
                  <TableCell>{patient.User?.full_name || patient.full_name || '—'}</TableCell>
                  <TableCell>{patient.User?.phone || patient.phone || '—'}</TableCell>
                  <TableCell>{patient.User?.email || patient.email || '—'}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                    >
                      Карта пациента
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(patient.id)}
                    >
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">Пациенты не найдены</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default AdminPatients;