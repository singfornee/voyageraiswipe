import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Container, Typography, Grid, TextField, IconButton, Snackbar, Alert } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useBucketList } from '../contexts/BucketListContext';
import { useVisitedList } from '../contexts/VisitedListContext';
import BucketListItem from './BucketListItem';
import { Activity } from '../types/activity';
import { useAuth } from '../contexts/AuthContext';
import debounce from 'lodash.debounce';
import { useTheme } from '@mui/material/styles'; // Import useTheme for theme colors
import '../styles/BucketList.css';

const BucketList: React.FC = () => {
  const { bucketList, fetchBucketList, removeFromBucketList } = useBucketList();
  const { addToVisitedList } = useVisitedList();
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const theme = useTheme(); // Use the theme

  useEffect(() => {
    if (currentUser) {
      fetchBucketList();
    }
  }, [currentUser, fetchBucketList]);

  const debouncedSetSearchTerm = useMemo(() => debounce(setSearchTerm, 300), []);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchTerm(event.target.value);
  }, [debouncedSetSearchTerm]);

  const handleMarkAsVisited = useCallback(
    (activityId: string) => {
      const activity = bucketList.find(item => item.activity_id === activityId);
      if (!activity) {
        setError(`Activity data is missing or incomplete for activityId: ${activityId}.`);
        return;
      }
      addToVisitedList(activity);
      removeFromBucketList(activityId);
      setSnackbarSeverity('success');
      setSnackbarMessage(`${activity.activity_full_name || 'Activity'} marked as visited`);
    },
    [bucketList, addToVisitedList, removeFromBucketList]
  );

  const handleDelete = useCallback(
    (activityId: string) => {
      if (!activityId) {
        setError('No activity ID provided for deletion.');
        return;
      }
      const activity = bucketList.find(item => item.activity_id === activityId);
      removeFromBucketList(activityId);
      setSnackbarSeverity('info');
      setSnackbarMessage(`${activity?.activity_full_name || 'Activity'} removed from bucket list`);
    },
    [bucketList, removeFromBucketList]
  );

  const filteredAndSortedBucketList = useMemo(() => {
    return bucketList
      .filter(item =>
        item.activity_full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const nameA = a.activity_full_name || '';
        const nameB = b.activity_full_name || '';
        return nameA.localeCompare(nameB);
      });
  }, [bucketList, searchTerm]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarMessage(null);
  }, []);

  return (
    <Container className="bucket-list-container">
      <Typography variant="h4" sx={{ mb: 3 }}>
        Your Bucket List
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: (
                <IconButton>
                  <Search />
                </IconButton>
              ),
            }}
          />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {filteredAndSortedBucketList.map((item: Activity) => (
          <Grid item xs={12} key={item.activity_id}>
            <BucketListItem 
              activity={item} 
              onMarkAsVisited={handleMarkAsVisited} 
              onDelete={handleDelete} 
            />
          </Grid>
        ))}
      </Grid>
      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}  // Center the Snackbar
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{
            width: '100%',
            backgroundColor: theme.palette.background.paper, // Use theme background color
            color: theme.palette.text.primary, // Use theme text color
            border: `1px solid ${theme.palette.primary.main}`, // Border color from theme
            '& .MuiAlert-icon': {
              color: theme.palette.primary.main, // Icon color from theme
            },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BucketList;
