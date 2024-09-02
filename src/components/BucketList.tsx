import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Button,
  Paper,
  Tooltip,
  Collapse,
  Divider,
  InputAdornment,
} from '@mui/material';
import { Search, Clear, ExpandLess, ExpandMore } from '@mui/icons-material';
import { useBucketList } from '../contexts/BucketListContext';
import { useVisitedList } from '../contexts/VisitedListContext';
import BucketListItem from './BucketListItem';
import { DatabaseItem } from '../types/databaseTypes';
import { useAuth } from '../contexts/AuthContext';
import debounce from 'lodash.debounce';
import { useToastNotification } from '../contexts/NotificationContext';
import ToastNotificationContainer from './ToastNotificationContainer';
import '../styles/BucketList.css';

const BucketList: React.FC = () => {
  const { bucketList, fetchBucketList, removeFromBucketList } = useBucketList();
  const { visitedList, addToVisitedList } = useVisitedList();
  const { currentUser } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false); // State for popup visibility

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
        showErrorToast(`Activity data is missing for activityId: ${activityId}.`);
        return;
      }
      try {
        addToVisitedList(activity);
        removeFromBucketList(activityId);
        showSuccessToast(`${activity.activity_full_name || 'Activity'} marked as visited!`);
        setPopupOpen(true); // Open the popup
      } catch (error) {
        showErrorToast('Failed to mark as visited.');
      }
    },
    [bucketList, addToVisitedList, removeFromBucketList, showSuccessToast, showErrorToast]
  );

  const handleDelete = useCallback(
    (activityId: string) => {
      try {
        removeFromBucketList(activityId);
        showSuccessToast('Activity removed from bucket list.');
      } catch (error) {
        showErrorToast('Failed to delete activity from bucket list.');
      }
    },
    [removeFromBucketList, showSuccessToast, showErrorToast]
  );

  const handleClearFilters = () => {
    setSelectedCity('');
    setSelectedCountry('');
    setSelectedCategory('');
  };

  const filteredAndSortedBucketList = useMemo(() => {
    return bucketList
      .filter(item =>
        item.activity_full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCity === '' || item.location_city === selectedCity) &&
        (selectedCountry === '' || item.location_country === selectedCountry) &&
        (selectedCategory === '' || item.attraction_category === selectedCategory)
      )
      .sort((a, b) => a.activity_full_name.localeCompare(b.activity_full_name));
  }, [bucketList, searchTerm, selectedCity, selectedCountry, selectedCategory]);

  const cities = useMemo(() => Array.from(new Set(bucketList.map(item => item.location_city))), [bucketList]);
  const countries = useMemo(() => Array.from(new Set(bucketList.map(item => item.location_country))), [bucketList]);
  const categories = useMemo(() => Array.from(new Set(bucketList.map(item => item.attraction_category))), [bucketList]);

  return (
    <Container className="bucket-list-container">
      <Typography variant="h4" sx={{ mb: 2 }}>
        Your Bucket List
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Explore and manage your saved activities. Use the filters below to refine your list.
        </Typography>
        <Button
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          endIcon={filtersExpanded ? <ExpandLess /> : <ExpandMore />}
          sx={{
            textTransform: 'none',
            fontWeight: 'bold',
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.light',
              borderRadius: '16px',
            },
          }}
        >
          {filtersExpanded ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </Box>
      <Collapse in={filtersExpanded}>
        <Paper elevation={3} sx={{ p: 3, mb: 4, backgroundColor: 'background.paper', borderRadius: '16px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Search"
                variant="outlined"
                fullWidth
                onChange={handleSearchChange}
                sx={{
                  borderRadius: '16px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    backgroundColor: 'background.default',
                    '&:hover': {
                      backgroundColor: 'background.paper',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth variant="outlined" sx={{ borderRadius: '16px' }}>
                <InputLabel>City</InputLabel>
                <Select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  label="City"
                  sx={{
                    borderRadius: '16px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      backgroundColor: 'background.default',
                      '&:hover': {
                        backgroundColor: 'background.paper',
                      },
                    },
                  }}
                  endAdornment={
                    selectedCity && (
                      <Tooltip title="Clear">
                        <IconButton onClick={() => setSelectedCity('')} size="small">
                          <Clear fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                >
                  <MenuItem value=""><em>All Cities</em></MenuItem>
                  {cities.map(city => (
                    <MenuItem key={city} value={city}>{city}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth variant="outlined" sx={{ borderRadius: '16px' }}>
                <InputLabel>Country</InputLabel>
                <Select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value as string)}
                  label="Country"
                  sx={{
                    borderRadius: '16px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      backgroundColor: 'background.default',
                      '&:hover': {
                        backgroundColor: 'background.paper',
                      },
                    },
                  }}
                  endAdornment={
                    selectedCountry && (
                      <Tooltip title="Clear">
                        <IconButton onClick={() => setSelectedCountry('')} size="small">
                          <Clear fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                >
                  <MenuItem value=""><em>All Countries</em></MenuItem>
                  {countries.map((country: string) => (
                    <MenuItem key={country} value={country}>{country}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>
      <Divider sx={{ mb: 4 }} />
      <Grid container spacing={3}>
        {filteredAndSortedBucketList.map((activity) => (
          <Grid item xs={12} key={activity.activity_id}>
            <BucketListItem
              activity={activity}
              onMarkAsVisited={handleMarkAsVisited}
              onDelete={handleDelete}
              onAddToBucketList={async (activity) => {
                // Logic for adding to bucket list, e.g., API call
              }}
              isVisited={visitedList.some(item => item.activity_id === activity.activity_id)} // Check if visited
            />
          </Grid>
        ))}
      </Grid>
      <ToastNotificationContainer />
    </Container>
  );
};

export default BucketList;
