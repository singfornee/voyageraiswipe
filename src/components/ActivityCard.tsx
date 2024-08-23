import React from 'react';
import { IconButton, Box, Typography, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import { Activity } from '../types/activity';
import '../styles/ActivityCard.css';

interface ActivityCardProps {
  activity: Activity;
  isFavorite: boolean;
  isVisited: boolean;
  onPass?: () => void; // Make onPass optional
  onAddToBucketList: () => Promise<void>;
  onMarkAsVisited: () => Promise<void>;
  className?: string;
  onClick: () => void;
  isSpotlight?: boolean; // Prop for distinguishing the spotlight
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
  isSpotlight = false,
}) => {
  const imageUrl = activity.imageUrl || null;

  return (
    <Box
      className={`activity-card ${isSpotlight ? 'spotlight-card' : ''} ${className}`}
      sx={{
        backgroundColor: 'background.paper',
        padding: isSpotlight ? '24px' : '16px',
        borderRadius: '16px',
        boxShadow: isSpotlight ? 4 : 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '&:hover': {
          boxShadow: isSpotlight ? 6 : 4,
          transform: isSpotlight ? 'scale(1.02)' : 'none',
        },
        height: isSpotlight ? '70vh' : 'auto', // Adjust height for spotlight
        width: isSpotlight ? '100%' : '300px', // Full width for spotlight card
        maxWidth: isSpotlight ? '100%' : '300px',
        margin: isSpotlight ? '0 auto' : '0',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      onClick={onClick}
    >
      {imageUrl ? (
        <Box
          className="image-container"
          sx={{
            height: isSpotlight ? '65%' : '180px',
            width: '100%', // Make the image take full width in spotlight
            overflow: 'hidden',
            borderRadius: '12px',
            marginBottom: '20px',
          }}
        >
          <img
            src={imageUrl}
            alt={activity.activity_full_name}
            className="explore-activity-image"
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
      ) : (
        <Box
          className="no-image"
          sx={{
            height: isSpotlight ? '65%' : '180px',
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          No Image Available
        </Box>
      )}

      <Box
        className="activity-info"
        sx={{
          textAlign: isSpotlight ? 'center' : 'left',
          width: '100%',
          marginBottom: isSpotlight ? '16px' : '0',
        }}
      >
        <Typography variant={isSpotlight ? 'h4' : 'h6'} className="activity-title" sx={{ fontWeight: 'bold' }}>
          {activity.activity_full_name}
        </Typography>
        <Typography variant="subtitle1" className="attraction-name" sx={{ marginTop: '8px', color: 'text.secondary' }}>
          {activity.attraction_name}
        </Typography>
        {!isSpotlight && (
          <Typography variant="body2" className="activity-description" sx={{ marginTop: '8px', color: 'text.secondary' }}>
            {activity.activity_description}
          </Typography>
        )}
      </Box>

      {isSpotlight && (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'auto',
            justifyContent: 'center',
          }}
        >
          <IconButton className="bucket-list-button" onClick={(e) => { e.stopPropagation(); onAddToBucketList(); }}>
            {isFavorite ? (
              <FavoriteIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            ) : (
              <FavoriteBorderIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            )}
          </IconButton>
          <IconButton className="visited-button" onClick={(e) => { e.stopPropagation(); onMarkAsVisited(); }}>
            <StarIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          </IconButton>
        </Stack>
      )}

      {!isSpotlight && (
        <Box
          className="buttons-container"
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: '16px',
            width: '100%',
          }}
        >
          {onPass && (
            <IconButton className="pass-button" onClick={(e) => { e.stopPropagation(); onPass(); }}>
              <CloseIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            </IconButton>
          )}
          <IconButton className="bucket-list-button" onClick={(e) => { e.stopPropagation(); onAddToBucketList(); }}>
            {isFavorite ? (
              <FavoriteIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            ) : (
              <FavoriteBorderIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            )}
          </IconButton>
          <IconButton className="visited-button" onClick={(e) => { e.stopPropagation(); onMarkAsVisited(); }}>
            <StarIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default ActivityCard;
