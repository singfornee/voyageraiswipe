import axios, { AxiosRequestConfig } from 'axios';

const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

const photoCache: Record<string, string | null> = {};

const fetchWithRetry = async (url: string, options: AxiosRequestConfig, retries = 3): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url, options);
    } catch (error) {
      if (i < retries - 1) {
        console.warn(`Retrying... (${i + 1})`);
      } else {
        throw error;
      }
    }
  }
};

export const fetchAttractionPhoto = async (attractionName: string): Promise<string | null> => {
  // Return cached image URL if available
  if (photoCache[attractionName] !== undefined && photoCache[attractionName] !== null) {
    return photoCache[attractionName];
  }

  console.log('Fetching photo for:', attractionName);

  try {
    const response = await fetchWithRetry(UNSPLASH_API_URL, {
      params: {
        query: attractionName,
        per_page: 1,
      },
      headers: {
        Authorization: `Client-ID ${process.env.REACT_APP_UNSPLASH_ACCESS_KEY}`,
      },
      timeout: 5000, // Set a timeout of 5 seconds
    });

    console.log('Unsplash API Response:', response.data);

    if (response.data?.results?.length > 0) {
      const imageUrl = response.data.results[0].urls.regular;
      photoCache[attractionName] = imageUrl; // Cache the fetched image URL
      return imageUrl;
    } else {
      console.warn(`No images found for attraction: ${attractionName}`);
      photoCache[attractionName] = 'default-image-url.jpg';  // Cache the default image URL
      return 'default-image-url.jpg';
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error while fetching attraction photo:', error.message);
      if (error.response?.status === 403) {
        console.error('Access forbidden: Please check your API key and rate limits.');
      } else if (error.response?.status === 404) {
        console.error('Not found: The requested resource does not exist.');
      }
    } else {
      console.error('Unknown error while fetching attraction photo:', error);
    }
    photoCache[attractionName] = 'default-image-url.jpg'; // Cache the fallback image
    return 'default-image-url.jpg';
  }
};
