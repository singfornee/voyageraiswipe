import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Slider from 'react-slick';
import axios from 'axios';
import '../styles/ActivityDetailsModal.css';
import { Activity } from '../types/activity';

interface ActivityDetailsModalProps {
  open: boolean;
  onClose: () => void;
  activity: Activity | null;
  attractionName: string;
  attractionCategory: string;
  attractionLocation: string;
  openingHours: string;
  onAddToBucketList: () => void;
  onMarkAsVisited: () => void;
}

const imageCache: { [key: string]: string[] } = {};

const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
  open,
  onClose,
  activity,
  attractionCategory,
  attractionLocation,
  openingHours,
  onAddToBucketList,
  onMarkAsVisited,
}) => {
  const theme = useTheme();
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (activity && activity.attraction_name) {
      const attractionName = activity.attraction_name;
      const cachedImages = imageCache[attractionName];
      if (cachedImages) {
        setImages(cachedImages);
      } else {
        axios
          .get('https://api.unsplash.com/search/photos', {
            params: { query: attractionName, per_page: 5 },
            headers: {
              Authorization: `Client-ID ${process.env.REACT_APP_UNSPLASH_ACCESS_KEY}`,
            },
          })
          .then((response) => {
            const imageUrls = response.data.results.map((img: any) => img.urls.regular);
            setImages(imageUrls);
            imageCache[attractionName] = imageUrls;
          })
          .catch((error) => {
            console.error('Error fetching images from Unsplash:', error);
            setError(true);
          });
      }
    }
  }, [activity]);

  const carouselSettings = useMemo(
    () => ({
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      adaptiveHeight: true,
      arrows: true,
      prevArrow: <ArrowBackIosIcon sx={{ color: theme.palette.primary.main }} />,
      nextArrow: <ArrowForwardIosIcon sx={{ color: theme.palette.primary.main }} />,
    }),
    [theme]
  );

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!activity) return null;

  const imageStyles: React.CSSProperties = {
    borderRadius: '10px',
    width: '100%',
    height: 'auto',
    maxHeight: '300px',
    objectFit: 'cover' as 'cover',
    marginBottom: '16px',
    border: `1px solid ${theme.palette.divider}`,
  };

  const LazyImage = ({ src, alt }: { src: string; alt: string }) => (
    <img loading="lazy" src={src} alt={alt} style={imageStyles} />
  );

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
            {error ? (
              <Typography color="error">Failed to load images. Please try again later.</Typography>
            ) : images.length > 0 ? (
              <Slider {...carouselSettings}>
                {images.map((image, index) => (
                  <LazyImage key={index} src={image} alt={`${activity.activity_full_name} image ${index + 1}`} />
                ))}
              </Slider>
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
              <Typography variant="body1">{attractionCategory}</Typography>
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
              <Typography variant="body1">{attractionLocation}</Typography>
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
                {openingHours || 'Opening hours not available'}
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
    gap: 2, // Add consistent spacing between buttons
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
        boxShadow: `0px 4px 12px ${theme.palette.secondary.main}`, // Add a subtle shadow on hover
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
        boxShadow: `0px 4px 12px ${theme.palette.primary.main}`, // Add a subtle shadow on hover
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
    border: '1px solid transparent', // Transparent border initially
    borderRadius: '4px', // Optional: Add a border-radius for a smoother look
    padding: '6px 16px', // Add padding for a better click target
    backgroundColor: 'transparent', // Ensure no background color
    '&:hover': {
      color: theme.palette.error.main,
      borderColor: theme.palette.error.main, // Change border color on hover
      transform: 'scale(1.05)', // Consistent scale on hover
      backgroundColor: 'transparent', // Ensure background stays transparent on hover
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
