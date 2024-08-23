import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Typography, IconButton, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, useTheme } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';
import { Activity } from '../types/activity';

interface BucketListCardProps {
  activity: Activity;
  onMarkAsVisited: (activityId: string) => void;
  onDelete: (activityId: string) => void;
  isVisitedCard?: boolean; // Add this prop to differentiate between visited and bucket list
}

const BucketListCard: React.FC<BucketListCardProps> = ({ activity, onMarkAsVisited, onDelete, isVisitedCard }) => {
  const theme = useTheme(); // Access the theme
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirmDelete = () => {
    onDelete(activity.activity_id);
    handleClose();
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
          backgroundColor: isVisitedCard ? theme.palette.secondary.main : theme.palette.background.paper, // Differentiate by color
          color: isVisitedCard ? theme.palette.secondary.contrastText : theme.palette.text.primary, // Adjust text color accordingly
        }}
      >
        <CardMedia
          component="img"
          sx={{ width: 180, height: 180, borderRadius: 2, margin: 1 }}
          image={activity.imageUrl || 'https://via.placeholder.com/180'}
          alt={activity.activity_full_name}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <CardContent sx={{ flex: '1 0 auto' }}>
            <Typography component="div" variant="h5" sx={{ fontWeight: 'bold' }}>
              {activity.activity_full_name}
            </Typography>
            <Typography variant="body1" sx={{ marginTop: 1 }}>
              {activity.activity_description}
            </Typography>
            <Typography variant="body2" sx={{ marginTop: 1 }}>
              Attraction ID: {activity.attraction_id}
            </Typography>
          </CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: 1, gap: 1 }}>
            {!isVisitedCard && (
              <IconButton
                onClick={() => onMarkAsVisited(activity.activity_id)}
                sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, '&:hover': { backgroundColor: theme.palette.primary.dark } }}
              >
                <StarIcon />
              </IconButton>
            )}
            <IconButton
              onClick={handleClickOpen}
              sx={{ backgroundColor: theme.palette.secondary.main, color: theme.palette.secondary.contrastText, '&:hover': { backgroundColor: theme.palette.secondary.dark } }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </Card>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this activity?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BucketListCard;
