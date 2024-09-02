import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Grid } from '@mui/material';
import { useBucketList } from '../contexts/BucketListContext';
import { useVisitedList } from '../contexts/VisitedListContext';
import ActivityCard from './ActivityCard';
import ActivityDetailsModal from './ActivityDetailsModal';
import FullScreenSwiper from './FullScreenSwiper';
import { DatabaseItem } from '../types/databaseTypes';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { useToastNotification } from '../contexts/NotificationContext'; 
import ToastNotificationContainer from './ToastNotificationContainer'; 
import { fetchActivitiesFromFirestore } from '../firestore';
import '../styles/Explore.css';

const Explore: React.FC = () => {
  const { bucketList, addToBucketList, removeFromBucketList } = useBucketList();
  const { visitedList, addToVisitedList, removeVisitedActivity } = useVisitedList();

  const [mode, setMode] = useState<'grid' | 'fullscreen'>('grid');
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<DatabaseItem[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentActivity, setCurrentActivity] = useState<DatabaseItem | null>(null);
  const [currentAttraction, setCurrentAttraction] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showSuccessToast, showErrorToast } = useToastNotification(); 

  useEffect(() => {
    loadMoreActivities();
  }, []);

  const loadMoreActivities = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const { activities: newActivities, lastVisible: newLastVisible } = await fetchActivitiesFromFirestore(lastVisible, 18);
      const uniqueActivities = newActivities.filter(
        (activity) => !activities.some((existingActivity) => existingActivity.activity_id === activity.activity_id)
      );

      setActivities((prev) => [...prev, ...uniqueActivities]);
      setLastVisible(newLastVisible);
      setHasMore(newActivities.length > 0);
    } catch (error) {
      console.error('Error fetching activities:', error);
      showErrorToast('Failed to load activities. Please try again later.'); 
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBucketList = useCallback(async (activity: DatabaseItem) => {
    try {
      await addToBucketList(activity);
      showSuccessToast(`${activity.activity_full_name} added to Bucket List!`);
    } catch (error) {
      showErrorToast('Failed to add to Bucket List.');
    }
  }, [addToBucketList]);

  const handleMarkAsVisited = useCallback(async (activity: DatabaseItem) => {
    try {
      await addToVisitedList(activity);
      showSuccessToast(`${activity.activity_full_name} marked as visited!`);
    } catch (error) {
      showErrorToast('Failed to mark as visited.');
    }
  }, [addToVisitedList]);

  const handleCardClick = (activity: DatabaseItem) => {
    setCurrentActivity(activity);
    setCurrentAttraction({
      attraction_id: activity.attraction_id,
      attraction_name: activity.attraction_name,
      location_city: activity.location_city,
      location_country: activity.location_country, // Added country here
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentActivity(null);
    setCurrentAttraction(null);
  };

  const toggleMode = () => {
    setMode(prevMode => (prevMode === 'grid' ? 'fullscreen' : 'grid'));
  };

  const handleToggleListChange = async (activity: DatabaseItem, listType: 'bucketList' | 'visitedList') => {
    try {
      const list = listType === 'bucketList' ? bucketList : visitedList;
      const isInList = list.some(item => item.activity_id === activity.activity_id);

      if (listType === 'bucketList') {
        if (isInList) {
          await removeFromBucketList(activity.activity_id);
          showSuccessToast(`${activity.activity_full_name} removed from Bucket List`);
        } else {
          await addToBucketList(activity);
          showSuccessToast(`${activity.activity_full_name} added to Bucket List`);
        }
      } else {
        if (isInList) {
          await removeVisitedActivity(activity.activity_id);
          showSuccessToast(`${activity.activity_full_name} removed from Visited List`);
        } else {
          await addToVisitedList(activity);
          showSuccessToast(`${activity.activity_full_name} marked as visited`);
        }
      }
    } catch (error) {
      showErrorToast(`Failed to update ${listType} for ${activity.activity_full_name}`);
    }
  };

  return (
    <Box sx={{ padding: '16px', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ marginBottom: '16px', textAlign: 'center', color: '#ffffff' }}>
        Explore Activities
      </Typography>
      <Box sx={{ textAlign: 'center', marginBottom: '16px' }}>
        <Button variant="contained" onClick={toggleMode}>
          {mode === 'grid' ? 'Switch to Fullscreen' : 'Switch to Grid'}
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        mode === 'grid' ? (
          <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <Grid item xs={12} sm={6} md={4} key={`${activity.activity_id}-${index}`}>
                  <ActivityCard
                    activity={activity}
                    isFavorite={bucketList.some(item => item.activity_id === activity.activity_id)}
                    isVisited={visitedList.some(item => item.activity_id === activity.activity_id)}
                    onAddToBucketList={() => handleToggleListChange(activity, 'bucketList')}
                    onMarkAsVisited={() => handleToggleListChange(activity, 'visitedList')}
                    onClick={() => handleCardClick(activity)}
                    mode={mode}
                  />
                </Grid>
              ))
            ) : (
              <Typography sx={{ textAlign: 'center', width: '100%', padding: '20px', color: '#999' }}>
                No activities available.
              </Typography>
            )}
          </Grid>
        ) : (
          <FullScreenSwiper
            activities={activities}
            bucketList={bucketList}
            visitedList={visitedList}
            onAddToBucketList={handleAddToBucketList}
            onMarkAsVisited={handleMarkAsVisited}
          />
        )
      )}
      {currentActivity && (
        <ActivityDetailsModal
          open={isModalOpen}
          onClose={handleModalClose}
          activity={currentActivity}
          attraction={currentAttraction}
          onAddToBucketList={() => handleToggleListChange(currentActivity, 'bucketList')}
          onMarkAsVisited={() => handleToggleListChange(currentActivity, 'visitedList')}
        />
      )}
      <ToastNotificationContainer />
    </Box>
  );
};

export default Explore;
