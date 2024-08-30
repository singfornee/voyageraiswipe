import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  CircularProgress,
  Typography,
  Box,
  IconButton,
  SwipeableDrawer,
  useMediaQuery,
  Tooltip,
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
import { Activity } from '../types/activity';
import { fetchAttractionById } from '../firestore';
import { fetchAttractionPhoto } from '../api/unsplashApi';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import '../styles/FullScreenSwiper.css';

interface FullScreenSwiperProps {
  activities: Activity[];
  bucketList: Activity[];
  visitedList: Activity[];
}

const FullScreenSwiper: React.FC<FullScreenSwiperProps> = ({
  activities = [],
  bucketList,
  visitedList,
}) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const { currentUser } = useAuth();
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [attractionData, setAttractionData] = useState<{
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [imageWidth, setImageWidth] = useState<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const imageCache = useRef<{ [key: string]: string }>({});

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '', // Add your API key here
  });

  const currentActivity = activities.length > 0 ? activities[currentActivityIndex] : null;

  useEffect(() => {
    if (imageContainerRef.current) {
      const updateImageWidth = () => {
        setImageWidth(imageContainerRef.current?.clientWidth || null);
      };
      updateImageWidth();
      window.addEventListener('resize', updateImageWidth);
      return () => window.removeEventListener('resize', updateImageWidth);
    }
  }, [imageContainerRef.current]);

  const fetchActivityImage = useCallback(
    async (activity: Activity): Promise<string> => {
      if (imageCache.current[activity.activity_id]) {
        return imageCache.current[activity.activity_id];
      }

      const photoUrl =
        (await fetchAttractionPhoto(activity.activity_full_name || activity.activity_name || 'Unknown')) ||
        'default-image-url.jpg';
      imageCache.current[activity.activity_id] = photoUrl;
      return photoUrl;
    },
    []
  );

  

  useEffect(() => {
    const loadAttractionData = async () => {
      if (currentActivity && currentActivity.attraction_id) {
        try {
          const attraction = await fetchAttractionById(currentActivity.attraction_id);
          if (attraction) {
            setAttractionData({
              city: attraction.location_city || 'Unknown City',
              country: attraction.location_country || 'Unknown Country',
              latitude: parseFloat(attraction.latitude.toString()), // Convert to string then parse as float
              longitude: parseFloat(attraction.longitude.toString()), // Convert to string then parse as float
            });
          }
        } catch (error) {
          console.error('Failed to fetch attraction data:', error);
          toast.error('Failed to load attraction details.');
        }
      }
    };
  
    loadAttractionData();
  }, [currentActivity]);  

  const handleNextActivity = useCallback(() => {
    if (currentActivityIndex < activities.length - 1) {
      setCurrentActivityIndex((prevIndex) => prevIndex + 1);
      setDrawerOpen(false);  // Close drawer on next activity
    } else {
      toast.info('No more activities available.');
    }
  }, [activities, currentActivityIndex]);

  const handlePreviousActivity = useCallback(() => {
    if (currentActivityIndex > 0) {
      setCurrentActivityIndex((prevIndex) => prevIndex - 1);
      setDrawerOpen(false);  // Close drawer on previous activity
    }
  }, [currentActivityIndex]);

  const handleAddToBucketList = useCallback(async () => {
    if (currentActivity && currentUser) {
      try {
        const docId = `${currentUser.uid}_${currentActivity.activity_id}`;
        // Add to bucket list logic here

        toast.success(`${currentActivity.activity_full_name} added to bucket list!`);
        handleNextActivity();
      } catch (error) {
        toast.error('Failed to add to bucket list. Please try again.');
      }
    }
  }, [currentActivity, currentUser, handleNextActivity]);

  const handleMarkAsVisited = useCallback(async () => {
    if (currentActivity && currentUser) {
      try {
        const docId = `${currentUser.uid}_${currentActivity.activity_id}`;
        // Mark as visited logic here

        toast.success(`${currentActivity.activity_full_name} marked as visited!`);
        handleNextActivity();
      } catch (error) {
        toast.error('Failed to mark as visited. Please try again.');
      }
    }
  }, [currentActivity, currentUser, handleNextActivity]);

  const handleToggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const handleShare = useCallback(() => {
    if (navigator.share && currentActivity) {
      navigator.share({
        title: currentActivity.activity_full_name || 'Check this out!',
        text: `Check out this activity: ${currentActivity.activity_full_name}`,
        url: window.location.href, // You can change this to the specific URL of the activity if available
      })
      .then(() => console.log('Successfully shared'))
      .catch((error) => console.error('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      console.log('Web Share API not supported in this browser.');
      // Optionally, show a modal or other UI for copying the link or sharing manually
    }
  }, [currentActivity]);
  
  const getRandomKeywords = (keywords: string[] | string) => {
    const keywordArray = Array.isArray(keywords) ? keywords : keywords.split(',').map((kw) => kw.trim());
    const selectedKeywords = keywordArray.sort(() => 0.5 - Math.random()).slice(0, 3);
    return selectedKeywords;
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

  const selectedKeywords = currentActivity.activities_keywords
    ? getRandomKeywords(currentActivity.activities_keywords)
    : [];

  const location = attractionData
    ? `${attractionData.city}, ${attractionData.country}`
    : 'Location not available';

  const mapContainerStyle = {
    height: '200px',
    width: '100%',
  };

  const mapCenter = attractionData
    ? {
        lat: attractionData.latitude,
        lng: attractionData.longitude,
      }
    : { lat: 0, lng: 0 }; // Default center if location data isn't available

  return (
    <Box
      ref={imageContainerRef}
      sx={{
        position: 'relative',
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto',
        height: '100vh',
        backgroundColor: theme.palette.background.default,
        overflow: 'hidden',
        borderRadius: isLargeScreen ? '16px' : '0px',
        boxShadow: isLargeScreen ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none',
        touchAction: 'pan-y',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onTouchStart={(e) => {
        const startX = e.touches[0].clientX;
        const handleSwipe = (endX: number) => {
          if (startX - endX > 50) handleNextActivity(); // Swipe left
          if (endX - startX > 50) handlePreviousActivity(); // Swipe right
        };
        e.currentTarget.ontouchend = (ev) => handleSwipe(ev.changedTouches[0].clientX);
      }}
    >
      <img
        src={currentActivity.imageUrl || 'default-image-url.jpg'}
        alt={currentActivity.activity_full_name}
        style={{
          width: '100%',
          height: isLargeScreen ? 'auto' : '100%',
          maxHeight: isLargeScreen ? 'calc(100vh - 64px)' : '100%',
          objectFit: 'cover',
          borderRadius: isLargeScreen ? '16px' : '0px',
          transition: 'transform 0.3s ease-in-out',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to bottom, transparent, #000)`,
          borderRadius: isLargeScreen ? '16px' : '0px',
          zIndex: 1,
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
          borderBottomLeftRadius: isLargeScreen ? '16px' : '0px',
          borderBottomRightRadius: isLargeScreen ? '16px' : '0px',
          backdropFilter: 'blur(4px)',
          zIndex: 2,
        }}
      >
        {selectedKeywords.length > 0 && (
          <Typography
            variant="body2"
            color="white"
            sx={{
              fontWeight: 300,
              letterSpacing: '0.5px',
              textShadow: '0px 0px 8px rgba(0, 0, 0, 0.5)',
              marginBottom: '4px',
              display: 'flex',
              gap: '8px',
            }}
          >
            {selectedKeywords.map((keyword, index) => (
              <Box
                key={index}
                sx={{
                  padding: '2px 6px',
                  backgroundColor: theme.palette.secondary.main,
                  borderRadius: '12px',
                  display: 'inline-block',
                  fontSize: '0.875rem',
                }}
              >
                {keyword}
              </Box>
            ))}
          </Typography>
        )}
        <Typography
          variant="h5"
          color="white"
          sx={{
            fontWeight: 500,
            letterSpacing: '0.5px',
            textShadow: '0px 0px 12px rgba(0, 0, 0, 0.6)',
          }}
        >
          {currentActivity.attraction_name || currentActivity.activity_full_name}
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
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
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
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
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
            onClick={handleToggleDrawer(true)}
            sx={{
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
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
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
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
      </Box>
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
            width: imageWidth || '100%',
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

          {selectedKeywords.length > 0 && (
            <Box sx={{ marginTop: '16px' }}>
              <Typography variant="body2" color="textPrimary" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
                Keywords:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedKeywords.map((keyword, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      backgroundColor: theme.palette.grey[200],
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                    }}
                  >
                    {keyword}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </SwipeableDrawer>
    </Box>
  );
};

export default FullScreenSwiper;
