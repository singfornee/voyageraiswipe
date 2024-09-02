// src/services/searchService.ts

import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { DatabaseItem } from '../types/databaseTypes';

export const fetchSuggestions = async (input: string): Promise<DatabaseItem[]> => {
  if (!input.trim()) {
    return [];
  }

  try {
    const lowerCaseInput = input.toLowerCase();  // Convert the input to lowercase
    
    const activitiesRef = collection(db, 'activities');
    
    // Firestore query for partial matches using range (prefix-based matching)
    const q = query(
      activitiesRef,
      where('activity_full_name', '>=', lowerCaseInput),
      where('activity_full_name', '<=', lowerCaseInput + '\uf8ff'), // To handle the prefix
      limit(10)  // Limit the number of results to 10 for better performance
    );

    const querySnapshot = await getDocs(q);

    // Log the number of results found
    console.log(`Found ${querySnapshot.size} activities matching "${input}".`);

    // Map the results to the DatabaseItem type
    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as DatabaseItem;
      return {
        ...data,
        activity_id: doc.id,
      };
    });

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching suggestions:', error.message);
    } else {
      console.error('Unexpected error fetching suggestions:', error);
    }
    // Return an empty array in case of an error
    return [];
  }
};
