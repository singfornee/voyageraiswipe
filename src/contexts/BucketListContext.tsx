import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { DatabaseItem } from '../types/databaseTypes';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  deleteDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { fetchAttractionPhoto } from '../api/unsplashApi';  // Assuming this function exists and works properly

interface BucketListContextProps {
  bucketList: DatabaseItem[];
  setBucketList: React.Dispatch<React.SetStateAction<DatabaseItem[]>>;
  fetchBucketList: () => void;
  addToBucketList: (item: DatabaseItem) => void;
  removeFromBucketList: (activity_id: string) => void;
}

const BucketListContext = createContext<BucketListContextProps | undefined>(undefined);

export const useBucketList = () => {
  const context = useContext(BucketListContext);
  if (!context) {
    throw new Error('useBucketList must be used within a BucketListProvider');
  }
  return context;
};

export const BucketListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [bucketList, setBucketList] = useState<DatabaseItem[]>([]);

  const fetchBucketList = async () => {
    if (!currentUser) return;
  
    try {
      const bucketListRef = collection(db, 'userActivities');
      const q = query(bucketListRef, where('userId', '==', currentUser.uid), where('status', '==', 'bucketList'));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Partial<DatabaseItem>;  // Ensure data is cast to DatabaseItem with optional fields handled
        return {
          ...data,
          id: doc.id,  // Map the Firestore document id to the object
          activity_id: data.activity_id || '',
          attraction_id: data.attraction_id || '',
          activity_full_name: data.activity_full_name || 'Unnamed Activity',
          location_city: data.location_city || 'Unknown City',
          location_country: data.location_country || 'Unknown Country',
          imageUrl: data.imageUrl || 'https://via.placeholder.com/180', // Default image
        } as DatabaseItem;
      });
      setBucketList(items);
    } catch (error) {
      console.error('Error fetching bucket list:', error);
    }
  };
  
  const addToBucketList = async (item: DatabaseItem) => {
    if (!currentUser || bucketList.some((i) => i.activity_id === item.activity_id)) return;
  
    try {
      // Ensure the image URL is fetched if not already provided
      const imageUrl = item.imageUrl ?? await fetchAttractionPhoto(item.activity_full_name || 'Unknown');
  
      const docRef = doc(db, 'userActivities', `${currentUser.uid}_${item.activity_id}`);
      await setDoc(docRef, {
        ...item,
        userId: currentUser.uid,
        status: 'bucketList',
        imageUrl: imageUrl || undefined,  // Ensure imageUrl is not null, assign undefined if empty
        timestamp: serverTimestamp(),  // Use server timestamp for consistency
      });
  
      setBucketList([...bucketList, { ...item, imageUrl }]);
    } catch (error) {
      console.error('Error adding to bucket list:', error);
    }
  };

  const removeFromBucketList = async (activity_id: string) => {
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, 'userActivities', `${currentUser.uid}_${activity_id}`));
      setBucketList(bucketList.filter(item => item.activity_id !== activity_id));
    } catch (error) {
      console.error('Error removing from bucket list:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchBucketList();
    }
  }, [currentUser]);

  const value = useMemo(() => ({
    bucketList,
    setBucketList,
    fetchBucketList,
    addToBucketList,
    removeFromBucketList
  }), [bucketList]);

  return (
    <BucketListContext.Provider value={value}>
      {children}
    </BucketListContext.Provider>
  );
};

export default BucketListProvider;
