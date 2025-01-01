'use client';
import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import { useRouter } from 'next/navigation';
import GoogleIcon from '@mui/icons-material/Google';
import { useState } from 'react';
import { signInWithGoogle } from '../../../utils/firebase';

function Login() {
  const [error, setError] = useState<boolean>(false);
  const router = useRouter();

  async function signIn() {
    const flag = await signInWithGoogle();
    if (flag === true) {
      router.push('/dashboard');
      return;
    }
    setError(true);
  }

  return (
    <Box>
      {error && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 100,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              padding: '2%',
              borderRadius: '10px',
            }}
          >
            <Typography
              variant='h5'
              sx={{
                fontFamily: 'Roboto',
                textAlign: 'center',
                marginTop: '5%',
              }}
            >
              You are not authorized to access this page
            </Typography>
            <Button
              onClick={() => setError(false)}
              variant='contained'
              color='primary'
              sx={{
                display: 'flex',
                flexDirection: 'row',
                margin: 'auto',
                marginTop: '5%',
                backgroundColor: '#C65BCF',
                color: 'white',
                ' &:hover': {
                  backgroundColor: '#C65BCF',
                },
                borderRadius: '10px',
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      )}

      <Typography
        variant='h4'
        sx={{
          textAlign: 'center',
          fontFamily: 'Roboto',
          marginTop: '5%',
        }}
      >
        Bugwana Activation Key Server
      </Typography>
      <Box
        sx={{
          width: '35%',
          margin: 'auto',
          marginTop: '10%',
          border: '1px solid black',
          padding: '5%',
          borderRadius: '10px',
        }}
      >
        <Typography
          variant='h5'
          sx={{
            fontFamily: 'Roboto',
            textAlign: 'center',
            marginTop: '5%',
          }}
        >
          Please sign in to continue
        </Typography>

        <Button
          onClick={signIn}
          variant='contained'
          color='primary'
          sx={{
            display: 'flex',
            flexDirection: 'row',
            margin: 'auto',
            marginTop: '5%',
            backgroundColor: '#C65BCF',
            color: 'white',
            ' &:hover': {
              backgroundColor: '#C65BCF',
            },
            // border: "1px solid black",
            borderRadius: '10px',
          }}
          startIcon={<GoogleIcon />}
        >
          Sign in with Google
        </Button>
      </Box>
    </Box>
  );
}

export default Login;
