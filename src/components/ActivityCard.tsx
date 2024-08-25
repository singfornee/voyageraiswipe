import React from 'react';
import { IconButton, Box, Typography, Stack, Tooltip, Chip, Skeleton } from '@mui/material';
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
  onPass?: () => void;
  onAddToBucketList: () => Promise<void>;
  onMarkAsVisited: () => Promise<void>;
  className?: string;
  onClick: () => void;
  isSpotlight?: boolean;
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

  // Extract and format the first three keywords as chips
  const keywords = typeof activity.activities_keywords === 'string'
    ? activity.activities_keywords.split(',').slice(0, 3)
    : [];

  return (
    <Box
      className={`activity-card ${isSpotlight ? 'spotlight-card' : ''} ${className}`}
      sx={{
        backgroundColor: 'background.paper',
        padding: isSpotlight ? '24px' : '16px',
        borderRadius: '16px',
        boxShadow: isSpotlight ? 8 : 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '&:hover': {
          boxShadow: isSpotlight ? 12 : 6,
          transform: isSpotlight ? 'scale(1.05)' : 'scale(1.02)',
        },
        height: isSpotlight ? '70vh' : 'auto',
        width: isSpotlight ? '100%' : '360px',
        maxWidth: isSpotlight ? '100%' : '360px',
        margin: isSpotlight ? '0 auto' : '0',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        overflow: 'hidden',
        backgroundImage: isSpotlight ? 'linear-gradient(to bottom, #f8f8f8, #e8e8e8)' : 'none',
      }}
      onClick={onClick}
    >
      {imageUrl ? (
        <Box
          className="image-container"
          sx={{
            height: isSpotlight ? '65%' : '240px',
            width: '100%',
            overflow: 'hidden',
            borderRadius: '12px',
            marginBottom: '20px',
            position: 'relative',
            '&:hover img': {
              transform: 'scale(1.1)',
              transition: 'transform 0.5s ease',
            },
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
              borderRadius: '12px',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0))',
              borderRadius: '12px',
            }}
          />
        </Box>
      ) : (
        <Skeleton variant="rectangular" width="100%" height={240} animation="wave" />
      )}

      <Box
        className="activity-info"
        sx={{
          textAlign: isSpotlight ? 'center' : 'left',
          width: '100%',
          marginBottom: isSpotlight ? '16px' : '0',
        }}
      >
        <Typography
          variant={isSpotlight ? 'h4' : 'h5'}
          className="activity-title"
          sx={{
            fontWeight: 'bold',
            fontSize: isSpotlight ? '2rem' : '1.5rem',
            color: '#fff',
            textShadow: '1px 1px 4px rgba(0, 0, 0, 0.6)', // Subtle text shadow for better readability
          }}
        >
          {activity.activity_full_name}
        </Typography>
        <Typography variant="subtitle1" className="attraction-name" sx={{ marginTop: '8px', color: 'rgba(255,255,255,0.85)' }}>
          {activity.attraction_name}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ marginTop: '8px', flexWrap: 'wrap' }}>
          {keywords.map((keyword, index) => (
            <Chip key={index} label={keyword.trim()} sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText', fontSize: '0.85rem' }} />
          ))}
        </Stack>

        {!isSpotlight && (
          <Typography
            variant="body2"
            className="activity-description"
            sx={{
              marginTop: '8px',
              color: 'text.secondary',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
              overflow: 'hidden',
            }}
          >
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
          <Tooltip title={isFavorite ? "Remove from Bucket List" : "Add to Bucket List"}>
            <IconButton
              className="bucket-list-button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToBucketList();
              }}
              sx={{ color: isFavorite ? 'primary.main' : 'text.secondary' }}
            >
              {isFavorite ? <FavoriteIcon sx={{ fontSize: 32 }} /> : <FavoriteBorderIcon sx={{ fontSize: 32 }} />}
            </IconButton>
          </Tooltip>
          <Tooltip title={isVisited ? "Remove from Visited" : "Mark as Visited"}>
            <IconButton
              className="visited-button"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsVisited();
              }}
              sx={{ color: isVisited ? 'secondary.main' : 'primary.main' }}
            >
              <StarIcon sx={{ fontSize: 32 }} />
            </IconButton>
          </Tooltip>
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
            borderTop: '1px solid rgba(0,0,0,0.1)',
            paddingTop: '12px',
          }}
        >
          {onPass && (
            <Tooltip title="Pass">
              <IconButton
                className="pass-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPass();
                }}
                sx={{ color: 'primary.main', transition: 'color 0.3s ease', '&:hover': { color: 'primary.dark' } }}
              >
                <CloseIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={isFavorite ? "Remove from Bucket List" : "Add to Bucket List"}>
            <IconButton
              className="bucket-list-button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToBucketList();
              }}
              sx={{ color: isFavorite ? 'secondary.main' : 'primary.main', transition: 'color 0.3s ease', '&:hover': { color: isFavorite ? 'secondary.dark' : 'primary.dark' } }}
            >
              {isFavorite ? <FavoriteIcon sx={{ fontSize: 28 }} /> : <FavoriteBorderIcon sx={{ fontSize: 28 }} />}
            </IconButton>
          </Tooltip>
          <Tooltip title={isVisited ? "Remove from Visited" : "Mark as Visited"}>
            <IconButton
              className="visited-button"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsVisited();
              }}
              sx={{ color: isVisited ? 'secondary.main' : 'primary.main', transition: 'color 0.3s ease', '&:hover': { color: isVisited ? 'secondary.dark' : 'primary.dark' } }}
            >
              <StarIcon sx={{ fontSize: 28 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default ActivityCard;
