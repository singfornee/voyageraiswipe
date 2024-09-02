import React, { createContext, useState, useCallback, useContext, ReactNode, useMemo } from 'react';
import { DatabaseItem } from '../types/databaseTypes';
import { fetchSuggestions } from '../api/searchService'; // Adjust based on your API function
import debounce from 'lodash.debounce';

interface SearchContextProps {
  searchResults: DatabaseItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  performSearch: (term: string) => Promise<DatabaseItem[]>;
  clearSearch: () => void;
  isLoading: boolean;
  error: string | null;
}

const SearchContext = createContext<SearchContextProps | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<DatabaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useMemo(
    () => debounce(async (term: string): Promise<DatabaseItem[]> => {
      try {
        setIsLoading(true);
        setError(null);
        if (term.trim()) {
          console.log(`Searching for: ${term}`); // Debugging line
          const results = await fetchSuggestions(term.trim());
          console.log(`Results:`, results); // Debugging line
          setSearchResults(results);
          return results; // Return results here
        } else {
          setSearchResults([]);
          return [];
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch search results. Please check your connection or try again later.');
        setSearchResults([]);
        return []; // Return an empty array in case of an error
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const performSearch = useCallback(async (term: string): Promise<DatabaseItem[]> => {
    setSearchTerm(term);
    return await debouncedSearch(term); // Ensure to return the results
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
  }, []);

  const contextValue = useMemo(
    () => ({
      searchResults,
      searchTerm,
      setSearchTerm,
      performSearch,
      clearSearch,
      isLoading,
      error,
    }),
    [searchResults, searchTerm, performSearch, clearSearch, isLoading, error]
  );

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
