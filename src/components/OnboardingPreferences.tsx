import React, { useState } from 'react';
import { Button, Box, Typography, Grid, Paper, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth, Profile } from '../contexts/AuthContext';
import { darkTheme } from '../styles/theme'; // Import your dark theme

const preferencesList = [
  'Fashion', 'Music', 'Photography', 'Art & Design', 'Architecture',
  'Culinary', 'History', 'Science', 'Craft & DIY', 'Cultural Heritage',
  'Nature', 'Sports', 'Shopping', 'Sustainability', 'Technology', 'Spirituality'
];

const OnboardingPreferences: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const { profile, setProfile } = useAuth();
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(profile.preferences);
  const navigate = useNavigate(); // Initialize the navigate function

  const handleFinish = () => {
    const updatedProfile: Profile = {
      ...profile,
      preferences: selectedPreferences.length > 0 ? selectedPreferences : profile.preferences,
    };
    setProfile(updatedProfile);
    onFinish();
    navigate('/explore'); // Redirect to the home explore page after finishing onboarding
  };

  const handlePreferenceToggle = (preference: string) => {
    setSelectedPreferences(prev =>
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh', // Full viewport height
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center', // Center content vertically
          backgroundColor: 'background.default',
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            backgroundColor: 'background.paper',
            borderRadius: 6,
            boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '500px',
          }}
        >
          <Box textAlign="center" sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              color="primary"
              sx={{ fontWeight: 'bold' }}
            >
              Select Your Preferences
            </Typography>
          </Box>
          <Grid container spacing={2} justifyContent="center">
            {preferencesList.map((preference, index) => (
              <Grid item key={index} xs={6}>
                <Button
                  variant={selectedPreferences.includes(preference) ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => handlePreferenceToggle(preference)}
                  sx={{
                    borderRadius: '30px',
                    textTransform: 'none',
                    width: '100%',
                    paddingY: '8px', // More padding for better touch targets
                    fontWeight: 'bold',
                    backgroundColor: selectedPreferences.includes(preference) ? 'primary.main' : 'background.default',
                    '&:hover': {
                      backgroundColor: selectedPreferences.includes(preference) ? 'primary.dark' : 'background.default',
                      color: selectedPreferences.includes(preference) ? 'text.primary' : 'primary.main',
                    },
                  }}
                >
                  {preference}
                </Button>
              </Grid>
            ))}
          </Grid>

          <Button
            variant="contained"
            color="primary"
            sx={{
              mt: 4,
              borderRadius: '12px',
              padding: '12px 0',
              fontSize: '1rem',
              fontWeight: 'bold',
              '&:focus': {
                outline: 'none',
                boxShadow: '0 0 0 4px rgba(57, 255, 20, 0.5)',
              },
            }}
            onClick={handleFinish}
            fullWidth
          >
            Finish
          </Button>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default OnboardingPreferences;
