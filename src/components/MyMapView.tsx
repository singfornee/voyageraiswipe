import React from 'react';
import WorldMap from './WorldMap.ts';

const visitedCountries = ['United Kingdom', 'France', 'Germany'];
const bucketListCountries = ['Japan', 'Australia'];

const MyMapView = () => (
  <WorldMap visitedCountries={visitedCountries} bucketListCountries={bucketListCountries} />
);

export default MyMapView;
