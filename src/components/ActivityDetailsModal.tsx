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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceIcon from '@mui/icons-material/Place';
import CategoryIcon from '@mui/icons-material/Category';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import '../styles/ActivityDetailsModal.css';
import { Activity, Attraction } from '../types/activity';

interface ActivityDetailsModalProps {
  open: boolean;
  onClose: () => void;
  activity: Activity | null;
  attraction: Attraction | null;
  onAddToBucketList: () => void;
  onMarkAsVisited: () => void;
}

const MapComponent: React.FC<{ latitude: number; longitude: number }> = ({ latitude, longitude }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '', // Add your API key here
  });

  if (loadError) {
    console.error("Google Maps load error:", loadError);
    return <div>Error loading map</div>;
  }

  if (!isLoaded) return <div>Loading...</div>;

  const center = {
    lat: latitude,
    lng: longitude,
  };

  return (
    <GoogleMap
      center={center}
      zoom={14}
      mapContainerClassName="map-container"
    >
      <Marker position={center} />
    </GoogleMap>
  );
};

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

  useEffect(() => {
    if (attraction && attraction.latitude && attraction.longitude) {
      setMapCenter({
        lat: Number(attraction.latitude),
        lng: Number(attraction.longitude),
      });
    }
  }, [attraction]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!activity || !attraction) return null;

  return (
    <Modal open={open} onClose={handleClose} className="activity-details-modal">
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: 24,
          p: 4,
          borderRadius: 4,
          maxWidth: '600px',
          width: '90%',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          outline: 'none',
          overflowY: 'auto',
          maxHeight: '90vh',
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
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
          {activity.activity_full_name}
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            {mapCenter ? (
              <MapComponent latitude={mapCenter.lat} longitude={mapCenter.lng} />
            ) : (
              <Skeleton variant="rectangular" width="100%" height={300} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
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
              <Typography variant="body1">{attraction.attraction_category}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
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
              <Typography variant="body1">
                {attraction.location_city}, {attraction.location_country}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
              <Typography variant="body1">
                {attraction.opening_hour || 'Opening hours not available'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        <Typography
          variant="body2"
          sx={{
            mt: 2,
            lineHeight: 1.6,
            color: theme.palette.text.secondary,
          }}
        >
          {activity.activity_description}
        </Typography>
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
            onClick={onAddToBucketList}
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
            onClick={onMarkAsVisited}
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
