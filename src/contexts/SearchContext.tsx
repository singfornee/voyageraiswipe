import React, { createContext, useState, ReactNode } from 'react';
import { Activity } from '../types/activity';
import { fetchSuggestions } from '../api/searchService'; // Correctly import fetchSuggestions

interface SearchContextProps {
  searchResults: Activity[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  performSearch: (term: string) => void;
}

const SearchContext = createContext<SearchContextProps | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Activity[]>([]);

  const performSearch = async (term: string) => {
    console.log('Performing search for:', term); // Add this line
    if (term.trim()) {
      const results = await fetchSuggestions(term.trim());
      console.log('Search results:', results); // Add this line
      setSearchResults(results);
    }
  };
  

  return (
    <SearchContext.Provider value={{ searchResults, searchTerm, setSearchTerm, performSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = React.useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
