import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  query,
  where,
  QueryDocumentSnapshot,
  DocumentData,
  orderBy,
  limit,
  startAfter,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { DatabaseItem } from './types/databaseTypes';

interface FetchActivitiesResult {
  activities: DatabaseItem[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
}

// Function to execute Firestore queries and handle common errors
async function executeFirestoreQuery<T>(queryFunction: () => Promise<QuerySnapshot<DocumentData>>): Promise<T[]> {
  try {
    const snapshot = await queryFunction();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error('Firestore query execution error:', error);
    throw error;
  }
}

export const fetchActivitiesFromFirestore = async (
  lastVisible: QueryDocumentSnapshot<DocumentData> | null = null,
  pageSize: number = 10
): Promise<FetchActivitiesResult> => {
  const colRef = collection(db, 'database'); // Ensure this is the correct collection name

  let activitiesQuery = query(colRef, limit(pageSize));

  if (lastVisible) {
    activitiesQuery = query(activitiesQuery, startAfter(lastVisible));
  }

  const querySnapshot = await getDocs(activitiesQuery);
  console.log("Fetched Documents:", querySnapshot.docs.length); // Log number of fetched documents

  const activities: DatabaseItem[] = querySnapshot.docs.map(doc => {
    const data = doc.data() as DatabaseItem; 
    
    return {
      activity_id: data.activity_id || '',
      attraction_id: data.attraction_id || '',
      activity_full_name: data.activity_full_name || 'Unnamed Activity',
      attraction_name: data.attraction_name || 'Unknown Attraction',
      attraction_category: data.attraction_category || 'Uncategorized',
      attraction_subcategory: data.attraction_subcategory || '',
      location_city: data.location_city || 'Unknown City',
      location_country: data.location_country || 'Unknown Country',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      activity_description: data.activity_description || '',
      activities_keywords: data.activities_keywords || [],
      min_duration: data.min_duration || 0,
      max_duration: data.max_duration || 0,
      price: data.price || 0,
      currency: data.currency || 'USD',
      unique_feature_one: data.unique_feature_one || '',
      unique_feature_two: data.unique_feature_two || '',
      unique_feature_three: data.unique_feature_three || '',
      secret_tip: data.secret_tip || '',
      collection: data.collection || '',
      imageUrl: data.imageUrl || 'https://via.placeholder.com/180',
      opening_hour: data.opening_hour || 'Opening hours not available', // Check this line
    };
  });

  const newLastVisible = querySnapshot.docs.length > 0
    ? querySnapshot.docs[querySnapshot.docs.length - 1]
    : null;

  return { activities, lastVisible: newLastVisible };
};


// Updating the user's profile icon in Firestore
export const updateProfileIcon = async (userId: string, iconUrl: string): Promise<void> => {
  const userDocRef = doc(db, 'users', userId);
  try {
    await updateDoc(userDocRef, { profileIcon: iconUrl });
    console.log('Profile icon updated successfully');
  } catch (error) {
    console.error('Error updating profile icon:', error);
    throw error;
  }
};

// Fetch items from the database with pagination
export const fetchItemsFromDatabase = async (lastVisible: QueryDocumentSnapshot<DocumentData> | null, pageSize = 10): Promise<DatabaseItem[]> => {
  const databaseRef = collection(db, 'database');
  const baseQuery = query(databaseRef, orderBy('createdDate'), limit(pageSize));
  const itemsQuery = lastVisible ? query(baseQuery, startAfter(lastVisible)) : baseQuery;
  return executeFirestoreQuery<DatabaseItem>(() => getDocs(itemsQuery));
};

// Fetch user preferences
export const fetchUserPreferences = async (userId: string): Promise<string[]> => {
  if (!userId) return [];
  const userDocRef = doc(db, 'userPreferences', userId);
  try {
    const docSnapshot = await getDoc(userDocRef);
    if (docSnapshot.exists()) {
      const data = docSnapshot.data() as { preferences: string[] };
      return data.preferences || [];
    } else {
      console.log('User preferences not found.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw error;
  }
};

// Example function for fetching documents by type
export const fetchItemsByType = async (type: string): Promise<DatabaseItem[]> => {
  const databaseRef = collection(db, 'database');
  const typeQuery = query(databaseRef, where('type', '==', type));
  const snapshot = await getDocs(typeQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as DatabaseItem }));
};

// Add or update user preferences
export const addOrUpdateUserPreferences = async (userId: string, preferences: string[]): Promise<void> => {
  if (!userId) return;
  const userDocRef = doc(db, 'userPreferences', userId);
  try {
    await setDoc(userDocRef, { preferences }, { merge: true });
    console.log('User preferences updated successfully');
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

// Helper function to add activities to a list
async function addActivityToList(userId: string, activityId: string, listType: 'bucketList' | 'visited', activityDetails: DatabaseItem): Promise<void> {
  const listRef = collection(db, 'userActivities');
  const existingQuery = query(listRef, where('userId', '==', userId), where('activity_id', '==', activityId));
  const existingDocs = await getDocs(existingQuery);
  if (!existingDocs.empty) {
    console.log(`Activity already in ${listType}: ${activityId}`);
    return;
  }
  await addDoc(listRef, {
    userId,
    activityId,
    ...activityDetails,
    status: listType,
    timestamp: new Date(),
  });
}

// Public function to add an activity to the bucket list
export const addToBucketList = async (userId: string, activityId: string, activityDetails: DatabaseItem) => {
  return addActivityToList(userId, activityId, 'bucketList', activityDetails);
};

// Public function to add an activity to the visited list
export const addToVisitedList = async (userId: string, activityId: string, activityDetails: DatabaseItem) => {
  return addActivityToList(userId, activityId, 'visited', activityDetails);
};

export const updateActivityRating = async (userId: string, activityId: string, rating: number): Promise<void> => {
  try {
    const docRef = doc(db, 'userActivities', `${userId}_${activityId}`);
    await updateDoc(docRef, {
      rating: rating,
    });
    console.log(`Rating updated for activity ${activityId}`);
  } catch (error) {
    console.error('Error updating rating:', error);
  }
};