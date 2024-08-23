import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, InputAdornment, IconButton, List, ListItem, ListItemText } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useSearch } from '../contexts/SearchContext';
import { Activity } from '../types/activity';

const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { performSearch, searchResults } = useSearch();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      performSearch(searchTerm);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm, performSearch]);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      performSearch(searchTerm);
      navigate('/search-results'); // Navigate to the search results page
      setShowSuggestions(false); // Hide suggestions after pressing Enter
    }
  };

  const handleSuggestionClick = (suggestion: Activity) => {
    setSearchTerm(suggestion.activity_full_name || '');
    setShowSuggestions(false);
    navigate('/search-results');
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search activities and attractions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton>
                <Search />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            borderRadius: '50px',
          },
        }}
      />
      {showSuggestions && searchResults.length > 0 && (
        <List
          sx={{
            position: 'absolute',
            width: '100%',
            backgroundColor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 3,
            zIndex: 1000,
            maxHeight: '400px', // Increase max height for more visibility
            overflowY: 'auto',
            mt: 1, // Margin-top to separate from the search bar
            padding: '0.5rem', // Add padding to the entire list
          }}
        >
          {searchResults.map((suggestion) => (
            <ListItem
              button
              key={suggestion.activity_id}
              onClick={() => handleSuggestionClick(suggestion)}
              sx={{
                padding: '1rem', // Increase padding for more clickable space
                fontSize: '1.2rem', // Increase font size for better visibility
                backgroundColor: 'background.paper',
                marginBottom: '0.5rem', // Add margin between items
                borderRadius: '8px', // Add border-radius to items
                '&:hover': {
                  backgroundColor: 'action.hover', // Add hover effect
                },
              }}
            >
              <ListItemText
                primary={suggestion.activity_full_name}
                sx={{
                  fontSize: '1.2rem', // Further increase font size
                  color: 'text.primary',
                }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default SearchBar;
