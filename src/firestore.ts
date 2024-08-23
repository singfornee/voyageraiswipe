import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  query, 
  where,
  updateDoc 
} from 'firebase/firestore';
import { db } from './firebase';  // Ensure this path is correct relative to your file structure
import { Activity, Attraction } from './types/activity';  // Import the necessary types

export const updateProfileIcon = async (userId: string, iconUrl: string) => {
  const userDocRef = doc(db, 'users', userId);

  try {
    await updateDoc(userDocRef, { profileIcon: iconUrl });
    console.log('Profile icon updated successfully');
  } catch (error) {
    console.error('Error updating profile icon:', error);
    throw error;
  }
};

// Fetch all activities from the 'activities' collection in Firestore
export const fetchActivitiesFromFirestore = async (): Promise<Activity[]> => {
  const activitiesCollection = collection(db, 'activities');
  const activitiesSnapshot = await getDocs(activitiesCollection);
  return activitiesSnapshot.docs.map((doc) => doc.data() as Activity);
};

// Fetch a single attraction by its ID from the 'attractions' collection in Firestore
export const fetchAttractionById = async (attractionId: string): Promise<Attraction | null> => {
  console.log(`Fetching attraction with ID: ${attractionId}`);
  
  const attractionDoc = doc(db, 'attractions', attractionId);
  const attractionSnapshot = await getDoc(attractionDoc);
  
  if (attractionSnapshot.exists()) {
    const attractionData = attractionSnapshot.data() as Attraction;
    console.log(`Found attraction: `, attractionData);
    return attractionData;
  } else {
    console.log(`No attraction found for ID: ${attractionId}`);
  }
  
  return null;
};

// Add an activity to the user's bucket list
export const addToBucketList = async (userId: string, activity: Activity) => {
  const bucketListRef = collection(db, 'userActivities');
  
  // Prevent duplicates
  const existingDocs = await getDocs(query(bucketListRef, where('userId', '==', userId), where('activityId', '==', activity.activity_id)));
  if (!existingDocs.empty) {
    console.log(`Activity already in bucket list: ${activity.activity_id}`);
    return;
  }

  await addDoc(bucketListRef, {
    userId,
    activityId: activity.activity_id,
    activity_full_name: activity.activity_full_name,
    activity_description: activity.activity_description,
    attraction_id: activity.attraction_id,
    status: 'bucketList',
    timestamp: new Date(),
  });
};

// Add an activity to the user's visited list
export const addToVisitedList = async (userId: string, activity: Activity) => {
  const visitedListRef = collection(db, 'userActivities');
  
  // Prevent duplicates
  const existingDocs = await getDocs(query(visitedListRef, where('userId', '==', userId), where('activityId', '==', activity.activity_id)));
  if (!existingDocs.empty) {
    console.log(`Activity already in visited list: ${activity.activity_id}`);
    return;
  }

  await addDoc(visitedListRef, {
    userId,
    activityId: activity.activity_id,
    activity_full_name: activity.activity_full_name,
    activity_description: activity.activity_description,
    attraction_id: activity.attraction_id,
    status: 'visited',
    timestamp: new Date(),
  });
};

// Get user data (bucket list and visited list) from Firestore
export const getUserData = async (userId: string): Promise<{ bucketList: Activity[]; visitedList: Activity[] }> => {
  const userActivitiesCollection = collection(db, 'userActivities');
  const q = query(userActivitiesCollection, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  const bucketList: Activity[] = [];
  const visitedList: Activity[] = [];

  const activityPromises = querySnapshot.docs.map(async (document) => {
    const data = document.data();
    const activityId = data.activityId as string;
    const status = data.status as string;

    const activityDocRef = doc(db, 'activities', activityId);
    const activitySnapshot = await getDoc(activityDocRef);
    return { status, activity: activitySnapshot.exists() ? (activitySnapshot.data() as Activity) : null };
  });

  const results = await Promise.all(activityPromises);

  results.forEach(({ status, activity }) => {
    if (activity) {
      if (status === 'bucketList') {
        bucketList.push(activity);
      } else if (status === 'visited') {
        visitedList.push(activity);
      }
    }
  });

  return { bucketList, visitedList };
};
