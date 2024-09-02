import React, { useState, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  useTheme,
  Tooltip,
  Chip,
  Rating,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Avatar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaceIcon from '@mui/icons-material/Place';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { DatabaseItem } from '../types/databaseTypes';
import { updateActivityRating } from '../firestore'; // Adjust path based on your project structure
import { fetchAttractionPhoto } from '../api/unsplashApi'; // Function to fetch images from Unsplash

interface VisitedListItemProps {
  activity: DatabaseItem;
  userId: string;
  onDelete: (activityId: string) => void;
}

const VisitedListItem: React.FC<VisitedListItemProps> = ({ activity, userId, onDelete }) => {
  const theme = useTheme();
  const [rating, setRating] = useState(activity.rating || 0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null); // State for image URL

  // Fetch image based on attraction name
  useEffect(() => {
    const fetchImage = async () => {
      const fetchedImageUrl = await fetchAttractionPhoto(activity.attraction_name);
      setImageUrl(fetchedImageUrl || 'https://via.placeholder.com/180'); // Use a placeholder if fetching fails
    };

    fetchImage();
  }, [activity.attraction_name]); // Fetch when the attraction name changes

  const handleRatingChange = (event: React.SyntheticEvent, newRating: number | null) => {
    const finalRating = newRating || 0;
    setRating(finalRating);
    updateActivityRating(userId, activity.activity_id, finalRating);
  };

  const handleDelete = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const confirmDelete = () => {
    onDelete(activity.activity_id);
    setIsDialogOpen(false);
  };

  const cancelDelete = () => {
    setIsDialogOpen(false);
  };

  const keywords = Array.isArray(activity.activities_keywords)
    ? activity.activities_keywords.join(', ')
    : '';

  return (
    <>
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 2,
          borderRadius: 3,
          boxShadow: 3,
          backgroundColor: theme.palette.background.paper,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.03)',
            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
          },
          '&:active': {
            transform: 'scale(1.01)',
          },
        }}
      >
        <CardMedia
          component="img"
          sx={{
            width: 180,
            height: 180,
            borderRadius: 2,
            margin: 1,
            objectFit: 'cover',
            filter: 'brightness(95%)',
          }}
          image={imageUrl || 'https://via.placeholder.com/180'} // Use fetched image URL
          alt={activity.activity_full_name}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: 2 }}>
          <CardContent sx={{ flex: '1 0 auto' }}>
            <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, fontSize: '1.25rem' }}>
              {activity.activity_full_name}
            </Typography>
            <Chip
              label={activity.attraction_subcategory || 'No Subcategory'}
              sx={{
                marginTop: 1,
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText,
                fontWeight: 'bold',
                borderRadius: '8px',
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
              <PlaceIcon sx={{ color: theme.palette.primary.main, marginRight: '8px', fontSize: '1.1rem' }} />
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                {`${activity.location_city}, ${activity.location_country}`}
              </Typography>
            </Box>
            <Rating
              name="activity-rating"
              value={rating}
              onChange={handleRatingChange}
              size="large"
              sx={{ marginTop: 2 }}
            />
          </CardContent>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            padding: 1,
            marginRight: 1,
          }}
        >
          <Tooltip title="Delete from Visited List">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              sx={{
                backgroundColor: theme.palette.secondary.main,
                color: 'white',
                '&:hover': { backgroundColor: theme.palette.secondary.dark },
                transition: 'background-color 0.3s ease, transform 0.3s ease',
                '&:active': {
                  transform: 'scale(0.95)',
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={cancelDelete}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: 2,
            backgroundColor: theme.palette.background.default,
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: theme.palette.warning.main,
              width: 56,
              height: 56,
            }}
          >
            <WarningAmberIcon sx={{ fontSize: '2rem', color: theme.palette.warning.contrastText }} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            Confirm Deletion
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: theme.palette.text.secondary }}>
            Are you sure you want to delete this activity from your visited list? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', padding: '16px 24px' }}>
          <Button
            onClick={cancelDelete}
            sx={{
              borderRadius: '16px',
              textTransform: 'none',
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.action.hover,
              '&:hover': {
                backgroundColor: theme.palette.action.selected,
              },
              padding: '8px 8px',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            sx={{
              borderRadius: '16px',
              textTransform: 'none',
              backgroundColor: theme.palette.error.main,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.palette.error.dark,
              },
              padding: '8px 16px',
              marginLeft: 2,
            }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VisitedListItem;
