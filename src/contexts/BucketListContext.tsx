import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Activity } from '../types/activity';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { writeBatch, collection, getDocs, addDoc, query, where, deleteDoc, setDoc, doc } from 'firebase/firestore';
import { fetchAttractionPhoto } from '../api/unsplashApi'; // Assuming you have this function to fetch images from Unsplash

interface BucketListContextProps {
  bucketList: Activity[];
  setBucketList: React.Dispatch<React.SetStateAction<Activity[]>>;
  fetchBucketList: () => void;
  removeFromBucketList: (activityId: string) => void;
  addToBucketList: (activity: Activity) => void;
  refresh: () => void;
}

const BucketListContext = createContext<BucketListContextProps | undefined>(undefined);

export const useBucketList = () => {
  const context = useContext(BucketListContext);
  if (!context) {
    throw new Error('useBucketList must be used within a BucketListProvider');
  }
  return context;
};

export const BucketListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [bucketList, setBucketList] = useState<Activity[]>([]);

  const fetchBucketList = async () => {
    if (!currentUser) {
      console.error('Error: No user is currently logged in.');
      return;
    }

    const bucketListRef = collection(db, 'userActivities');
    const q = query(bucketListRef, where('userId', '==', currentUser.uid), where('status', '==', 'bucketList'));

    try {
      const querySnapshot = await getDocs(q);
      const activities: Activity[] = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();

          const activity_id = data.activity_id || data.activityId;

          const requiredFields = [
            'activity_full_name',
            'activity_description',
            'attraction_id',
            'status',
            'timestamp',
            'userId',
          ];

          const missingFields = requiredFields.filter((field) => !(field in data));

          if (!activity_id || missingFields.length > 0) {
            console.error('Activity data is missing or incomplete:', data, 'Missing fields:', missingFields);
            return null;
          }

          return {
            activity_id: activity_id,
            activity_full_name: data.activity_full_name,
            activity_description: data.activity_description,
            attraction_id: data.attraction_id,
            status: data.status,
            timestamp: data.timestamp,
            userId: data.userId,
            imageUrl: data.imageUrl || 'https://via.placeholder.com/180', // Include imageUrl or placeholder
          } as Activity;
        })
        .filter((activity) => activity !== null) as Activity[];

      setBucketList(activities);
    } catch (error) {
      console.error('Error fetching bucket list:', error);
    }
  };

  const removeFromBucketList = async (activityId: string) => {
    if (!currentUser) {
      console.error('Error: currentUser is undefined or null.');
      return;
    }
  
    try {
      // Construct the document ID using the new naming convention
      const documentId = `${currentUser.uid}_${activityId}`;
  
      // Reference the specific document directly
      const docRef = doc(db, 'userActivities', documentId);
  
      // Delete the document
      await deleteDoc(docRef);
  
      // Update the local state to remove the activity from the list
      setBucketList((prevList) =>
        prevList.filter((activity) => activity.activity_id !== activityId)
      );
  
      console.log(`Activity with ID ${activityId} removed from bucket list.`);
    } catch (error) {
      console.error('Error removing from bucket list: ', error);
    }
  };  
  
  const addToBucketList = async (activity: Activity) => {
    if (!currentUser) return;

    try {
        // Check if the activity already exists in the bucket list
        if (bucketList.some((item) => item.activity_id === activity.activity_id)) {
            console.error('Activity is already in the bucket list.');
            return;
        }

        // Check if the activity exists in the visited list
        const visitedListRef = collection(db, 'userActivities');
        const visitedQuery = query(
            visitedListRef,
            where('userId', '==', currentUser.uid),
            where('activity_id', '==', activity.activity_id),
            where('status', '==', 'visited')
        );

        const visitedSnapshot = await getDocs(visitedQuery);
        if (!visitedSnapshot.empty) {
            console.error('Activity already exists in the visited list.');
            return;
        }

        // Fetch the image if not already present in the activity object
        let imageUrl = activity.imageUrl;
        if (!imageUrl) {
            imageUrl = await fetchAttractionPhoto(activity.attraction_name!);
        }

        // Add the activity to the bucket list
      const docRef = doc(db, 'userActivities', `${currentUser.uid}_${activity.activity_id}`);
      await setDoc(docRef, {
        ...activity,
        userId: currentUser.uid,
        status: 'bucketList',
        imageUrl: imageUrl || 'https://via.placeholder.com/180', // Use the fetched image or a placeholder
        timestamp: new Date(),
      });

        // Update the local state (if needed)
        setBucketList((prevList) => [
            ...prevList,
            { ...activity, imageUrl: imageUrl || 'https://via.placeholder.com/180' }
        ]);

    } catch (error) {
        console.error('Error adding to bucket list:', error);
    }
};

const toggleBucketList = async (activity: Activity) => {
  const isAlreadyInList = bucketList.some(item => item.activity_id === activity.activity_id);

  if (isAlreadyInList) {
    await removeFromBucketList(activity.activity_id);
  } else {
    await addToBucketList(activity);
  }
};


  const refresh = () => {
    fetchBucketList();
  };

  useEffect(() => {
    if (currentUser) {
      fetchBucketList();
    }
  }, [currentUser]);

  const value = useMemo(
    () => ({
      bucketList,
      setBucketList,
      fetchBucketList,
      removeFromBucketList,
      addToBucketList,
      refresh,
    }),
    [bucketList]
  );

  return (
    <BucketListContext.Provider value={value}>
      {children}
    </BucketListContext.Provider>
  );
};
