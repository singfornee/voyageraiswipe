import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Activity } from '../types/activity';
import { useAuth } from './AuthContext';
import { db } from '../firebase'; // Import Firebase Firestore
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

interface VisitedListContextProps {
  visitedList: Activity[];
  setVisitedList: React.Dispatch<React.SetStateAction<Activity[]>>;
  addToVisitedList: (activity: Activity) => void;
  removeVisitedActivity: (activityId: string) => void;
  fetchVisitedList: () => void;
}

const VisitedListContext = createContext<VisitedListContextProps | undefined>(undefined);

export const useVisitedList = () => {
  const context = useContext(VisitedListContext);
  if (!context) {
    throw new Error('useVisitedList must be used within a VisitedListProvider');
  }
  return context;
};

export const VisitedListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [visitedList, setVisitedList] = useState<Activity[]>([]);

  const fetchVisitedList = async () => {
    if (!currentUser) return;

    const visitedListRef = collection(db, 'userActivities');
    const q = query(visitedListRef, where('userId', '==', currentUser.uid), where('status', '==', 'visited'));

    try {
      const querySnapshot = await getDocs(q);
      const activities: Activity[] = querySnapshot.docs.map(doc => {
        return doc.data() as Activity;
      });
      setVisitedList(activities);
    } catch (error) {
      console.error('Error fetching visited list:', error);
    }
  };

  const addToVisitedList = async (activity: Activity) => {
    if (!currentUser) return;

    try {
      const visitedListRef = collection(db, 'userActivities');
      await addDoc(visitedListRef, {
        ...activity,
        userId: currentUser.uid,
        status: 'visited',
        timestamp: new Date(),
      });

      setVisitedList((prevList) => [...prevList, activity]);
    } catch (error) {
      console.error('Error adding to visited list:', error);
    }
  };

  const removeVisitedActivity = async (activityId: string) => {
    if (!currentUser) return;

    try {
      const visitedListRef = collection(db, 'userActivities');
      const q = query(visitedListRef, where('userId', '==', currentUser.uid), where('activityId', '==', activityId), where('status', '==', 'visited'));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      setVisitedList((prevList) => prevList.filter((activity) => activity.activity_id !== activityId));
    } catch (error) {
      console.error('Error removing from visited list:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchVisitedList();
    }
  }, [currentUser]);

  return (
    <VisitedListContext.Provider value={{ visitedList, setVisitedList, addToVisitedList, removeVisitedActivity, fetchVisitedList }}>
      {children}
    </VisitedListContext.Provider>
  );
};
