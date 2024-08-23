import axios from 'axios';

const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

export const fetchAttractionPhoto = async (attractionName: string): Promise<string | null> => {
  try {
    const response = await axios.get(UNSPLASH_API_URL, {
      params: {
        query: attractionName,
        per_page: 1,
      },
      headers: {
        Authorization: `Client-ID ${process.env.REACT_APP_UNSPLASH_ACCESS_KEY}`,
      },
    });

    // Log response for debugging
    console.log('Unsplash API Response:', response);

    if (response.data && response.data.results && response.data.results.length > 0) {
      return response.data.results[0].urls.regular;
    }

    return null;
  } catch (error) {
    console.error('Error fetching attraction photo from Unsplash:', error);
    return null;
  }
};
