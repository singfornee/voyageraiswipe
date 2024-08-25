import React, { createContext, useState, useCallback, useContext, ReactNode, useMemo } from 'react';
import { Activity } from '../types/activity';
import { fetchSuggestions } from '../api/searchService';
import debounce from 'lodash.debounce';

interface SearchContextProps {
  searchResults: Activity[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  performSearch: (term: string) => Promise<Activity[]>;  // Updated return type to Promise<Activity[]>
  isLoading: boolean;
  error: string | null;
}

const SearchContext = createContext<SearchContextProps | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce the search function to limit API calls
  const debouncedSearch = useMemo(
    () => debounce(async (term: string): Promise<Activity[]> => {  // Updated return type to Promise<Activity[]>
      try {
        setIsLoading(true);
        setError(null);  // Reset any previous errors
        if (term.trim()) {
          const results = await fetchSuggestions(term.trim());
          setSearchResults(results);
          return results;  // Return results as Activity[]
        } else {
          setSearchResults([]);
          return [];  // Return an empty array if no term
        }
      } catch (err) {
        setError('Failed to fetch search results. Please try again.');
        setSearchResults([]);
        return [];  // Return an empty array in case of an error
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const performSearch = useCallback((term: string): Promise<Activity[]> => {
    setSearchTerm(term);
    return debouncedSearch(term);  // Return the result of debouncedSearch
  }, [debouncedSearch]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({ searchResults, searchTerm, setSearchTerm, performSearch, isLoading, error }),
    [searchResults, searchTerm, performSearch, isLoading, error]
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
