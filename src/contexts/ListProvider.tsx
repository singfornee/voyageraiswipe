import React, { createContext, useContext, useState, useEffect } from 'react';
import { DatabaseItem } from '../types/databaseTypes';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { collection, getDocs, query, where, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { fetchAttractionPhoto } from '../api/unsplashApi';

interface ListContextProps {
  list: DatabaseItem[];
  setList: React.Dispatch<React.SetStateAction<DatabaseItem[]>>;
  fetchList: () => void;
  addToList: (item: DatabaseItem) => void;
  removeFromList: (activity_id: string) => void;
}

const ListContext = createContext<ListContextProps | undefined>(undefined);

export const useList = () => {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error('useList must be used within a ListProvider');
  }
  return context;
};

export const ListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [list, setList] = useState<DatabaseItem[]>([]);

  const fetchList = async () => {
    if (!currentUser) return;

    try {
      const listRef = collection(db, 'userActivities');
      const q = query(listRef, where('userId', '==', currentUser.uid), where('status', '==', 'bucketList'));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map((doc) => doc.data() as DatabaseItem);
      setList(items);
    } catch (error) {
      console.error('Error fetching list:', error);
    }
  };

  const addToList = async (item: DatabaseItem) => {
    if (!currentUser) return;

    try {
      let imageUrl = item.imageUrl;
      if (!imageUrl) {
        imageUrl = await fetchAttractionPhoto(item.activity_full_name || 'Unknown') || undefined;
      }

      const docRef = doc(db, 'userActivities', `${currentUser.uid}_${item.activity_id}`);
      await setDoc(docRef, {
        ...item,
        userId: currentUser.uid,
        status: 'bucketList',
        imageUrl,
        timestamp: new Date(),
      });

      setList(prev => [...prev, { ...item, imageUrl }]);
    } catch (error) {
      console.error('Error adding to list:', error);
    }
  };

  const removeFromList = async (activity_id: string) => {
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, 'userActivities', `${currentUser.uid}_${activity_id}`));
      setList(prev => prev.filter(item => item.activity_id !== activity_id));
    } catch (error) {
      console.error('Error removing from list:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchList();
    }
  }, [currentUser]);

  return (
    <ListContext.Provider value={{ list, setList, fetchList, addToList, removeFromList }}>
      {children}
    </ListContext.Provider>
  );
};

export default ListProvider;
