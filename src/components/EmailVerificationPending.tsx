import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';
import { Container, Typography, Button, Box, Paper } from '@mui/material';

const EmailVerificationPending: React.FC = () => {
  const navigate = useNavigate();

  const resendVerificationEmail = async () => {
    const user = auth.currentUser;
    if (user) {
      await sendEmailVerification(user);
      alert('Verification email sent!');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
      <Paper elevation={6} sx={{ padding: 4, borderRadius: 6 }}>
        <Box textAlign="center">
          <Typography variant="h5" gutterBottom>
            Verify Your Email
          </Typography>
          <Typography variant="body1" gutterBottom>
            We have sent a verification link to your email. Please check your inbox and click on the link to verify your account.
          </Typography>
          <Button variant="contained" color="primary" onClick={resendVerificationEmail} sx={{ marginTop: 2 }}>
            Resend Verification Email
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EmailVerificationPending;
