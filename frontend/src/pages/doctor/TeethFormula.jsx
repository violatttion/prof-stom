import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography, Paper, Grid, Button, TextField, Alert, Box, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import api from '../../api';

const TeethFormula = () => {
  const { appointmentId } = useParams();
  const [teeth, setTeeth] = useState([]);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (appointmentId) fetchTeethFormula();
  }, [appointmentId]);

  const fetchTeethFormula = async () => {
    try {
      const res = await api.get(`/teeth-formula/${appointmentId}`);
      setTeeth(res.data || []);
    } catch (err) {
      setError('Не удалось загрузить зубную формулу');
    }
  };

  const handleToothClick = (tooth) => {
    setSelectedTooth(tooth);
    setStatus(tooth.status || 'healthy');
    setComment(tooth.comment || '');
    setOpen(true);
  };

  const handleSave = async () => {
    if (!selectedTooth) return;

    try {
      await api.put(`/teeth-formula/${appointmentId}`, {
        tooth_number: selectedTooth.tooth_number,
        status,
        comment
      });
      setSuccess('Изменения сохранены');
      setOpen(false);
      fetchTeethFormula();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const getToothColor = (status) => {
    if (status === 'healthy') return 'success';
    if (status === 'caries') return 'warning';
    if (status === 'extracted') return 'error';
    return 'default';
  };

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700 }}>
        Зубная формула
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>Зубы пациента</Typography>
        <Grid container spacing={1}>
          {teeth.length > 0 ? (
            teeth.map((tooth) => (
              <Grid item xs={2} sm={1.5} key={tooth.tooth_number}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleToothClick(tooth)}
                  sx={{ minHeight: 55 }}
                >
                  {tooth.tooth_number}
                  {tooth.status && tooth.status !== 'healthy' && (
                    <Chip 
                      label={tooth.status} 
                      color={getToothColor(tooth.status)} 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </Button>
              </Grid>
            ))
          ) : (
            <Typography color="text.secondary">Зубная формула пока не заполнена</Typography>
          )}
        </Grid>
      </Paper>

      {/* Модальное окно редактирования */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Зуб №{selectedTooth?.tooth_number}
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Состояние"
            fullWidth
            margin="normal"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="healthy">Здоров</option>
            <option value="caries">Кариес</option>
            <option value="extracted">Удалён</option>
            <option value="implant">Имплант</option>
            <option value="crown">Коронка</option>
          </TextField>

          <TextField
            label="Комментарий"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSave}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default TeethFormula;