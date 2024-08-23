// src/components/BucketListItem.tsx

import React, { useEffect, useState } from 'react';
import useAttractionsCache from '../hooks/useAttractionsCache';  // Adjust the path as necessary
import { Activity, Attraction } from '../types/activity';  // Adjust the import paths
import { Card, CardContent, CardMedia, Typography, IconButton, Box, useTheme } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';

interface BucketListItemProps {
  activity: Activity;
  onMarkAsVisited: (activityId: string) => void;
  onDelete: (activityId: string) => void;
}

const BucketListItem: React.FC<BucketListItemProps> = ({ activity, onMarkAsVisited, onDelete }) => {
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const getAttraction = useAttractionsCache();
  const theme = useTheme();  // Use the theme

  useEffect(() => {
    const loadAttraction = async () => {
      if (activity.attraction_id) {
        const attractionData = await getAttraction(activity.attraction_id);
        setAttraction(attractionData);
      }
    };
    loadAttraction();
  }, [activity.attraction_id, getAttraction]);

  return (
    <Card sx={{ display: 'flex', flexDirection: 'row', marginBottom: 2, borderRadius: 3, boxShadow: 3, backgroundColor: theme.palette.background.paper }}>
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
            onClick={() => onMarkAsVisited(activity.activity_id)}
            sx={{ backgroundColor: theme.palette.primary.main, color: 'white', '&:hover': { backgroundColor: theme.palette.primary.dark } }}
          >
            <StarIcon />
          </IconButton>
          <IconButton
            onClick={() => onDelete(activity.activity_id)}
            sx={{ backgroundColor: theme.palette.secondary.main, color: 'white', '&:hover': { backgroundColor: theme.palette.secondary.dark } }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
};

export default BucketListItem;
