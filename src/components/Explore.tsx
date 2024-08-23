import React, { useEffect, useState, useCallback } from 'react';
import { CircularProgress, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Activity } from '../types/activity';
import { useAuth } from '../contexts/AuthContext';
import { addToBucketList, addToVisitedList, fetchActivitiesFromFirestore, fetchAttractionById } from '../firestore';
import { fetchAttractionPhoto } from '../api/unsplashApi';
import { useBucketList } from '../contexts/BucketListContext';
import { useVisitedList } from '../contexts/VisitedListContext';
import ActivityCard from './ActivityCard';
import ActivityDetailsModal from './ActivityDetailsModal';
import { toast } from 'react-toastify'; // Import toast
import '../styles/Explore.css';

const Explore: React.FC = () => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const { bucketList } = useBucketList();
  const { visitedList } = useVisitedList();

  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAttraction, setCurrentAttraction] = useState<any>(null);
  const [remainingActivities, setRemainingActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const fetchedActivities = await fetchActivitiesFromFirestore();

        const availableActivities = fetchedActivities.filter(
          (activity) =>
            !bucketList.some((item) => item.activity_id === activity.activity_id) &&
            !visitedList.some((item) => item.activity_id === activity.activity_id)
        );

        if (availableActivities.length > 0) {
          const firstActivity = availableActivities[0];
          const attraction = await fetchAttractionById(firstActivity.attraction_id);
          const photoUrl = attraction 
            ? await fetchAttractionPhoto(attraction.attraction_name)
            : null;

          setCurrentActivity({
            ...firstActivity,
            attraction_name: attraction?.attraction_name || 'Unknown Attraction',
            imageUrl: photoUrl || 'default-image-url.jpg'
          });

          setRemainingActivities(availableActivities.slice(1));
        } else {
          setCurrentActivity(null); // No more activities available
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [bucketList, visitedList]);

  const fetchNextActivity = useCallback(async () => {
    if (remainingActivities.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingActivities.length);
      const nextActivity = remainingActivities[randomIndex];

      const attraction = await fetchAttractionById(nextActivity.attraction_id);
      const photoUrl = attraction 
        ? await fetchAttractionPhoto(attraction.attraction_name)
        : null;

      setCurrentActivity({
        ...nextActivity,
        attraction_name: attraction?.attraction_name || 'Unknown Attraction',
        imageUrl: photoUrl || 'default-image-url.jpg'
      });

      setRemainingActivities((prevActivities) =>
        prevActivities.filter((_, index) => index !== randomIndex)
      );
    } else {
      setCurrentActivity(null); // No activities left to display
    }
  }, [remainingActivities]);

  const handlePass = useCallback(() => {
    fetchNextActivity(); 
  }, [fetchNextActivity]);

  const handleAddToBucketList = useCallback(async () => {
    if (currentActivity && currentUser) {
      try {
        // Check if the activity is already in the bucket list
        const isAlreadyInBucketList = bucketList.some(item => item.activity_id === currentActivity.activity_id);
  
        if (!isAlreadyInBucketList) {
          // Pass the correct arguments (user ID and activity) to addToBucketList
          await addToBucketList(currentUser.uid, currentActivity);
          
          toast.success(`${currentActivity.activity_full_name} added to bucket list!`, {
            position: 'bottom-center',
          });
  
          handlePass(); // Move to the next activity after adding
        } else {
          toast.info(`${currentActivity.activity_full_name} is already in your bucket list!`, {
            position: 'bottom-center',
          });
        }
      } catch (error) {
        console.error('Error adding to bucket list:', error);
      }
    }
  }, [currentActivity, currentUser, bucketList, handlePass]);
  

  const handleVisited = useCallback(async () => {
    if (currentActivity && currentUser) {
      try {
        await addToVisitedList(currentUser.uid, currentActivity);
        handlePass();
      } catch (error) {
        console.error('Error adding to visited list:', error);
      }
    }
  }, [currentActivity, currentUser, handlePass]);

  const handleCardClick = useCallback(async () => {
    if (currentActivity) {
      const attraction = await fetchAttractionById(currentActivity.attraction_id);
      setCurrentAttraction(attraction);
      setIsModalOpen(true);
    }
  }, [currentActivity]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setCurrentAttraction(null);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentActivity) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="textSecondary">
          No more activities available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      className="explore-container"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: theme.palette.background.default,
        padding: '16px',
        minHeight: '100vh',
      }}
    >
      <ActivityCard
        activity={currentActivity}
        isFavorite={bucketList.some((item) => item.activity_id === currentActivity.activity_id)}
        isVisited={visitedList.some((item) => item.activity_id === currentActivity.activity_id)}
        onPass={handlePass}
        onAddToBucketList={handleAddToBucketList}
        onMarkAsVisited={handleVisited}
        onClick={handleCardClick}
        className="activity-card-container" /* Apply the CSS class */
      />
  
      <ActivityDetailsModal
        open={isModalOpen}
        onClose={handleModalClose}
        activity={currentActivity}
        attractionName={currentActivity?.attraction_name || 'Unknown Attraction'}
        attractionCategory={currentAttraction?.attraction_category || 'Unknown Category'}
        attractionLocation={`${currentAttraction?.location_city || 'Unknown City'}, ${currentAttraction?.location_country || 'Unknown Country'}`}
        openingHours={currentAttraction?.opening_hour || 'N/A'}
      />
    </Box>
  );
};

export default Explore;
