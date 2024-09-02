export type DatabaseItem = {
  activity_id: string;
  attraction_id: string;
  activity_full_name: string;
  attraction_name: string;
  attraction_category: string;
  attraction_subcategory: string;
  location_city: string;
  location_country: string;
  opening_hour?: string; // Optional field
  latitude: number;
  longitude: number;
  activity_description?: string; // Optional field
  activities_keywords?: string | string[]; // Allow both string and string array
  min_duration?: number; // Optional field
  max_duration?: number; // Optional field
  price?: number; // Optional field
  currency?: string; // Optional field
  unique_feature_one?: string; // Optional field
  unique_feature_two?: string; // Optional field
  unique_feature_three?: string; // Optional field
  secret_tip?: string; // Optional field
  collection?: string; // Optional field
  imageUrl?: string | null; // Optional field, can be a string or null
  timestamp?: string | number | Date; // Add this line
  note?: string;
  rating?: number; // New field for user rating
};
