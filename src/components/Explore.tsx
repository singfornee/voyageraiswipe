import React, { useEffect, useState, useCallback, useRef } from 'react';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
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
import { toast } from 'react-toastify';
import '../styles/Explore.css';

interface Attraction {
  attraction_id: string;
  attraction_name: string;
  attraction_category: string;
  location_city: string;
  location_country: string;
  opening_hour: string;
  [key: string]: any;
}

const Explore: React.FC = () => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const { bucketList } = useBucketList();
  const { visitedList } = useVisitedList();

  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAttraction, setCurrentAttraction] = useState<Attraction | null>(null);
  const [remainingActivities, setRemainingActivities] = useState<Activity[]>([]);
  const imageCache = useRef<{ [key: string]: string }>({});

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
          let photoUrl: string | null = null;

          if (attraction && attraction.attraction_name) {
            if (imageCache.current[attraction.attraction_name]) {
              photoUrl = imageCache.current[attraction.attraction_name];
            } else {
              try {
                photoUrl = await fetchAttractionPhoto(attraction.attraction_name);
                imageCache.current[attraction.attraction_name] = photoUrl || 'default-image-url.jpg';
              } catch (error) {
                console.error('Error fetching photo:', error);
              }
            }
          }

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
        toast.error('Failed to load activities. Please try again later.');
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

      try {
        const attraction = await fetchAttractionById(nextActivity.attraction_id);
        let photoUrl: string | null = null;

        if (attraction && attraction.attraction_name) {
          if (imageCache.current[attraction.attraction_name]) {
            photoUrl = imageCache.current[attraction.attraction_name];
          } else {
            try {
              photoUrl = await fetchAttractionPhoto(attraction.attraction_name);
              imageCache.current[attraction.attraction_name] = photoUrl || 'default-image-url.jpg';
            } catch (error) {
              console.error('Error fetching photo:', error);
            }
          }
        }

        setCurrentActivity({
          ...nextActivity,
          attraction_name: attraction?.attraction_name || 'Unknown Attraction',
          imageUrl: photoUrl || 'default-image-url.jpg'
        });

        setRemainingActivities((prevActivities) =>
          prevActivities.filter((_, index) => index !== randomIndex)
        );
      } catch (error) {
        console.error('Error fetching next activity:', error);
        toast.error('Failed to load the next activity.');
      }
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
        let activitiesKeywordsArray: string[] = [];
  
        if (currentActivity.activities_keywords) {
          if (typeof currentActivity.activities_keywords === 'string') {
            activitiesKeywordsArray = currentActivity.activities_keywords.split(',');
          } else if (Array.isArray(currentActivity.activities_keywords)) {
            activitiesKeywordsArray = currentActivity.activities_keywords;
          }
        }
  
        const activityToAdd: Activity = {
          ...currentActivity,
          activities_keywords: activitiesKeywordsArray,
          min_duration: currentActivity.min_duration ? Number(currentActivity.min_duration) : undefined,
          max_duration: currentActivity.max_duration ? Number(currentActivity.max_duration) : undefined,
          price: currentActivity.price ? Number(currentActivity.price) : undefined,
          currency: currentActivity.currency,
          imageUrl: currentActivity.imageUrl || 'default-image-url.jpg',
        };
  
        const docId = `${currentUser.uid}_${currentActivity.activity_id}`;
        const isAlreadyInBucketList = bucketList.some(item => item.activity_id === currentActivity.activity_id);
  
        if (!isAlreadyInBucketList) {
          await setDoc(doc(db, 'userActivities', docId), {
            ...activityToAdd,
            userId: currentUser.uid,
            status: 'bucketList',
            timestamp: new Date(),
          });
  
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
        toast.error('Failed to add to bucket list. Please try again.');
      }
    }
  }, [currentActivity, currentUser, bucketList, handlePass]);  
  

  const handleVisited = useCallback(async () => {
    if (currentActivity && currentUser) {
      try {
        let activitiesKeywordsArray: string[] = [];

        if (currentActivity.activities_keywords) {
          if (typeof currentActivity.activities_keywords === 'string') {
            activitiesKeywordsArray = currentActivity.activities_keywords.split(',');
          } else if (Array.isArray(currentActivity.activities_keywords)) {
            activitiesKeywordsArray = currentActivity.activities_keywords;
          }
        }

        const activityToAdd: Activity = {
          ...currentActivity,
          activities_keywords: activitiesKeywordsArray,
          min_duration: currentActivity.min_duration ? Number(currentActivity.min_duration) : undefined,
          max_duration: currentActivity.max_duration ? Number(currentActivity.max_duration) : undefined,
          price: currentActivity.price ? Number(currentActivity.price) : undefined,
          currency: currentActivity.currency,
          imageUrl: currentActivity.imageUrl || 'default-image-url.jpg',
        };

        const docId = `${currentUser.uid}_${currentActivity.activity_id}`;
        const isAlreadyInVisitedList = visitedList.some(item => item.activity_id === currentActivity.activity_id);

        if (!isAlreadyInVisitedList) {
          await setDoc(doc(db, 'userActivities', docId), {
            ...activityToAdd,
            userId: currentUser.uid,
            status: 'visited',
            timestamp: new Date(),
          });

          toast.success(`${currentActivity.activity_full_name} marked as visited!`, {
            position: 'bottom-center',
          });

          handlePass(); // Move to the next activity after marking as visited
        } else {
          toast.info(`${currentActivity.activity_full_name} is already in your visited list!`, {
            position: 'bottom-center',
          });
        }
      } catch (error) {
        console.error('Error marking activity as visited:', error);
        toast.error('Failed to mark as visited. Please try again.');
      }
    }
  }, [currentActivity, currentUser, visitedList, handlePass]);

  const handleCardClick = useCallback(async () => {
    if (currentActivity) {
      try {
        const attraction = await fetchAttractionById(currentActivity.attraction_id);
        setCurrentAttraction(attraction);
        setIsModalOpen(true);
      } catch (error) {
        console.error('Error fetching attraction details:', error);
        toast.error('Failed to load attraction details.');
      }
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
        className="activity-card-container"
      />
  
      <ActivityDetailsModal
        open={isModalOpen}
        onClose={handleModalClose}
        activity={currentActivity}
        attractionName={currentActivity?.attraction_name || 'Unknown Attraction'}  
        attractionCategory={currentAttraction?.attraction_category || 'Unknown Category'}
        attractionLocation={`${currentAttraction?.location_city || 'Unknown City'}, ${currentAttraction?.location_country || 'Unknown Country'}`}
        openingHours={currentAttraction?.opening_hour || 'N/A'}
        onAddToBucketList={handleAddToBucketList}
        onMarkAsVisited={handleVisited}
      />
    </Box>
  );
};

export default Explore;
