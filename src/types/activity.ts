
export interface Activity {
  activity_id: string;
  activity_name?: string;  // Optional if not always present
  activity_full_name?: string;  // Optional if not always present
  activity_description?: string;  // Optional if not always present
  activities_keywords?: string[];  // Optional if not always present
  min_duration?: number;  // Optional if not always present
  max_duration?: number;  // Optional if not always present
  price?: number;  // Optional if not always present
  currency?: string;  // Optional if not always present
  attraction_id: string;
  attraction_name?: string;  // Already optional
  imageUrl?: string | null;  // Already optional
}



export interface Attraction {
  attraction_id: string;
  attraction_name: string;
  attraction_category: string;
  attraction_subcategory: string;
  location_city: string;
  location_country: string;
  opening_hour: string;
  latitude: number;
  longitude: number;
}
