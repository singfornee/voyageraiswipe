import { useState, useEffect, useCallback } from 'react';
import { fetchActivitiesFromFirestore, fetchUserPreferences } from '../firestore';
import { Activity } from '../types/activity';

const useTopPicks = (userId: string | null) => {
  const [topPicks, setTopPicks] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchTopPicks = async () => {
      setLoading(true);
      try {
        const storedTopPicks = loadTopPicksFromLocalStorage();

        if (storedTopPicks) {
          setTopPicks(storedTopPicks);
        } else {
          const allActivities = await fetchActivitiesFromFirestore();
          const userPreferences = await fetchUserPreferences(userId ?? '');

          const filteredActivities = allActivities.filter(activity =>
            userPreferences.some(pref => activity.activities_keywords?.includes(pref))
          );

          const recommended = filteredActivities.length > 0 ? filteredActivities.slice(0, 5) : allActivities.slice(0, 5);
          setTopPicks(recommended);
          saveTopPicksToLocalStorage(recommended);
        }
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        setError('Failed to fetch activities.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopPicks();
  }, [userId]);

  return { topPicks, loading, error };
};

export default useTopPicks;
