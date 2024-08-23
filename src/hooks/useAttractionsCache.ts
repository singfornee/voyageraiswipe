// src/hooks/useAttractionsCache.ts

import React from 'react';
import { fetchAttractionById } from '../firestore';

const useAttractionsCache = () => {
  const cache = React.useRef<Map<string, any>>(new Map());

  const getAttraction = async (attractionId: string) => {
    if (cache.current.has(attractionId)) {
      return cache.current.get(attractionId);
    }

    const attraction = await fetchAttractionById(attractionId);
    if (attraction) {
      cache.current.set(attractionId, attraction);
    }
    return attraction;
  };

  return getAttraction;
};

export default useAttractionsCache;
