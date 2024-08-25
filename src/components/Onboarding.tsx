import React, { useState } from 'react';
import OnboardingDisplayNameAndIcon from './OnboardingDisplayNameAndIcon';
import OnboardingPreferences from './OnboardingPreferences';
import { Box, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => setStep(2);  // Only two steps, so direct step increment
  const handleFinish = () => navigate('/explore');  // Redirect after onboarding

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          mt: 4, 
          p: 3, 
          backgroundColor: 'background.paper', 
          borderRadius: '8px', 
          boxShadow: 3 
        }}
      >
        <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
          Welcome! Let's Get Started
        </Typography>
        {step === 1 ? (
          <OnboardingDisplayNameAndIcon onNext={handleNext} />
        ) : (
          <OnboardingPreferences onFinish={handleFinish} />
        )}
      </Box>
    </Container>
  );
};

export default Onboarding;
