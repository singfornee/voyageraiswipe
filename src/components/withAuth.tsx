import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const withAuth = (Component: React.FC) => {
  return (props: any) => {
    const { currentUser } = useAuth() ?? {};
    const navigate = useNavigate();

    if (!currentUser) {
      navigate('/signin');
      return null;
    }

    return <Component {...props} />;
  };
};
