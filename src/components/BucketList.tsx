import React, { useEffect, useState, useCallback } from 'react';
import { Container, Typography, Grid } from '@mui/material';
import { useBucketList } from '../contexts/BucketListContext';
import { useVisitedList } from '../contexts/VisitedListContext';
import BucketListItem from './BucketListItem';
import { Activity } from '../types/activity';
import { useAuth } from '../contexts/AuthContext'; // Import the useAuth hook
import '../styles/BucketList.css';

const BucketList: React.FC = () => {
  const { bucketList, fetchBucketList, removeFromBucketList } = useBucketList();
  const { addToVisitedList } = useVisitedList();
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth(); // Get currentUser from useAuth


  useEffect(() => {
    if (currentUser) {
      fetchBucketList(); // This should only fetch once when currentUser is defined or changes
    }
  }, [currentUser]); // Only re-run the effect if currentUser changes
  

  const handleMarkAsVisited = useCallback(
    (activityId: string) => {
      const activity = bucketList.find(item => item.activity_id === activityId);
      if (!activity) {
        setError(`Activity data is missing or incomplete for activityId: ${activityId}.`);
        return;
      }
      addToVisitedList(activity);
      removeFromBucketList(activityId);
    },
    [bucketList, addToVisitedList, removeFromBucketList]
  );

  const handleDelete = useCallback(
    (activityId: string) => {
      if (!activityId) {
        setError('No activity ID provided for deletion.');
        return;
      }
      removeFromBucketList(activityId);
    },
    [removeFromBucketList]
  );

  if (error) {
    console.error(error);
    return <div>{error}</div>;
  }

  return (
    <Container className="bucket-list-container">
      <Typography variant="h4" sx={{ mb: 3 }}>
        Your Bucket List
      </Typography>
      <Grid container spacing={3}>
        {bucketList.map((item: Activity) => {
          if (!item || !item.activity_id || !item.activity_full_name) {
            console.error('Activity data is missing or incomplete.', item);
            return null; // Skip this item if the data is incomplete
          }

          return (
            <Grid item xs={12} key={item.activity_id}>
              <BucketListItem 
                activity={item} 
                onMarkAsVisited={handleMarkAsVisited} 
                onDelete={handleDelete} 
              />
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default BucketList;
