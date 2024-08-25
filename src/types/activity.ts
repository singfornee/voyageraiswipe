export interface Activity {
  activity_id: string;  // Required: Uniquely identifies the activity.
  activity_name?: string;  // Optional: If the name isn't always present.
  activity_full_name?: string;  // Optional: If the full name isn't always present.
  activity_description?: string;  // Optional: If the description isn't always present.
  activities_keywords?: string[] | string;  // Allow both string and string[]
  min_duration?: number;  // Optional: If the minimum duration isn't always present.
  max_duration?: number;  // Optional: If the maximum duration isn't always present.
  price?: number;  // Optional: If the price isn't always present.
  currency?: string;  // Optional: If the currency isn't always present.
  attraction_id: string;  // Required: Ties the activity to an attraction.
  attraction_name?: string;  // Optional: Already correctly optional.
  imageUrl?: string | null;  // Optional: Correctly allows for a string URL or null.
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
