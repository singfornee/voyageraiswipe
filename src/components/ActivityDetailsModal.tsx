import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Grid,
  Button,
  useTheme,
  Tooltip,
  Skeleton,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceIcon from '@mui/icons-material/Place';
import CategoryIcon from '@mui/icons-material/Category';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TimerIcon from '@mui/icons-material/Timer';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import StarIcon from '@mui/icons-material/Star';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import '../styles/ActivityDetailsModal.css';
import { DatabaseItem } from '../types/databaseTypes';

interface ActivityDetailsModalProps {
  open: boolean;
  onClose: () => void;
  activity: DatabaseItem | null; // Ensure this is nullable if the activity can be null
  attraction: { // Make this required, assuming you'll always have attraction info when opening the modal
    attraction_id: string;
    attraction_name: string;
    location_city: string;
    location_country: string; // Ensure this property is passed
    opening_hour?: string; // Optional if it may not be present
  };
  onAddToBucketList: (activity: DatabaseItem) => void; // Change here
  onMarkAsVisited: (activity: DatabaseItem) => void; // Change here
}

const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
  open,
  onClose,
  activity,
  attraction,
  onAddToBucketList,
  onMarkAsVisited,
}) => {
  const theme = useTheme();
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '', // Replace with your actual API key
  });

  useEffect(() => {
    if (activity) {
      const lat = parseFloat(activity.latitude?.toString() || '0');
      const lng = parseFloat(activity.longitude?.toString() || '0');

      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter({ lat, lng });
      } else {
        console.error("Invalid latitude or longitude:", { lat, lng });
        setMapCenter(null);
      }
    }
  }, [activity]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!activity) return null;
  if (loadError) return <div>Error loading map</div>;
  if (!isLoaded) return <Skeleton variant="rectangular" width="100%" height={300} />;

  return (
    <Modal open={open} onClose={handleClose} className="activity-details-modal">
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: 24,
          p: 4,
          borderRadius: 4,
          maxWidth: '700px',
          width: '100%',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          outline: 'none',
          overflowY: 'auto',
          maxHeight: '90vh',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: theme.palette.text.secondary,
            '&:hover': {
              color: theme.palette.text.primary,
            },
            transition: 'color 0.3s ease',
          }}
          aria-label="Close"
        >
          <Tooltip title="Close">
            <CloseIcon />
          </Tooltip>
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
          {activity.activity_full_name}
        </Typography>
        {mapCenter ? (
          <GoogleMap
            center={mapCenter}
            zoom={14}
            mapContainerStyle={{
              width: '100%',
              height: '300px',
              borderRadius: '8px',
              marginTop: '16px',
            }}
          >
            <Marker position={mapCenter} />
          </GoogleMap>
        ) : (
          <Typography variant="body2" color="error" sx={{ mb: 2, textAlign: 'center' }}>
            Map not available due to invalid coordinates.
          </Typography>
        )}
        <Grid container spacing={2} alignItems="flex-start" sx={{ marginTop: '16px' }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Tooltip title="Category">
                <CategoryIcon
                  sx={{
                    color: theme.palette.primary.main,
                    marginRight: '8px',
                    '&:hover': {
                      color: theme.palette.primary.dark,
                    },
                    transition: 'color 0.3s ease',
                  }}
                />
              </Tooltip>
              <Typography variant="body1">{activity.attraction_category}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Tooltip title="Location">
                <PlaceIcon
                  sx={{
                    color: theme.palette.primary.main,
                    marginRight: '8px',
                    '&:hover': {
                      color: theme.palette.primary.dark,
                    },
                    transition: 'color 0.3s ease',
                  }}
                />
              </Tooltip>
              <Typography variant="body1">
                {activity.location_city}, {activity.location_country}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Tooltip title="Opening Hours">
                <AccessTimeIcon
                  sx={{
                    color: theme.palette.primary.main,
                    marginRight: '8px',
                    '&:hover': {
                      color: theme.palette.primary.dark,
                    },
                    transition: 'color 0.3s ease',
                  }}
                />
              </Tooltip>
              <Typography variant="body1">
                {activity.opening_hour ? activity.opening_hour : 'Opening hours not available'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Tooltip title="Duration">
                <TimerIcon
                  sx={{
                    color: theme.palette.primary.main,
                    marginRight: '8px',
                    '&:hover': {
                      color: theme.palette.primary.dark,
                    },
                    transition: 'color 0.3s ease',
                  }}
                />
              </Tooltip>
              <Typography variant="body1">
                {activity.min_duration} - {activity.max_duration}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Tooltip title="Price">
                <MonetizationOnIcon
                  sx={{
                    color: theme.palette.primary.main,
                    marginRight: '8px',
                    '&:hover': {
                      color: theme.palette.primary.dark,
                    },
                    transition: 'color 0.3s ease',
                  }}
                />
              </Tooltip>
              <Typography variant="body1">
                {activity.price} {activity.currency}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Unique Features">
                <LightbulbIcon sx={{ marginRight: '8px', color: theme.palette.warning.main }} />
              </Tooltip>
              Unique Features
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="body2" sx={{ mb: 1 }}>
              {activity.unique_feature_one || 'No unique feature available'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {activity.unique_feature_two || 'No unique feature available'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {activity.unique_feature_three || 'No unique feature available'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Secret Tip">
                <StarIcon sx={{ marginRight: '8px', color: theme.palette.warning.main }} />
              </Tooltip>
              Secret Tip
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="body2">
              {activity.secret_tip || 'No secret tip available'}
            </Typography>
          </Grid>
        </Grid>
        <Box
          sx={{
            mt: 3,
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            color="secondary"
            startIcon={<BookmarkBorderIcon />}
            sx={{
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: `0px 4px 12px ${theme.palette.secondary.main}`,
              },
            }}
            aria-label="Add to Bucket List"
            onClick={() => {
              if (activity) {
                onAddToBucketList(activity); // Pass the activity to the handler
              }
            }}
          >
            Add to Bucket List
          </Button>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<CheckCircleOutlineIcon />}
            sx={{
              transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                borderColor: theme.palette.primary.main,
                boxShadow: `0px 4px 12px ${theme.palette.primary.main}`,
              },
            }}
            aria-label="Mark as Visited"
            onClick={() => {
              if (activity) {
                onMarkAsVisited(activity); // Pass the activity to the handler
              }
            }}
          >
            Mark as Visited
          </Button>

          <Button
            variant="text"
            sx={{
              transition: 'color 0.3s ease, transform 0.3s ease, border-color 0.3s ease',
              color: theme.palette.text.primary,
              border: '1px solid transparent',
              borderRadius: '4px',
              padding: '6px 16px',
              backgroundColor: 'transparent',
              '&:hover': {
                color: theme.palette.error.main,
                borderColor: theme.palette.error.main,
                transform: 'scale(1.05)',
                backgroundColor: 'transparent',
              },
            }}
            aria-label="Cancel"
            onClick={handleClose}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ActivityDetailsModal;
