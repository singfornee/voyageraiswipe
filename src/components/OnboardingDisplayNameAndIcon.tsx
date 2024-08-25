import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Grid, IconButton, Tooltip, Paper, Snackbar, Alert, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme } from '../styles/theme';
import { useAuth, Profile } from '../contexts/AuthContext';

const OnboardingDisplayNameAndIcon: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { currentUser, profile, setProfile } = useAuth();
  const [displayName, setDisplayName] = useState<string>(profile.displayName);
  const [selectedIcon, setSelectedIcon] = useState<string>(profile.profileIcon);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true); // State to manage button enable/disable
  const profileIcons = ['/profile-icons/icon1.png', '/profile-icons/icon2.png', '/profile-icons/icon3.png', '/profile-icons/icon4.png'];

  useEffect(() => {
    if (currentUser) {
      const defaultDisplayName = currentUser.email ? currentUser.email.split('@')[0] : '';
      setDisplayName(defaultDisplayName);
    }
  }, [currentUser]);

  // Check if the form is valid
  useEffect(() => {
    if (displayName.length >= 3 && displayName.length <= 50 && selectedIcon) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [displayName, selectedIcon]);

  const handleNext = () => {
    const updatedProfile: Profile = {
      ...profile,
      displayName: displayName || profile.displayName || (currentUser?.email?.split('@')[0] || ''),
      profileIcon: selectedIcon || profile.profileIcon || profileIcons[Math.floor(Math.random() * profileIcons.length)],
      preferences: profile.preferences || [], 
    };
    setProfile(updatedProfile);
    setOpenSnackbar(true);
    onNext();
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          backgroundColor: 'background.default',
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            backgroundColor: 'background.paper',
            borderRadius: 8,
            boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '500px'
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            color="primary"
            sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4 }}
          >
            Set Your Profile
          </Typography>

          <TextField
            fullWidth
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            variant="outlined"
            placeholder="Enter your display name"
            sx={{
              mb: 3,
              backgroundColor: 'background.default',
              color: 'text.primary',
              borderRadius: '12px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'primary.main',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
            InputLabelProps={{
              sx: { color: 'text.secondary', fontSize: '1rem' },
            }}
          />

          <Typography
            variant="h6"
            sx={{ mb: 2, textAlign: 'center', color: 'text.primary' }}
          >
            Select Profile Icon
          </Typography>

          <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
            {profileIcons.map((icon, index) => (
              <Grid item key={index}>
                <Tooltip title={`Select icon ${index + 1}`}>
                  <IconButton
                    onClick={() => setSelectedIcon(icon)}
                    sx={{
                      border: selectedIcon === icon ? `2px solid` : '2px solid transparent',
                      borderColor: selectedIcon === icon ? 'primary.main' : 'transparent',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      transition: 'border-color 0.3s',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <img src={icon} alt={`Profile icon ${index + 1}`} width={60} height={60} style={{ borderRadius: '50%' }} />
                  </IconButton>
                </Tooltip>
              </Grid>
            ))}
          </Grid>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              borderRadius: '12px',
              padding: '12px 0',
              fontSize: '1rem',
              fontWeight: 'bold',
              '&:focus': {
                outline: 'none',
                boxShadow: '0 0 0 4px rgba(57, 255, 20, 0.5)',
              },
            }}
            onClick={handleNext}
            disabled={isButtonDisabled}
          >
            Continue
          </Button>
          <Typography
            variant="caption"
            sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'text.secondary' }}
          >
            Don’t worry, you can change these settings later!
          </Typography>
        </Paper>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            Profile updated successfully!
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default OnboardingDisplayNameAndIcon;
