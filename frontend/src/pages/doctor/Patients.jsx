import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Alert, CircularProgress, Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/patients');
      setPatients(res.data || []);
    } catch (err) {
      console.error('Ошибка загрузки пациентов:', err);
      setError('Не удалось загрузить список пациентов');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    const fullName = p.User?.full_name || p.full_name || '';
    const phone = p.User?.phone || p.phone || '';
    const email = p.User?.email || p.email || '';
    const s = search.toLowerCase();

    return fullName.toLowerCase().includes(s) ||
           phone.toLowerCase().includes(s) ||
           email.toLowerCase().includes(s);
  });

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
        Мои пациенты
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

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
                      onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                    >
                      Открыть карту
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {search ? 'Пациенты не найдены по вашему запросу' : 'Пациенты не найдены'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default DoctorPatients;