import React, { useEffect, useState } from 'react';
import { Typography, Paper, List, ListItem, ListItemText, Button } from '@mui/material';
import api from '../../api';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    api.get('/appointments/my').then(res => setAppointments(res.data)).catch(console.error);
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Мои записи</Typography>
      <List>
        {appointments.length === 0 && <Typography>Записей пока нет</Typography>}
        {appointments.map(app => (
          <ListItem key={app.id} divider>
            <ListItemText 
              primary={`${app.appointment_date} ${app.appointment_time}`} 
              secondary={`Статус: ${app.status} | Врач: ${app.Doctor?.User?.full_name || '—'}`} 
            />
            {app.status !== 'cancelled' && (
              <Button color="error" onClick={() => alert('Функция отмены в демо')}>Отменить</Button>
            )}
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default MyAppointments;
