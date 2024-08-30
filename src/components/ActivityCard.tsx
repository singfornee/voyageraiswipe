import React from 'react';
import { IconButton, Box, Typography, Stack, Tooltip, Chip, Skeleton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Activity } from '../types/activity';
import { useTheme } from '@mui/material/styles';
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
  isSpotlight = false,
  mode,
}) => {
  const theme = useTheme();
  const imageUrl = activity.imageUrl || null;

  const keywords = typeof activity.activities_keywords === 'string'
    ? activity.activities_keywords.split(',').slice(0, 3)
    : [];

  return (
    <Box
      className={`activity-card ${isSpotlight ? 'spotlight-card' : ''} ${className}`}
      onClick={onClick}
    >
      {imageUrl ? (
        <Box className="image-container">
          <img
            src={imageUrl}
            alt={activity.activity_full_name}
            className="explore-activity-image"
            loading="lazy"
          />
          <Box className="image-overlay" />
        </Box>
      ) : (
        <Skeleton variant="rectangular" width="100%" height={240} animation="wave" />
      )}

      <Box className="activity-info">
        <Typography variant={isSpotlight ? 'h4' : 'h5'} className="activity-title">
          {activity.activity_full_name}
        </Typography>
        <Typography variant="subtitle1" className="attraction-name">
          {activity.attraction_name}
        </Typography>

        <Stack direction="row" spacing={1} className="chip-container">
          {keywords.map((keyword, index) => (
            <Chip key={index} label={keyword.trim()} className="keyword-chip" />
          ))}
        </Stack>

        {!isSpotlight && (
          <Typography variant="body2" className="activity-description">
            {activity.activity_description}
          </Typography>
        )}
      </Box>

      {isSpotlight && (
        <Stack direction="row" spacing={2} className="spotlight-buttons">
          <Tooltip title={isFavorite ? "Remove from Bucket List" : "Add to Bucket List"}>
            <IconButton
              className="bucket-list-button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToBucketList();
              }}
              style={{ color: isFavorite ? theme.palette.error.main : theme.palette.primary.main }}
            >
              {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title={isVisited ? "Remove from Visited" : "Mark as Visited"}>
            <IconButton
              className="visited-button"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsVisited();
              }}
              style={{ color: isVisited ? theme.palette.warning.main : theme.palette.secondary.main }}
            >
              {isVisited ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      )}

      {!isSpotlight && (
        <Box className="buttons-container">
          {onPass && (
            <Tooltip title="Pass">
              <IconButton
                className="pass-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPass();
                }}
              >
                <CloseIcon />
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
              style={{ color: isFavorite ? theme.palette.primary.main  : theme.palette.primary.main }}
            >
              {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title={isVisited ? "Remove from Visited" : "Mark as Visited"}>
            <IconButton
              className="visited-button"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsVisited();
              }}
              style={{ color: isVisited ? theme.palette.primary.main  : theme.palette.primary.main  }}
            >
              {isVisited ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default ActivityCard;
