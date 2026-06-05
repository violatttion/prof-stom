import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Typography, Paper, Button, Modal, Box, Select, MenuItem, TextField, Alert, CircularProgress 
} from '@mui/material';
import api from '../../api';

const toothNumbers = [18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28, 38,37,36,35,34,33,32,31, 41,42,43,44,45,46,47,48];

const statusColors = {
  healthy: '#4caf50',
  caries: '#f44336',
  filling: '#ff9800',
  extracted: '#9e9e9e',
  implant: '#2196f3',
  crown: '#9c27b0',
  root_canal: '#795548'
};

const TeethFormula = () => {
  const { appointmentId } = useParams();
  const [teeth, setTeeth] = useState({});
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState('healthy');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canSave, setCanSave] = useState(false);

  useEffect(() => {
    const checkAppointment = async () => {
      setLoading(true);
      try {
        // Проверяем, существует ли приём
        await api.get(`/appointments?appointmentId=${appointmentId}`);
        setCanSave(true);
        setError('');
        
        // Загружаем зубы
        const res = await api.get(`/teeth-formula/${appointmentId}`);
        const map = {};
        res.data.forEach(t => { map[t.tooth_number] = t; });
        setTeeth(map);
      } catch (e) {
        setError('Приём не найден в базе. Зубную формулу можно использовать только для существующих записей.');
        setCanSave(false);
      } finally {
        setLoading(false);
      }
    };

    checkAppointment();
  }, [appointmentId]);

  const handleToothClick = (num) => {
    if (!canSave) return;
    const existing = teeth[num] || { status: 'healthy', comment: '' };
    setSelectedTooth(num);
    setStatus(existing.status);
    setComment(existing.comment || '');
    setModalOpen(true);
  };

  const saveTooth = async () => {
    if (!canSave || !selectedTooth) {
      alert('Нельзя сохранить — приём не существует в базе');
      return;
    }

    try {
      await api.put(`/teeth-formula/${appointmentId}`, {
        tooth_number: selectedTooth,
        status,
        comment
      });
      setModalOpen(false);
      // Перезагружаем данные
      const res = await api.get(`/teeth-formula/${appointmentId}`);
      const map = {};
      res.data.forEach(t => { map[t.tooth_number] = t; });
      setTeeth(map);
    } catch (e) {
      alert('Ошибка сохранения: ' + (e.response?.data?.error || e.message));
    }
  };

  if (loading) {
    return <Paper sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Paper>;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Интерактивная зубная формула (Приём #{appointmentId})
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {canSave && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Нажмите на зуб, чтобы изменить его состояние
          </Typography>

          <svg viewBox="0 0 900 420" style={{ width: '100%', maxWidth: 900 }}>
            {toothNumbers.map((num, index) => {
              const row = Math.floor(index / 8);
              const col = index % 8;
              const x = 80 + col * 90;
              const y = row < 2 ? (row === 0 ? 120 : 200) : (row === 2 ? 320 : 380);
              const color = statusColors[teeth[num]?.status] || statusColors.healthy;

              return (
                <g key={num} onClick={() => handleToothClick(num)} style={{ cursor: canSave ? 'pointer' : 'not-allowed' }}>
                  <circle cx={x} cy={y} r="28" fill={color} stroke="#333" strokeWidth="2" />
                  <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{num}</text>
                </g>
              );
            })}
          </svg>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', p: 4, borderRadius: 2 }}>
          <Typography variant="h6">Зуб №{selectedTooth}</Typography>
          
          <Select fullWidth value={status} onChange={(e) => setStatus(e.target.value)} sx={{ mt: 2 }}>
            {Object.keys(statusColors).map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>

          <TextField 
            fullWidth 
            multiline 
            rows={3} 
            label="Комментарий" 
            value={comment} 
            onChange={(e) => setComment(e.target.value)} 
            sx={{ mt: 2 }} 
          />

          <Button 
            variant="contained" 
            fullWidth 
            sx={{ mt: 2 }} 
            onClick={saveTooth}
            disabled={!canSave}
          >
            Сохранить
          </Button>
        </Box>
      </Modal>
    </Paper>
  );
};

export default TeethFormula;