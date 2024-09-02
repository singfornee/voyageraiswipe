import React, { useState, useEffect } from 'react';
import { IconButton, Box, Typography, Stack, Tooltip, Chip, Skeleton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { DatabaseItem } from '../types/databaseTypes';
import { useTheme } from '@mui/material/styles';
import '../styles/ActivityCard.css';
import { fetchAttractionPhoto } from '../api/unsplashApi';

interface ActivityCardProps {
  activity: DatabaseItem;
  isFavorite: boolean;
  isVisited: boolean;
  onPass?: () => void;
  onAddToBucketList: (activity: DatabaseItem) => Promise<void>;
  onMarkAsVisited: (activity: DatabaseItem) => Promise<void>;
  className?: string;
  onClick: () => void;
  mode: 'fullscreen' | 'grid';
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  isFavorite,
  isVisited,
  onPass,
  onAddToBucketList,
  onMarkAsVisited,
  onClick,
  className = '',
  mode,
}) => {
  const theme = useTheme();
  const [imageUrl, setImageUrl] = useState<string | null>(activity.imageUrl || null);
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const fetchedImageUrl = await fetchAttractionPhoto(activity.attraction_name);
        setImageUrl(fetchedImageUrl || 'https://via.placeholder.com/180');
      } catch (error) {
        console.error('Error fetching image:', error);
        setImageUrl('https://via.placeholder.com/180'); // Fallback
      } finally {
        setLoadingImage(false);
      }
    };

    fetchImage();
  }, [activity.attraction_name]);

  // Handle activities_keywords
  const keywords: string[] = Array.isArray(activity.activities_keywords)
    ? activity.activities_keywords.slice(0, 2) // Limit to 2 keywords
    : (typeof activity.activities_keywords === 'string'
      ? activity.activities_keywords.split(',').slice(0, 2).map(keyword => keyword.trim())
      : []);

  return (
    <Box
      className={`activity-card ${className}`}
      onClick={onClick}
      sx={{
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[3],
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.03)',
        },
        width: '100%', // Make card full width
        maxWidth: '400px', // Set a max width for the card
        height: 'auto', // Allow height to adjust automatically
      }}
    >
      {loadingImage ? (
        <Skeleton variant="rectangular" width="100%" height={250} animation="wave" />
      ) : (
        <Box className="image-container" sx={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
          <img
            src={imageUrl || 'default-image-url.jpg'}
            alt={activity.activity_full_name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
            onError={() => setImageUrl('default-image-url.jpg')}
          />
        </Box>
      )}

      <Box className="activity-info" sx={{ padding: '12px' }}>
        <Typography 
          variant='h6' 
          sx={{ 
            fontWeight: 600, 
            mb: 1, 
            overflow: 'hidden', 
            display: '-webkit-box', 
            WebkitLineClamp: 2, // Allow two lines
            WebkitBoxOrient: 'vertical', // Specify vertical orientation
          }}>
          {activity.activity_full_name}
        </Typography>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: theme.palette.text.secondary, 
            mb: 1,
            overflow: 'hidden', 
            display: '-webkit-box', 
            WebkitLineClamp: 2, // Allow two lines
            WebkitBoxOrient: 'vertical', // Specify vertical orientation
          }}>
          {activity.location_city}, {activity.location_country}
        </Typography>

        <Box sx={{ 
          mb: 2, 
          backgroundColor: theme.palette.background.default, 
          padding: '8px', 
          borderRadius: '8px',
          textAlign: 'center', // Center text for the keyword section
        }}>
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
            {keywords.map((keyword: string, index: number) => (
              <Chip 
                key={index} 
                label={keyword.trim()} 
                sx={{ fontSize: '0.75rem', height: '24px', borderRadius: '16px' }} 
              />
            ))}
          </Stack>
        </Box>

        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, maxHeight: '4em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {activity.activity_description}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-around', padding: '12px 0', borderTop: `1px solid ${theme.palette.divider}`, marginTop: 2 }}>
        {onPass && (
          <Tooltip title="Pass">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onPass();
              }}
              sx={{ color: theme.palette.error.main }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={isFavorite ? "Remove from Bucket List" : "Add to Bucket List"}>
          <IconButton
            onClick={async (e) => {
              e.stopPropagation();
              await onAddToBucketList(activity);
            }}
            sx={{ color: isFavorite ? theme.palette.primary.main : theme.palette.primary.main }}
          >
            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={isVisited ? "Remove from Visited" : "Mark as Visited"}>
          <IconButton
            onClick={async (e) => {
              e.stopPropagation();
              await onMarkAsVisited(activity);
            }}
            sx={{ color: isVisited ? theme.palette.primary.main : theme.palette.primary.main }}
          >
            {isVisited ? <StarIcon /> : <StarBorderIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ActivityCard;
