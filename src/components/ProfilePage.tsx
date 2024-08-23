import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, Grid, IconButton, Button, TextField, Tooltip, Snackbar } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';  // Ensure correct path and named import
import { db } from '../firebase';  // Ensure this is correct
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useTheme } from '@mui/material/styles';  // Correct use of the useTheme hook
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Ensure this is correctly exported from the file
const preferencesList = [
  'Fashion', 'Music', 'Photography', 'Art & Design', 'Architecture',
  'Culinary', 'History', 'Science', 'Craft & DIY', 'Cultural Heritage',
  'Nature', 'Sports', 'Shopping', 'Sustainability', 'Technology', 'Spirituality'
];

const ProfilePage: React.FC = () => {
  const { currentUser, setProfile } = useAuth();  // Ensure useAuth is correctly imported
  const [displayName, setDisplayName] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [profileIcons, setProfileIcons] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const theme = useTheme();  // Ensure theme is defined and in scope

  useEffect(() => {
    const fetchIcons = async () => {
      const icons = [
        '/profile-icons/icon1.png',
        '/profile-icons/icon2.png',
        '/profile-icons/icon3.png',
        '/profile-icons/icon4.png',
      ];
      setProfileIcons(icons);
    };

    const fetchUserData = async () => {
      if (currentUser) {
        const userDocRef = doc(db, 'userPreferences', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setDisplayName(data?.displayName || currentUser.displayName || '');
          setSelectedIcon(data?.icon || null);
          setSelectedPreferences(data?.preferences || []);
        }
      }
    };

    fetchIcons();
    fetchUserData();
  }, [currentUser]);

  const handleIconSelect = (icon: string) => setSelectedIcon(icon);

  const handlePreferenceToggle = (preference: string) => {
    setSelectedPreferences(prev =>
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const handleSave = useCallback(async () => {
    if (currentUser) {
      const userDocRef = doc(db, 'userPreferences', currentUser.uid);
      await setDoc(userDocRef, {
        displayName,
        icon: selectedIcon,
        preferences: selectedPreferences
      }, { merge: true });

      setProfile({
        displayName,
        profileIcon: selectedIcon || '',
      });

      setSnackbarOpen(true); // Show success notification
    }
  }, [currentUser, displayName, selectedIcon, selectedPreferences, setProfile]);

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <Container maxWidth="md" sx={{ padding: '32px' }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>Edit Profile</Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">Display Name</Typography>
        <TextField
          fullWidth
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          variant="outlined"
          placeholder="Enter your display name"
          sx={{
            mt: 1,
            borderRadius: '8px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Select Profile Icon</Typography>
        <Grid container spacing={2} justifyContent="center">
          {profileIcons.map((icon, index) => (
            <Grid item key={index}>
              <Tooltip title={`Select icon ${index + 1}`}>
                <IconButton 
                  onClick={() => handleIconSelect(icon)} 
                  sx={{ 
                    border: selectedIcon === icon ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    transition: 'border-color 0.3s',
                    '&:hover': { borderColor: theme.palette.primary.main }
                  }}
                >
                  <img src={icon} alt={`Profile icon ${index + 1}`} width={60} height={60} />
                </IconButton>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Your Preferences</Typography>
        <Grid container spacing={2}>
          {preferencesList.map((preference, index) => (
            <Grid item key={index}>
              <Button
                variant={selectedPreferences.includes(preference) ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => handlePreferenceToggle(preference)}
                sx={{
                  borderRadius: '30px',
                  textTransform: 'none',
                  transition: 'background-color 0.3s',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                  },
                }}
              >
                {preference}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box textAlign="center">
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSave}
          startIcon={<CheckCircleIcon />}
          sx={{
            borderRadius: '50px',
            paddingX: '24px',
            paddingY: '12px',
            fontSize: '16px',
            transition: 'background-color 0.3s',
          }}
        >
          Save Profile
        </Button>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message="Profile updated successfully!"
      />
    </Container>
  );
};

export default ProfilePage;
