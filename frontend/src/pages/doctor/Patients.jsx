import React from 'react';
import { Typography, Paper, List, ListItem, ListItemText, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const DoctorPatients = () => {
  const mockPatients = [
    { id: 1, name: 'Сидоров Алексей', lastVisit: '2026-05-20' },
    { id: 2, name: 'Козлова Мария', lastVisit: '2026-05-18' },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Мои пациенты</Typography>
      <List>
        {mockPatients.map(p => (
          <ListItem key={p.id} divider>
            <ListItemText primary={p.name} secondary={`Последний визит: ${p.lastVisit}`} />
            <Button component={Link} to={`/doctor/patient/${p.id}`} variant="outlined">Открыть карту</Button>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default DoctorPatients;
