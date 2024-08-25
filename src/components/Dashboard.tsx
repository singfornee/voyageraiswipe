import React, { useEffect, useState, useCallback } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CircularProgress as CircularProgressIndicator, Tooltip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useBucketList } from '../contexts/BucketListContext';
import { useVisitedList } from '../contexts/VisitedListContext';
import { fetchActivitiesFromFirestore, fetchUserPreferences } from '../firestore'; // Ensure this method is implemented
import ActivityCard from './ActivityCard';
import { Activity } from '../types/activity';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ExploreIcon from '@mui/icons-material/Explore';
import { Button } from '@mui/material';



const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { bucketList, addToBucketList } = useBucketList();
  const { visitedList, addToVisitedList } = useVisitedList();
  const [recommendedActivities, setRecommendedActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const isInBucketList = useCallback(
    (activityId: string) => bucketList.some(item => item.activity_id === activityId),
    [bucketList]
  );

  const isInVisitedList = useCallback(
    (activityId: string) => visitedList.some(item => item.activity_id === activityId),
    [visitedList]
  );

  const loadTopPicksFromLocalStorage = () => {
    const topPicks = localStorage.getItem('topPicks');
    const lastUpdate = localStorage.getItem('topPicksLastUpdate');
    if (topPicks && lastUpdate) {
      const now = new Date();
      const lastUpdateDate = new Date(lastUpdate);
      if (now.toDateString() === lastUpdateDate.toDateString()) {
        return JSON.parse(topPicks) as Activity[];
      }
    }
    return null;
  };

  const saveTopPicksToLocalStorage = (topPicks: Activity[]) => {
    localStorage.setItem('topPicks', JSON.stringify(topPicks));
    localStorage.setItem('TopPicksLastUpdate', new Date().toISOString());
  };

  const handleAddToBucketList = useCallback(
    async (activity: Activity) => {
      if (!currentUser) return;

      if (!isInBucketList(activity.activity_id)) {
        try {
          await addToBucketList(activity);
          toast.success(`${activity.activity_full_name} added to bucket list!`, { position: 'top-right' });
        } catch (error) {
          console.error('Error adding to bucket list:', error);
          toast.error('Failed to add to bucket list.', { position: 'top-right' });
        }
      } else {
        toast.info(`${activity.activity_full_name} is already in your bucket list!`, { position: 'top-right' });
      }
    },
    [currentUser, addToBucketList, isInBucketList]
  );

  const handleMarkAsVisited = useCallback(
    async (activity: Activity) => {
      if (!currentUser) return;

      if (!isInVisitedList(activity.activity_id)) {
        try {
          await addToVisitedList(activity);
          toast.success(`${activity.activity_full_name} marked as visited!`, { position: 'top-right' });
        } catch (error) {
          console.error('Error marking as visited:', error);
          toast.error('Failed to mark as visited.', { position: 'top-right' });
        }
      } else {
        toast.info(`${activity.activity_full_name} is already in your visited list!`, { position: 'top-right' });
      }
    },
    [currentUser, addToVisitedList, isInVisitedList]
  );

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const storedTopPicks = loadTopPicksFromLocalStorage();
  
        if (storedTopPicks) {
          setRecommendedActivities(storedTopPicks);
        } else {
          const allActivities = await fetchActivitiesFromFirestore();
          const userPreferences: string[] = await fetchUserPreferences(currentUser?.uid ?? '');  // Explicitly typed
  
          // Filter activities based on user preferences
          const filteredActivities = allActivities.filter(activity =>
            userPreferences.some(pref =>
              activity.activities_keywords?.includes(pref)
            )
          );
  
          // If no activities match, fall back to all activities
          const recommended = filteredActivities.length > 0 ? filteredActivities.slice(0, 3) : allActivities.slice(0, 3);
          setRecommendedActivities(recommended);
          saveTopPicksToLocalStorage(recommended);
        }
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        setError('Failed to fetch activities.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchActivities();
  }, [currentUser, isInBucketList, isInVisitedList]);
  

  return (
    <Container maxWidth="lg" sx={{ padding: '32px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ToastContainer />

      {/* Hero Section */}
      <Box mb={6} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Welcome back, {currentUser?.displayName || 'Explorer'}!
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Here’s your video for today:
        </Typography>
        <Box
          sx={{
            width: '100%',
            height: 'auto',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '12px',
            boxShadow: 4,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)',
              zIndex: 1,
            }}
          />
          <video
            width="100%"
            height="auto"
            autoPlay
            loop
            muted
            style={{
              display: 'block',
              borderRadius: '12px',
            }}
          >
            <source src="/videos/spotlight.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <Box
            sx={{
              position: 'absolute',
              bottom: '10%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2,
              textAlign: 'center',
            }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<ExploreIcon />}
              sx={{
                padding: '8px 24px',
                fontSize: '1rem',
                borderRadius: '20px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
                },
              }}
              onClick={() => navigate('/explore')}
            >
              Explore More
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Stats Section */}
      <Box mb={6} width="100%" textAlign="center">
        <Typography variant="h5" gutterBottom>
          Your Adventure Stats
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                boxShadow: 4,
                padding: 3,
                textAlign: 'center',
                background: 'linear-gradient(45deg, #6A5ACD 30%, #8A2BE2 90%)',
                color: 'white',
                height: '100%', // Ensure uniform height
              }}
            >
              <Tooltip title="Keep exploring!" arrow>
                <Box>
                  <FavoriteIcon sx={{ fontSize: 50, mb: 2 }} />
                  <CircularProgressIndicator
                    variant="determinate"
                    value={(bucketList.length / 50) * 100}
                    size={90}
                    thickness={6}
                    sx={{ color: 'white' }}
                  />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    {bucketList.length} / 50 Milestone
                  </Typography>
                </Box>
              </Tooltip>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                boxShadow: 4,
                padding: 3,
                textAlign: 'center',
                background: 'linear-gradient(45deg, #2E335A 30%, #6A5ACD 90%)',
                color: 'white',
                height: '100%', // Ensure uniform height
              }}
            >
              <Tooltip title="Amazing places you've been!" arrow>
                <Box>
                  <CheckCircleIcon sx={{ fontSize: 50, mb: 2 }} />
                  <CircularProgressIndicator
                    variant="determinate"
                    value={(visitedList.length / 100) * 100}
                    size={90}
                    thickness={6}
                    sx={{ color: 'white' }}
                  />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    {visitedList.length} / 100 Milestone
                  </Typography>
                </Box>
              </Tooltip>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                boxShadow: 4,
                padding: 3,
                textAlign: 'center',
                background: 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
                color: 'white',
                height: '100%', // Ensure uniform height
              }}
            >
              <Tooltip title="Total activities you've engaged with" arrow>
                <Box>
                  <ExploreIcon sx={{ fontSize: 50, mb: 2 }} />
                  <CircularProgressIndicator
                    variant="determinate"
                    value={((bucketList.length + visitedList.length) / 150) * 100}
                    size={90}
                    thickness={6}
                    sx={{ color: 'white' }}
                  />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    {bucketList.length + visitedList.length} / 150 Milestone
                  </Typography>
                </Box>
              </Tooltip>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Top Picks Section */}
      {loading ? (
        <Grid container spacing={2} justifyContent="center">
          {[...Array(3)].map((_, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <Box sx={{ width: '100%', height: 200, backgroundColor: '#f0f0f0', borderRadius: '12px' }}></Box>
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Top Picks for You
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            {recommendedActivities.map((activity) => (
              <ActivityCard
                key={activity.activity_id}
                activity={activity}
                isFavorite={isInBucketList(activity.activity_id)}
                isVisited={isInVisitedList(activity.activity_id)}
                onAddToBucketList={() => handleAddToBucketList(activity)}
                onMarkAsVisited={() => handleMarkAsVisited(activity)}
                onClick={() => console.log('Activity clicked')}
                className="recommended-card custom-card"
              />
            ))}
          </Box>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
