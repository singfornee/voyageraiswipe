import React from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Grid,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceIcon from '@mui/icons-material/Place';
import CategoryIcon from '@mui/icons-material/Category';
import { Activity } from '../types/activity';
import '../styles/ActivityDetailsModal.css';

interface ActivityDetailsModalProps {
  open: boolean;
  onClose: () => void;
  activity: Activity | null;
  attractionName: string;
  attractionCategory: string;
  attractionLocation: string;
  openingHours: string;
}

const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
  open,
  onClose,
  activity,
  attractionName,
  attractionCategory,
  attractionLocation,
  openingHours,
}) => {
  const theme = useTheme(); // Access the theme here
  if (!activity) return null;

  return (
    <Modal open={open} onClose={onClose} className="activity-details-modal">
      <Box
        className="modal-content"
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
          transform: 'translate(-50%, -50%)', // Centers the modal
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          {activity.activity_full_name}
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <img
              src={activity.imageUrl || 'default-image-url.jpg'}
              alt={activity.activity_full_name}
              className="modal-image"
              style={{
                borderRadius: '10px',
                width: '100%',
                height: 'auto',
                maxHeight: '300px',
                objectFit: 'cover',
                marginBottom: '16px',
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} className="modal-info">
            <CategoryIcon className="modal-icon" sx={{ color: theme.palette.primary.main }} /> {/* Icon using primary color */}
            <Typography variant="body1">{attractionCategory}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} className="modal-info">
            <PlaceIcon className="modal-icon" sx={{ color: theme.palette.primary.main }} /> {/* Icon using primary color */}
            <Typography variant="body1">{attractionLocation}</Typography>
          </Grid>
          <Grid item xs={12} className="modal-info">
            <AccessTimeIcon className="modal-icon" sx={{ color: theme.palette.primary.main }} /> {/* Icon using primary color */}
            <Typography variant="body1">
              {openingHours || 'Opening hours not available'}
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="body2" sx={{ mt: 2 }}>
          {activity.activity_description}
        </Typography>
      </Box>
    </Modal>
  );
};

export default ActivityDetailsModal;
