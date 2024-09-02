import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: '/path/to/cute-marker.png', // Add your custom marker image here
  iconSize: [25, 35], // Size of the icon
  iconAnchor: [12.5, 35], // Anchor point for the icon
});

interface Activity {
  id: number;
  name: string;
  location: [number, number]; // LatLng tuple
  country: string;
  type: 'bucket' | 'visited';
}

// Dummy data for activities
const activities: Activity[] = [
  { id: 1, name: 'Activity 1', location: [51.505, -0.09], country: 'UK', type: 'bucket' },
  { id: 2, name: 'Activity 2', location: [48.8566, 2.3522], country: 'France', type: 'visited' },
  { id: 3, name: 'Activity 3', location: [40.7128, -74.0060], country: 'USA', type: 'bucket' },
];

interface MyMapViewProps {
  viewType: 'bucket' | 'visited';
}

const MyMapView: React.FC<MyMapViewProps> = ({ viewType }) => {
  // Filter activities based on the selected view type
  const filteredActivities = activities.filter(activity => activity.type === viewType);

  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
      />
      {filteredActivities.map(activity => (
        <Marker key={activity.id} position={activity.location} icon={customIcon}>
          <Popup>{activity.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MyMapView;
