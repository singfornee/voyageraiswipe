import { useQuery } from '@tanstack/react-query';
import { fetchActivitiesFromFirestore } from '../firestore';
import { DatabaseItem } from '../types/databaseTypes'; // Ensure this is correctly imported
import { toast } from 'react-toastify';

const useActivities = () => {
  return useQuery<DatabaseItem[], Error>({
    queryKey: ['activities'],
    queryFn: async () => {
      try {
        const { activities } = await fetchActivitiesFromFirestore();
        return activities; // Return just the activities array
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Failed to load activities: ${errorMsg}`);
        throw error;
      }
    }
  });
};

export default useActivities;
