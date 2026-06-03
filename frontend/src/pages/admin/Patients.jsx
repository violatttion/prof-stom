import React from 'react';
import { Typography, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const AdminPatients = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Управление пациентами</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Этот раздел находится в разработке.
      </Typography>
      <Button component={Link} to="/admin" variant="outlined">
        Вернуться на дашборд
      </Button>
    </Paper>
  );
};

export default AdminPatients;
