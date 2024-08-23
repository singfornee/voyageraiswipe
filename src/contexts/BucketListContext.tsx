import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Activity } from '../types/activity';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { writeBatch, collection, getDocs, addDoc, query, where } from 'firebase/firestore';

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
      const bucketListRef = collection(db, 'userActivities');

      const q = query(
        bucketListRef,
        where('userId', '==', currentUser.uid),
        where('activity_id', '==', activityId),
        where('status', '==', 'bucketList')
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        setBucketList((prevList) => prevList.filter((activity) => activity.activity_id !== activityId));
      } else {
        console.error(`No matching documents for activity_id: ${activityId}`);
      }
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

      const bucketListRef = collection(db, 'userActivities');
      await addDoc(bucketListRef, {
        activity_id: activity.activity_id,
        activity_name: activity.activity_name || '',
        activity_full_name: activity.activity_full_name || '',
        activity_description: activity.activity_description || '',
        activities_keywords: activity.activities_keywords || [],
        min_duration: activity.min_duration || 0,
        max_duration: activity.max_duration || 0,
        price: activity.price || 0,
        currency: activity.currency || '',
        attraction_id: activity.attraction_id || '',
        userId: currentUser.uid,
        status: 'bucketList',
        timestamp: new Date(),
      });

      setBucketList((prevList) => [...prevList, activity]);
    } catch (error) {
      console.error('Error adding to bucket list:', error);
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
