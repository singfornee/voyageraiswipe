import React from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { DatabaseItem } from '../types/databaseTypes';
import { toast } from 'react-toastify';

interface MapComponentProps {
  currentActivity: DatabaseItem;
}

const MapComponent: React.FC<MapComponentProps> = ({ currentActivity }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '', // Replace with your actual API key
  });  

  if (loadError) {
    toast.error('Error loading Google Maps');
    return <div>Map not available</div>;
  }

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  if (!currentActivity.latitude || !currentActivity.longitude) {
    toast.error('Invalid location data.');
    return <div>Map not available</div>;
  }

  const mapContainerStyle = {
    height: '200px',
    width: '100%',
    borderRadius: '8px',
  };

  const mapCenter = {
    lat: Number(currentActivity.latitude),
    lng: Number(currentActivity.longitude),
  };

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={14}
      center={mapCenter}
    >
      <Marker position={mapCenter} />
    </GoogleMap>
  );
};

export default MapComponent;
