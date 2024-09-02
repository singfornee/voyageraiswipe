import React from 'react';
import { useVisitedList } from '../contexts/VisitedListContext';
import { useAuth } from '../contexts/AuthContext';
import VisitedListItem from '../components/VisitedListItem';
import { Box, Typography, Grid } from '@mui/material';

const Visited: React.FC = () => {
  const { visitedList, removeVisitedActivity } = useVisitedList();
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Typography variant="body1">Please log in to see your visited activities.</Typography>;
  }

  return (
    <Box sx={{ padding: '16px' }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Visited Activities
      </Typography>

      {visitedList.length === 0 ? (
        <Typography variant="body1">You haven't visited any activities yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {visitedList.map((activity) => (
            <Grid item xs={12} key={activity.activity_id}>
              <VisitedListItem
                activity={activity}
                userId={currentUser.uid}  // Pass the userId to VisitedListItem
                onDelete={() => removeVisitedActivity(activity.activity_id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Visited;
