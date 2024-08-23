// src/components/Logo.tsx
import React from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Logo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 25, // Adjust the position as needed
        left: 25, // Adjust the position as needed
        cursor: 'pointer',
      }}
      onClick={() => navigate('/')} // Navigate to home when the logo is clicked
    >
      <img src="/images/logo.png" alt="Logo" style={{ height: '40px' }} /> {/* Adjust height as needed */}
    </Box>
  );
};

export default Logo;
