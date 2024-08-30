import React, { useState, useEffect, useCallback } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { fetchActivitiesFromFirestore, fetchAttractionById } from '../firestore';
import { useBucketList } from '../contexts/BucketListContext';
import { useVisitedList } from '../contexts/VisitedListContext';
import ActivityCard from './ActivityCard';
import ActivityDetailsModal from './ActivityDetailsModal';
import FullScreenSwiper from './FullScreenSwiper';
import '../styles/Explore.css';
import { Activity, Attraction } from '../types/activity';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { useToastNotification, ToastNotificationContainer } from './notifications';
import { fetchAttractionPhoto } from '../api/unsplashApi';

const Explore: React.FC = () => {
  const { bucketList, addToBucketList, removeFromBucketList } = useBucketList();
  const { visitedList, addToVisitedList, removeVisitedActivity } = useVisitedList();

  const [mode, setMode] = useState<'grid' | 'fullscreen'>('grid');
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [currentAttraction, setCurrentAttraction] = useState<Attraction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageCache, setImageCache] = useState<{ [key: string]: string }>({});
  const { showSuccessToast, showErrorToast } = useToastNotification();

  useEffect(() => {
    loadMoreActivities(); // Initial load
  }, []);

  const loadMoreActivities = async () => {
    if (loading || !hasMore) return;
  
    try {
      setLoading(true);
  
      // Fetch new activities and the last visible document from Firestore
      const { activities: newActivities, lastVisible: newLastVisible } = await fetchActivitiesFromFirestore(lastVisible, 18);
  
      if (newActivities.length > 0) {
        // Fetch images for the new activities
        const imagePromises = newActivities.map(async (activity) => {
          const imageUrl = await fetchActivityImage(activity);
          return { ...activity, imageUrl };
        });
  
        const activitiesWithImages = await Promise.all(imagePromises);
  
        // Filter out any activities that are already present in the state
        const uniqueActivities = activitiesWithImages.filter(
          (activity) => !activities.some((existingActivity) => existingActivity.activity_id === activity.activity_id)
        );
  
        // Update state with the new, unique activities
        setActivities((prev) => [...prev, ...uniqueActivities]);
        setLastVisible(newLastVisible);
      } else {
        setHasMore(false); // No more items to load
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      showErrorToast('Failed to load activities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  

  const fetchActivityImage = useCallback(async (activity: Activity): Promise<string> => {
    if (imageCache[activity.activity_id]) {
      return imageCache[activity.activity_id];
    }

    const photoUrl = (await fetchAttractionPhoto(activity.activity_full_name || activity.activity_name || 'Unknown')) || 'default-image-url.jpg';
    setImageCache((prevCache) => ({
      ...prevCache,
      [activity.activity_id]: photoUrl,
    }));
    return photoUrl;
  }, [imageCache]);

  const handleCardClick = async (activity: Activity) => {
    try {
      setCurrentActivity(activity);
      const attraction = await fetchAttractionById(activity.attraction_id);
      setCurrentAttraction(attraction);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching attraction details:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentActivity(null);
    setCurrentAttraction(null);
  };

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'grid' ? 'fullscreen' : 'grid'));
  };

  const handleToggleBucketList = async (activity: Activity) => {
    try {
      const isAlreadyInList = bucketList.some(item => item.activity_id === activity.activity_id);

      if (isAlreadyInList) {
        await removeFromBucketList(activity.activity_id);
        showSuccessToast(`${activity.activity_full_name} removed from Bucket List`);
      } else {
        await addToBucketList(activity);
        showSuccessToast(`${activity.activity_full_name} added to Bucket List`);
      }
    } catch (error) {
      showErrorToast(`Failed to update Bucket List for ${activity.activity_full_name}`);
    }
  };

  const handleToggleVisitedList = async (activity: Activity) => {
    try {
      const isAlreadyInList = visitedList.some(item => item.activity_id === activity.activity_id);

      if (isAlreadyInList) {
        await removeVisitedActivity(activity.activity_id);
        showSuccessToast(`${activity.activity_full_name} removed from Visited List`);
      } else {
        await addToVisitedList(activity);
        showSuccessToast(`${activity.activity_full_name} marked as visited`);
      }
    } catch (error) {
      showErrorToast(`Failed to update Visited List for ${activity.activity_full_name}`);
    }
  };

  return (
    <Box sx={{ padding: '16px', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Typography variant="h4">Explore</Typography>
        <Button onClick={toggleMode}>
          {mode === 'grid' ? 'Switch to Fullscreen' : 'Switch to Grid'}
        </Button>
      </Box>
      {mode === 'grid' ? (
        <>
          <Box className="explore-grid-container">
            {activities.map((activity, index) => (
              <Box 
                className="activity-card-container"
                key={`${activity.activity_id}-${index}`}
              >
                <ActivityCard
                  activity={activity}
                  isFavorite={bucketList.some((item) => item.activity_id === activity.activity_id)}
                  isVisited={visitedList.some((item) => item.activity_id === activity.activity_id)}
                  onAddToBucketList={() => handleToggleBucketList(activity)}
                  onMarkAsVisited={() => handleToggleVisitedList(activity)}
                  onClick={() => handleCardClick(activity)}
                  mode="grid"
                />
              </Box>
            ))}
          </Box>
          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <Button variant="contained" onClick={loadMoreActivities} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Load More'}
              </Button>
            </Box>
          )}
        </>
      ) : (
        <FullScreenSwiper
          activities={activities}
          bucketList={bucketList}
          visitedList={visitedList}
        />
      )}
      
      {currentActivity && currentAttraction && (
        <ActivityDetailsModal
          open={isModalOpen}
          onClose={handleModalClose}
          activity={currentActivity}
          attraction={currentAttraction}
          onAddToBucketList={() => handleToggleBucketList(currentActivity)}
          onMarkAsVisited={() => handleToggleVisitedList(currentActivity)}
/>

      )}
      <ToastNotificationContainer />
    </Box>
  );
};

export default Explore;
