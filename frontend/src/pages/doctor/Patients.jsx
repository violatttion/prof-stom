import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import api from '../../api';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients'); // или /doctors/my-patients
      setPatients(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    patient.User?.phone?.includes(search) ||
    patient.User?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700, mb: 4 }}>
        Мои пациенты
      </Typography>

      <TextField
        label="Поиск по имени, телефону или email"
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
              <TableCell><strong>Телефон</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell align="center"><strong>Последняя запись</strong></TableCell>
              <TableCell align="center"><strong>Действия</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id} hover>
                  <TableCell>{patient.full_name}</TableCell>
                  <TableCell>{patient.User?.phone || '—'}</TableCell>
                  <TableCell>{patient.User?.email || '—'}</TableCell>
                  <TableCell align="center">
                    {patient.last_appointment_date || '—'}
                  </TableCell>
                  <TableCell align="center">
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => window.location.href = `/doctor/patient/${patient.id}`}
                    >
                      Открыть карту
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Пациенты не найдены
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </PageLayout>
  );
};

export default DoctorPatients;