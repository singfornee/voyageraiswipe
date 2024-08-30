import { useQuery } from '@tanstack/react-query';
import { fetchActivitiesFromFirestore } from '../firestore';
import { useBucketList } from '../contexts/BucketListContext';
import { useVisitedList } from '../contexts/VisitedListContext';
import { Activity } from '../types/activity';
import { toast } from 'react-toastify';

// Define the useActivities hook
const useActivities = () => {
  const { bucketList } = useBucketList();
  const { visitedList } = useVisitedList();

  return useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: fetchActivitiesFromFirestore,
    select: (data) =>
      data.filter(
        (activity) =>
          !bucketList.some((item) => item.activity_id === activity.activity_id) &&
          !visitedList.some((item) => item.activity_id === activity.activity_id)
      ),
    onError: () => {
      toast.error('Failed to load activities. Please try again later.');
    },
  });
};

export default useActivities;
