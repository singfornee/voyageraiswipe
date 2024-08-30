import React, { useEffect, useState, useCallback, useMemo } from 'react';
import useAttractionsCache from '../hooks/useAttractionsCache';
import { Activity, Attraction } from '../types/activity';
import { Card, CardContent, CardMedia, Typography, IconButton, Box, useTheme } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';
import ActivityDetailsModal from './ActivityDetailsModal';

interface BucketListItemProps {
  activity: Activity;
  onMarkAsVisited: (activityId: string) => void;
  onDelete: (activityId: string) => void;
}

const BucketListItem: React.FC<BucketListItemProps> = ({ activity, onMarkAsVisited, onDelete }) => {
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const getAttraction = useAttractionsCache();
  const theme = useTheme();

  // Load attraction data with caching
  useEffect(() => {
    const loadAttraction = async () => {
      if (activity.attraction_id) {
        const attractionData = await getAttraction(activity.attraction_id);
        setAttraction(attractionData);
      }
    };
    loadAttraction();
  }, [activity.attraction_id, getAttraction]);

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

  return (
    <>
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'row',
          marginBottom: 2,
          borderRadius: 3,
          boxShadow: 3,
          backgroundColor: theme.palette.background.paper,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
          },
        }}
        onClick={handleCardClick}
      >
        <CardMedia
          component="img"
          sx={{ width: 180, height: 180, borderRadius: 2, margin: 1 }}
          image={activity.imageUrl || 'https://via.placeholder.com/180'}
          alt={activity.activity_full_name}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <CardContent sx={{ flex: '1 0 auto' }}>
            <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
              {activity.activity_full_name}
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div" sx={{ marginTop: 1 }}>
              {activity.activity_description}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1 }}>
              {attraction ? `${attraction.location_city}, ${attraction.location_country}` : 'Loading...'}
            </Typography>
          </CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: 1, gap: 1 }}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAsVisited();
              }}
              sx={{ backgroundColor: theme.palette.primary.main, color: 'white', '&:hover': { backgroundColor: theme.palette.primary.dark } }}
            >
              <StarIcon />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              sx={{ backgroundColor: theme.palette.secondary.main, color: 'white', '&:hover': { backgroundColor: theme.palette.secondary.dark } }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </Card>

      {isModalOpen && (
        <ActivityDetailsModal
          open={isModalOpen}
          onClose={handleModalClose}
          activity={activity}
          attraction={attraction}
          onAddToBucketList={() => {}}
          onMarkAsVisited={() => {}}
        />
      )}
    </>
  );
};

export default BucketListItem;
