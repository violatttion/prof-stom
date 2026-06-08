import React, { useState } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Rating, Alert
} from '@mui/material';
import api from '../api';

const LeaveReview = ({ appointment, onReviewSubmitted }) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      setError('Поставьте оценку');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/reviews', {
        appointment_id: appointment.id,
        rating,
        comment: comment.trim() || null
      });

      setOpen(false);
      setComment('');
      setRating(5);
      onReviewSubmitted && onReviewSubmitted();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при отправке отзыва');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outlined" 
        size="small" 
        onClick={() => setOpen(true)}
        disabled={appointment.hasReview} // можно добавить проверку
      >
        Оставить отзыв
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Оставить отзыв врачу</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Rating
            name="rating"
            value={rating}
            onChange={(e, newValue) => setRating(newValue)}
            size="large"
            sx={{ mb: 2 }}
          />

          <TextField
            label="Комментарий (необязательно)"
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Отправка...' : 'Отправить отзыв'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LeaveReview;