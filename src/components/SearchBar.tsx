import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, InputAdornment, IconButton, List, ListItem, ListItemText, CircularProgress, Typography } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { useSearch } from '../contexts/SearchContext';
import { Activity } from '../types/activity';
import debounce from 'lodash.debounce';

const getTopMatches = (activities: Activity[], term: string, limit: number): Activity[] => {
  const normalizedTerm = term.toLowerCase();

  const scoredActivities = activities.map((activity) => {
    const activityName = activity.activity_full_name?.toLowerCase() || '';
    const score = getMatchScore(activityName, normalizedTerm);
    return { activity, score };
  });

  return scoredActivities
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.activity);
};

const getMatchScore = (text: string, term: string): number => {
  if (text === term) return 100;
  if (text.startsWith(term)) return 75;
  if (text.includes(term)) return 50;
  return 0;
};

const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { performSearch, searchResults, isLoading } = useSearch();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [localSearchResults, setLocalSearchResults] = useState<Activity[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const navigate = useNavigate();

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.trim()) {
        const results: Activity[] = await performSearch(term);
        if (results && results.length > 0) {
          const topMatches = getTopMatches(results, term, 5);
          setLocalSearchResults(topMatches);
        }
      }
    }, 300),
    [performSearch]
  );

  useEffect(() => {
    if (searchTerm.trim()) {
      debouncedSearch(searchTerm);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  }, [searchTerm, debouncedSearch]);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && searchTerm.trim()) {
      if (highlightedIndex >= 0 && highlightedIndex < localSearchResults.length) {
        handleSuggestionClick(localSearchResults[highlightedIndex]);
      } else {
        performSearch(searchTerm).then((results: Activity[]) => {
          if (results && results.length > 0) {
            setSearchHistory((prevHistory: string[]) => [searchTerm, ...prevHistory.slice(0, 4)]);
            navigate('/search-results');
          }
        });
      }
      setShowSuggestions(false);
    } else if (event.key === 'ArrowDown') {
      setHighlightedIndex((prevIndex) => (prevIndex + 1) % localSearchResults.length);
    } else if (event.key === 'ArrowUp') {
      setHighlightedIndex((prevIndex) =>
        prevIndex === 0 ? localSearchResults.length - 1 : prevIndex - 1
      );
    } else if (event.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: Activity) => {
    const fullName = suggestion.activity_full_name || 'Unknown Activity';
    setSearchTerm(fullName);
    navigate('/search-results');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const highlightText = (text: string, highlight: string) => {
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={index} style={{ fontWeight: 'bold', backgroundColor: '#FFD700' }}>
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search activities and attractions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyPress}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton aria-label="search" sx={{ color: 'accent.main' }}>
                <Search />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton aria-label="clear search" onClick={handleClearSearch} sx={{ color: 'accent.main' }}>
                <Clear />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            borderRadius: '50px',
            padding: '8px 16px',
            backgroundColor: 'background.paper',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          },
        }}
        aria-autocomplete="list"
        aria-controls={showSuggestions ? 'search-suggestion-list' : undefined}
        aria-expanded={showSuggestions}
      />
      {showSuggestions && (
        <List
          id="search-suggestion-list"
          sx={{
            position: 'absolute',
            width: '100%',
            backgroundColor: 'background.paper',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            maxHeight: '400px',
            overflowY: 'auto',
            mt: 1,
            padding: '0.5rem',
            animation: 'fadeIn 0.3s ease',
          }}
          role="listbox"
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
              <CircularProgress size={24} sx={{ color: 'accent.main' }} />
            </Box>
          ) : localSearchResults.length > 0 ? (
            localSearchResults.map((suggestion, index) => (
              <ListItem
                button
                key={suggestion.activity_id}
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  backgroundColor:
                    highlightedIndex === index ? 'rgba(106, 90, 205, 0.2)' : 'transparent',
                  marginBottom: '0.5rem',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: 'rgba(106, 90, 205, 0.3)',
                  },
                }}
                role="option"
                aria-selected={highlightedIndex === index}
              >
                <ListItemText
                  primary={highlightText(suggestion.activity_full_name || 'Unnamed Activity', searchTerm)}
                  sx={{
                    fontSize: '1rem',
                    color: 'text.primary',
                  }}
                />
              </ListItem>
            ))
          ) : (
            <Box sx={{ padding: '1rem', textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No results found.
              </Typography>
            </Box>
          )}
        </List>
      )}
    </Box>
  );
};

export default SearchBar;
