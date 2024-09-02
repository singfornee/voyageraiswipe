import React, { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import {
  Typography,
  Box,
  IconButton,
  SwipeableDrawer,
  Tooltip,
  Button,
} from '@mui/material';
import {
  FavoriteBorder,
  StarBorder,
  Info,
  Share,
  AccessTime,
  AttachMoney,
  LocationOn,
  Close,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { DatabaseItem } from '../types/databaseTypes';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useMediaQuery } from '@mui/material';
import { fetchAttractionPhoto } from '../api/unsplashApi';
import { useSwipeable } from 'react-swipeable';
import { motion } from 'framer-motion';
import '../styles/FullScreenSwiper.css';

// Lazy load ActivityDetailsModal
const ActivityDetailsModal = lazy(() => import('./ActivityDetailsModal'));

interface FullScreenSwiperProps {
  activities: DatabaseItem[];
  bucketList: DatabaseItem[];
  visitedList: DatabaseItem[];
  onAddToBucketList: (activity: DatabaseItem) => Promise<void>;
  onMarkAsVisited: (activity: DatabaseItem) => Promise<void>;
}

const FullScreenSwiper: React.FC<FullScreenSwiperProps> = ({
  activities = [],
  bucketList,
  visitedList,
  onAddToBucketList,
  onMarkAsVisited,
}) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if the screen is small
  const { currentUser } = useAuth();
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [attractionData, setAttractionData] = useState<{
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  const currentActivity = activities.length > 0 ? activities[currentActivityIndex] : null;

  useEffect(() => {
    const loadAttractionData = () => {
      if (currentActivity && currentActivity.attraction_id) {
        setAttractionData({
          city: currentActivity.location_city || 'Unknown City',
          country: currentActivity.location_country || 'Unknown Country',
          latitude: parseFloat(currentActivity.latitude.toString()),
          longitude: parseFloat(currentActivity.longitude.toString()),
        });

        const fetchImage = async () => {
          try {
            const fetchedImageUrl = await fetchAttractionPhoto(currentActivity.attraction_name);
            setImageUrl(fetchedImageUrl || 'https://via.placeholder.com/800');
          } catch (error) {
            console.error('Error fetching image:', error);
            setImageUrl('https://via.placeholder.com/800');
          }
        };

        fetchImage();
      }
    };

    loadAttractionData();
  }, [currentActivity]);

  const handleNextActivity = useCallback(() => {
    if (currentActivityIndex < activities.length - 1) {
      setCurrentActivityIndex((prevIndex) => prevIndex + 1);
      setDrawerOpen(false);
    } else {
      toast.info('No more activities available.');
    }
  }, [activities, currentActivityIndex]);

  const handlePreviousActivity = useCallback(() => {
    if (currentActivityIndex > 0) {
      setCurrentActivityIndex((prevIndex) => prevIndex - 1);
      setDrawerOpen(false);
    } else {
      toast.info('You are at the first activity.');
    }
  }, [currentActivityIndex]);

  const handleAddToBucketList = useCallback(async () => {
    if (currentActivity && currentUser) {
      try {
        await onAddToBucketList(currentActivity);
        toast.success(`${currentActivity.activity_full_name} added to bucket list!`);
        handleNextActivity();
      } catch (error) {
        toast.error('Failed to add to bucket list. Please try again.');
      }
    }
  }, [currentActivity, currentUser, handleNextActivity, onAddToBucketList]);

  const handleMarkAsVisited = useCallback(async () => {
    if (currentActivity && currentUser) {
      try {
        await onMarkAsVisited(currentActivity);
        toast.success(`${currentActivity.activity_full_name} marked as visited!`);
        handleNextActivity();
      } catch (error) {
        toast.error('Failed to mark as visited. Please try again.');
      }
    }
  }, [currentActivity, currentUser, handleNextActivity, onMarkAsVisited]);

  const handleToggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const handleShare = useCallback(() => {
    if (navigator.share && currentActivity) {
      navigator.share({
        title: currentActivity.activity_full_name || 'Check this out!',
        text: `Check out this activity: ${currentActivity.activity_full_name}`,
        url: window.location.href,
      })
      .then(() => console.log('Successfully shared'))
      .catch((error) => console.error('Error sharing:', error));
    } else {
      console.log('Web Share API not supported in this browser.');
    }
  }, [currentActivity]);

  const handleCancel = () => {
    setDrawerOpen(false); // Close the drawer when cancel is clicked
  };

  if (!currentActivity) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="textSecondary">
          No more activities available.
        </Typography>
      </Box>
    );
  }

  const location = useMemo(() => {
    return attractionData
      ? `${attractionData.city}, ${attractionData.country}`
      : 'Location not available';
  }, [attractionData]);

  const mapContainerStyle = {
    height: isMobile ? '150px' : '200px', // Adjust map height based on screen size
    width: '100%',
  };

  const mapCenter = attractionData
    ? {
        lat: attractionData.latitude,
        lng: attractionData.longitude,
      }
    : { lat: 0, lng: 0 };

  // Handle swipe gestures
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => handleNextActivity(),
    onSwipedDown: () => handlePreviousActivity(),
    trackMouse: true, // Optional: allows mouse swiping
  });

  return (
    <Box
      {...swipeHandlers}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        backgroundColor: theme.palette.background.default,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <img
            src={imageUrl || 'https://via.placeholder.com/800'}
            alt={currentActivity.activity_full_name}
            loading="lazy" // Lazy loading
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '16px',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 2,
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px',
            }}
          >
            <Typography
              variant="h5"
              color="white"
              sx={{
                fontWeight: 500,
                letterSpacing: '0.5px',
                textShadow: '0px 0px 12px rgba(0, 0, 0, 0.6)',
              }}
            >
              {currentActivity.activity_full_name}
            </Typography>
            <Typography
              variant="body2"
              color="white"
              sx={{
                fontWeight: 300,
                letterSpacing: '0.5px',
                textShadow: '0px 0px 8px rgba(0, 0, 0, 0.5)',
              }}
            >
              {location}
            </Typography>
          </Box>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              right: '16px',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              zIndex: 2,
            }}
          >
            <Tooltip title="Add to Bucket List">
              <IconButton
                onClick={handleAddToBucketList}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '50%',
                  transition: 'background-color 0.3s ease, transform 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <FavoriteBorder />
              </IconButton>
            </Tooltip>
            <Tooltip title="Mark as Visited">
              <IconButton
                onClick={handleMarkAsVisited}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '50%',
                  transition: 'background-color 0.3s ease, transform 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <StarBorder />
              </IconButton>
            </Tooltip>
            <Tooltip title="More Info">
              <IconButton
                onClick={() => setModalOpen(true)}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '50%',
                  transition: 'background-color 0.3s ease, transform 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <Info />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton
                onClick={handleShare}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '50%',
                  transition: 'background-color 0.3s ease, transform 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <Share />
              </IconButton>
            </Tooltip>
            <Tooltip title="Skip">
              <IconButton
                onClick={() => {
                  handleNextActivity(); // Skip to the next activity
                  setModalOpen(false);  // Close the modal
                }}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 0, 0, 0.5)', // Red background for skip action
                  borderRadius: '50%',
                  transition: 'background-color 0.3s ease, transform 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 0, 0, 0.7)', // Darker red on hover
                    transform: 'scale(1.1)', // Slightly enlarge on hover
                  },
                }}
              >
                <Close /> {/* Using Close icon for the skip action */}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </motion.div>

      <SwipeableDrawer
        anchor="bottom"
        open={drawerOpen}
        onClose={handleToggleDrawer(false)}
        onOpen={handleToggleDrawer(true)}
        sx={{
          '& .MuiPaper-root': {
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            padding: '16px',
            backgroundColor: theme.palette.background.default,
            width: '100%',
            maxHeight: '60vh',
            overflowY: 'auto',
            margin: '0 auto',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.grey[400],
              borderRadius: '8px',
            },
          },
        }}
      >
        <Box sx={{ padding: '16px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Typography variant="h6" color="textPrimary">
              {currentActivity.activity_full_name}
            </Typography>
            <IconButton onClick={handleToggleDrawer(false)}>
              <Close />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <AccessTime sx={{ color: theme.palette.primary.main, marginRight: '8px' }} />
            <Typography variant="body2" color="textSecondary">
              Duration: {currentActivity.min_duration} - {currentActivity.max_duration} hours
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <AttachMoney sx={{ color: theme.palette.primary.main, marginRight: '8px' }} />
            <Typography variant="body2" color="textSecondary">
              Price: {currentActivity.price ? `$${currentActivity.price} ${currentActivity.currency}` : 'Free'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <LocationOn sx={{ color: theme.palette.primary.main, marginRight: '8px' }} />
            <Typography variant="body2" color="textSecondary">
              Location: {location}
            </Typography>
          </Box>

          {isLoaded && attractionData && (
            <Box sx={{ marginBottom: '16px' }}>
              <GoogleMap mapContainerStyle={mapContainerStyle} zoom={14} center={mapCenter}>
                <Marker position={mapCenter} />
              </GoogleMap>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      </SwipeableDrawer>

      <Suspense fallback={<div>Loading...</div>}>
        <ActivityDetailsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          activity={currentActivity}
          attraction={{
            attraction_id: currentActivity.attraction_id,
            attraction_name: currentActivity.activity_full_name,
            location_city: currentActivity.location_city,
            location_country: currentActivity.location_country,
          }}
          onAddToBucketList={handleAddToBucketList}
          onMarkAsVisited={handleMarkAsVisited}
        />
      </Suspense>
    </Box>
  );
};

export default FullScreenSwiper;
