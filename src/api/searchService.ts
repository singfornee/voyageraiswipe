// src/services/searchService.ts

import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Activity } from '../types/activity';

export const fetchSuggestions = async (input: string): Promise<Activity[]> => {
  if (!input.trim()) {
    return [];
  }

  try {
    const lowerCaseInput = input.toLowerCase();  // Convert the input to lowercase
    
    const activitiesRef = collection(db, 'activities');
    
    // Firestore query for partial matches using range (prefix-based matching)
    const q = query(
      activitiesRef,
      where('activity_full_name', '>=', input),
      where('activity_full_name', '<=', input + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);

    // Log the query result for debugging
    console.log('Query Snapshot:', querySnapshot.docs.map(doc => doc.data()));

    // Map the results to the Activity type
    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as Activity;
      return {
        ...data,
        activity_id: doc.id,
      };
    });

  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};
