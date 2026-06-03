import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../../api';
import { Typography, Paper } from '@mui/material';

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      const formatted = res.data.map(app => ({
        id: app.id,
        title: `${app.Patient?.User?.full_name || 'Пациент'} — ${app.Doctor?.User?.full_name || 'Врач'}`,
        start: `${app.appointment_date}T${app.appointment_time}`,
        backgroundColor: app.status === 'confirmed' ? '#4caf50' : '#ff9800',
        extendedProps: app
      }));
      setEvents(formatted);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Календарь записей</Typography>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        editable={true}
        selectable={true}
        height="auto"
        locale="ru"
      />
    </Paper>
  );
};

export default AdminCalendar;
