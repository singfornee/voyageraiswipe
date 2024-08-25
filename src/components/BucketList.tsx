import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Container, Typography, Grid, TextField, IconButton,
  Select, MenuItem, FormControl, InputLabel, Box, Button, Paper, Tooltip, Collapse, Divider, InputAdornment
} from '@mui/material';
import { Search, FilterList, ClearAll, Clear, ExpandLess, ExpandMore } from '@mui/icons-material';
import { useBucketList } from '../contexts/BucketListContext';
import { useVisitedList } from '../contexts/VisitedListContext';
import BucketListItem from './BucketListItem';
import { Activity } from '../types/activity';
import { useAuth } from '../contexts/AuthContext';
import debounce from 'lodash.debounce';
import { useToastNotification, ToastNotificationContainer } from './notifications';
import '../styles/BucketList.css';
import { fetchAttractionById } from '../firestore';

interface EnhancedActivity extends Activity {
  location_city?: string;
  location_country?: string;
  attraction_category?: string;
}

const BucketList: React.FC = () => {
  const { bucketList, fetchBucketList, removeFromBucketList } = useBucketList();
  const { addToVisitedList } = useVisitedList();
  const [enhancedBucketList, setEnhancedBucketList] = useState<EnhancedActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const { currentUser } = useAuth();
  const { showSuccessToast, showErrorToast, showInfoToast } = useToastNotification();

  useEffect(() => {
    if (currentUser) {
      const fetchAndEnhanceBucketList = async () => {
        await fetchBucketList();
        const enhancedList: EnhancedActivity[] = await Promise.all(
          bucketList.map(async (activity) => {
            const attraction = await fetchAttractionById(activity.attraction_id);
            return {
              ...activity,
              location_city: attraction?.location_city || 'Unknown City',
              location_country: attraction?.location_country || 'Unknown Country',
              attraction_category: attraction?.attraction_category || 'Unknown Category',
            };
          })
        );
        setEnhancedBucketList(enhancedList);
      };
      
      fetchAndEnhanceBucketList();
    }
  }, [currentUser, fetchBucketList, bucketList]);

  const debouncedSetSearchTerm = useMemo(() => debounce(setSearchTerm, 300), []);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchTerm(event.target.value);
  }, [debouncedSetSearchTerm]);

  const handleMarkAsVisited = useCallback(
    (activityId: string) => {
      const activity = enhancedBucketList.find(item => item.activity_id === activityId);
      if (!activity) {
        showErrorToast(`Activity data is missing or incomplete for activityId: ${activityId}.`);
        return;
      }
      addToVisitedList(activity);
      removeFromBucketList(activityId);
      showSuccessToast(`${activity.activity_full_name || 'Activity'} marked as visited`);
    },
    [enhancedBucketList, addToVisitedList, removeFromBucketList, showSuccessToast, showErrorToast]
  );

  const handleDelete = useCallback(
    (activityId: string) => {
      if (!activityId) {
        showErrorToast('No activity ID provided for deletion.');
        return;
      }
      const activity = enhancedBucketList.find(item => item.activity_id === activityId);
      removeFromBucketList(activityId);
      showInfoToast(`${activity?.activity_full_name || 'Activity'} removed from bucket list`);
    },
    [enhancedBucketList, removeFromBucketList, showInfoToast, showErrorToast]
  );

  const handleClearFilters = () => {
    setSelectedCity('');
    setSelectedCountry('');
    setSelectedCategory('');
  };

  const filteredAndSortedBucketList = useMemo(() => {
    return enhancedBucketList
      .filter(item =>
        item.activity_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCity === '' || item.location_city === selectedCity) &&
        (selectedCountry === '' || item.location_country === selectedCountry) &&
        (selectedCategory === '' || item.attraction_category === selectedCategory)
      )
      .sort((a, b) => {
        const nameA = a.activity_full_name || '';
        const nameB = b.activity_full_name || '';
        return nameA.localeCompare(nameB);
      });
  }, [enhancedBucketList, searchTerm, selectedCity, selectedCountry, selectedCategory]);

  const cities = useMemo(() => Array.from(new Set(enhancedBucketList.map(item => item.location_city))), [enhancedBucketList]);
  const countries = useMemo(() => Array.from(new Set(enhancedBucketList.map(item => item.location_country))), [enhancedBucketList]);
  const categories = useMemo(() => Array.from(new Set(enhancedBucketList.map(item => item.attraction_category))), [enhancedBucketList]);

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
          <Grid container spacing={2} sx={{ mb: 2 }}>
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
                  onChange={(e) => setSelectedCountry(e.target.value)}
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
                  {countries.map(country => (
                    <MenuItem key={country} value={country}>{country}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth variant="outlined" sx={{ borderRadius: '16px' }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
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
                    selectedCategory && (
                      <Tooltip title="Clear">
                        <IconButton onClick={() => setSelectedCategory('')} size="small">
                          <Clear fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                >
                  <MenuItem value=""><em>All Categories</em></MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                startIcon={<ClearAll />}
                variant="outlined"
                color="secondary"
                onClick={handleClearFilters}
                fullWidth
                sx={{
                  borderRadius: '16px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                }}
              >
                Clear All Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>
      <Divider sx={{ mb: 4 }} />
      <Grid container spacing={3}>
        {filteredAndSortedBucketList.map((item: EnhancedActivity) => (
          <Grid item xs={12} key={item.activity_id}>
            <BucketListItem 
              activity={item} 
              onMarkAsVisited={handleMarkAsVisited} 
              onDelete={handleDelete} 
            />
          </Grid>
        ))}
      </Grid>
      <ToastNotificationContainer />
    </Container>
  );
};

export default BucketList;
