// src/utils/geocoding.ts

import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY; // Make sure to set your API key

export const geocodeCity = async (city: string, country: string) => {
  const address = `${city}, ${country}`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await axios.get(url);
    const { data } = response;

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else {
      console.error('Geocoding failed:', data.status);
      return null;
    }
  } catch (error) {
    console.error('Error during geocoding:', error);
    return null;
  }
};
