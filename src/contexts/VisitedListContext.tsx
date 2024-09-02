import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { DatabaseItem } from '../types/databaseTypes';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { collection, getDocs, setDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

interface VisitedListContextProps {
  visitedList: DatabaseItem[];
  setVisitedList: React.Dispatch<React.SetStateAction<DatabaseItem[]>>;
  addToVisitedList: (activity: DatabaseItem) => Promise<void>;
  removeVisitedActivity: (activityId: string) => Promise<void>;
  fetchVisitedList: () => Promise<void>;
  toggleVisitedList: (activity: DatabaseItem) => Promise<void>;
}

const VisitedListContext = createContext<VisitedListContextProps | undefined>(undefined);

export const useVisitedList = () => {
  const context = useContext(VisitedListContext);
  if (!context) {
    throw new Error('useVisitedList must be used within a VisitedListProvider');
  }
  return context;
};

export const VisitedListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [visitedList, setVisitedList] = useState<DatabaseItem[]>([]);

  const fetchVisitedList = async () => {
    if (!currentUser) return;

    try {
      const visitedListRef = collection(db, 'userActivities');
      const q = query(visitedListRef, where('userId', '==', currentUser.uid), where('status', '==', 'visited'));
      const querySnapshot = await getDocs(q);

      const activities: DatabaseItem[] = querySnapshot.docs.map((doc) => doc.data() as DatabaseItem);
      setVisitedList(activities);
    } catch (error) {
      console.error('Error fetching visited list:', error);
    }
  };

  const addToVisitedList = async (activity: DatabaseItem) => {
    if (!currentUser) return;

    try {
      const activityDocRef = doc(db, 'userActivities', `${currentUser.uid}_${activity.activity_id}`);
      await setDoc(activityDocRef, {
        ...activity,
        userId: currentUser.uid,
        status: 'visited',
        timestamp: new Date(),
      });

      setVisitedList((prevList) => [...prevList, { ...activity }]);
    } catch (error) {
      console.error('Error adding to visited list:', error);
    }
  };

  const removeVisitedActivity = async (activityId: string) => {
    if (!currentUser) return;

    try {
      const activityDocRef = doc(db, 'userActivities', `${currentUser.uid}_${activityId}`);
      await deleteDoc(activityDocRef);

      setVisitedList((prevList) => prevList.filter((activity) => activity.activity_id !== activityId));
    } catch (error) {
      console.error('Error removing from visited list:', error);
    }
  };

  const toggleVisitedList = async (activity: DatabaseItem) => {
    const isAlreadyInList = visitedList.some(item => item.activity_id === activity.activity_id);
  
    if (isAlreadyInList) {
      await removeVisitedActivity(activity.activity_id);
    } else {
      await addToVisitedList(activity);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchVisitedList();
    }
  }, [currentUser]);

  const value = useMemo(() => ({
    visitedList,
    setVisitedList,
    addToVisitedList,
    removeVisitedActivity,
    fetchVisitedList,
    toggleVisitedList,
  }), [visitedList]);

  return (
    <VisitedListContext.Provider value={value}>
      {children}
    </VisitedListContext.Provider>
  );
};
