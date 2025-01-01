import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ErrorModalProps {
  open: boolean;
  onClose: () => void;
  errorMessage: string;
}

export default function ErrorModal({
  open,
  onClose,
  errorMessage,
}: ErrorModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle
        sx={{
          display: 'flex',
        }}
      >
        <Typography
          variant='h6'
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <img src='/error.png' alt='error.png' />
          Error
        </Typography>
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant='body1'>{errorMessage}</Typography>
      </DialogContent>
    </Dialog>
  );
}
