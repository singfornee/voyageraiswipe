import React, { useState, useEffect, useCallback } from 'react';
import { DatabaseItem } from '../types/databaseTypes';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  useTheme,
  Tooltip,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaceIcon from '@mui/icons-material/Place';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ActivityDetailsModal from './ActivityDetailsModal';
import { fetchAttractionPhoto } from '../api/unsplashApi'; // Ensure this path is correct

interface BucketListItemProps {
  activity: DatabaseItem;
  onMarkAsVisited: (activityId: string) => void;
  onDelete: (activityId: string) => void;
  onAddToBucketList: (activity: DatabaseItem) => Promise<void>;
  isVisited: boolean; // Add this line
}


const BucketListItem: React.FC<BucketListItemProps> = ({
  activity,
  onMarkAsVisited,
  onDelete,
  onAddToBucketList,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const theme = useTheme();

  const attraction = {
    attraction_id: activity.attraction_id,
    attraction_name: activity.attraction_name,
    location_city: activity.location_city,
    location_country: activity.location_country,
    opening_hour: activity.opening_hour,
  };

  // Fetch the image using Unsplash API
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const fetchedImageUrl = await fetchAttractionPhoto(activity.attraction_name);
        setImageUrl(fetchedImageUrl || 'https://via.placeholder.com/180');
      } catch (error) {
        console.error('Error fetching image:', error);
        setImageUrl('https://via.placeholder.com/180'); // Fallback
      }
    };

    fetchImage();
  }, [activity.attraction_name]);

  const handleMarkAsVisited = useCallback(() => {
    onMarkAsVisited(activity.activity_id);
  }, [activity.activity_id, onMarkAsVisited]);

  const handleDelete = useCallback(() => {
    onDelete(activity.activity_id);
  }, [activity.activity_id, onDelete]);

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
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
        }}
        onClick={handleCardClick}
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
          image={imageUrl || 'https://via.placeholder.com/180'} // Use the fetched image
          alt={activity.activity_full_name}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: 2 }}>
          <CardContent sx={{ flex: '1 0 auto' }}>
            <Typography
              component="div"
              variant="h5"
              sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
            >
              {activity.activity_full_name}
            </Typography>

            <Box
              sx={{
                display: 'inline-block',
                padding: '4px 8px',
                borderRadius: '12px',
                backgroundColor: theme.palette.secondary.light,
                color: theme.palette.secondary.contrastText,
                fontSize: '0.875rem',
                marginTop: '8px',
                fontWeight: '500',
              }}
            >
              {activity.attraction_subcategory}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
              <PlaceIcon sx={{ color: theme.palette.primary.main, marginRight: '8px', fontSize: '1.1rem' }} />
              <Typography variant="body1" color="text.secondary">
                {`${activity.location_city}, ${activity.location_country}`}
              </Typography>
            </Box>

            {keywords && (
              <Typography variant="body2" sx={{ marginTop: 0.5, color: theme.palette.text.secondary }}>
                {keywords}
              </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
              <LightbulbIcon sx={{ color: theme.palette.warning.main, marginRight: '8px', fontSize: '1.1rem' }} />
              <Typography variant="body2" color="text.secondary">
                {activity.secret_tip || 'No secret tip available'}
              </Typography>
            </Box>
          </CardContent>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', padding: 1, marginRight: 1 }}>
          <Tooltip title="Mark as Visited">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAsVisited();
              }}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                '&:hover': { backgroundColor: theme.palette.primary.dark },
                marginBottom: 1,
              }}
            >
              <StarIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete from Bucket List">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              sx={{
                backgroundColor: theme.palette.secondary.main,
                color: 'white',
                '&:hover': { backgroundColor: theme.palette.secondary.dark },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Card>

      {isModalOpen && (
        <ActivityDetailsModal
          open={isModalOpen}
          onClose={handleModalClose}
          activity={activity}
          attraction={attraction} // Pass the attraction object
          onAddToBucketList={onAddToBucketList} // Pass the function to add to bucket list
          onMarkAsVisited={handleMarkAsVisited} // Pass the function to mark as visited
        />
      )}
    </>
  );
};

export default BucketListItem;
