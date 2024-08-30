import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { fetchAttractionById } from '../firestore'; // Ensure correct import
import { Activity } from '../types/activity'; // Ensure correct import
import { toast } from 'react-toastify';

interface MapComponentProps {
  currentActivity: Activity;
}

const MapComponent: React.FC<MapComponentProps> = ({ currentActivity }) => {
  const [attractionData, setAttractionData] = useState<{
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    const loadAttractionData = async () => {
      try {
        if (currentActivity && currentActivity.attraction_id) {
          const attraction = await fetchAttractionById(currentActivity.attraction_id);
          if (attraction) {
            const latitude = Number(attraction.latitude);
            const longitude = Number(attraction.longitude);

            if (!isNaN(latitude) && !isNaN(longitude)) {
              setAttractionData({
                city: attraction.location_city || 'Unknown City',
                country: attraction.location_country || 'Unknown Country',
                latitude,
                longitude,
              });
            } else {
              toast.error('Invalid location data.');
            }
          } else {
            toast.error('Attraction data is not available.');
          }
        }
      } catch (error) {
        toast.error('Failed to load attraction details.');
      }
    };

    loadAttractionData();
  }, [currentActivity]);

  if (!attractionData) {
    return <div>Loading map...</div>;
  }

  const mapContainerStyle = {
    height: '200px',
    width: '100%',
  };

  const mapCenter = {
    lat: attractionData.latitude,
    lng: attractionData.longitude,
  };

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} zoom={14} center={mapCenter}>
      <Marker position={mapCenter} />
    </GoogleMap>
  );
};

export default MapComponent;
