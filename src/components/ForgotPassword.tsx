import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box, Paper, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const { resetPassword } = useAuth() ?? {};
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!resetPassword) {
      setError('The reset password function is not available.');
      return;
    }

    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setMessage('Check your inbox for further instructions.');
    } catch (error) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      maxWidth="xs" 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <Paper 
        elevation={6} 
        sx={{ 
          padding: 4, 
          backgroundColor: 'background.paper', 
          borderRadius: 4, 
          width: '100%',
        }}
      >
        <Box textAlign="center" sx={{ mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your email address and we'll send you instructions to reset your password.
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          {error && <Alert severity="error">{error}</Alert>}
          {message && <Alert severity="success">{message}</Alert>}
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            margin="normal"
            variant="outlined"
            InputProps={{
              sx: {
                color: 'text.primary',
                backgroundColor: 'background.paper',
                borderRadius: '50px',
              },
            }}
            InputLabelProps={{
              sx: {
                color: 'text.secondary',
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ 
              marginTop: 2, 
              borderRadius: '50px',
              paddingY: 1.5,
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
        <Box textAlign="center" mt={2}>
          <Button 
            variant="text" 
            color="primary" 
            onClick={() => navigate('/signin')}
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
            }}
          >
            Back to Sign In
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
