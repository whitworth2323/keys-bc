import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface WarningModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmation: () => void;
  warningMessage: string;
}

export default function WarningModal({
  open,
  onClose,
  onConfirmation,
  warningMessage,
}: WarningModalProps) {
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
          <img src='/warning.png' alt='warning.png' />
          Warning
        </Typography>
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant='body1'>{warningMessage}</Typography>
        <Button
          onClick={onConfirmation}
          sx={{
            color: 'black',
            marginTop: '1rem',
            backgroundColor: '#f4ba43',
            '&:hover': {
              backgroundColor: '#f4ba43',
            },
          }}
        >
          Yes
        </Button>
      </DialogContent>
    </Dialog>
  );
}
