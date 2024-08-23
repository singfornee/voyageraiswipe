import React from 'react';
import { useSearch } from '../contexts/SearchContext';
import ActivityCard from './ActivityCard';
import { Box, Grid } from '@mui/material';

const SearchResults: React.FC = () => {
  const { searchResults } = useSearch();

  return (
    <Box sx={{ p: 3 }}>
      {searchResults.length > 0 ? (
        <Grid container spacing={2}>
          {searchResults.map((activity) => (
            <Grid item xs={12} sm={6} md={4} key={activity.activity_id}>
              <ActivityCard
                activity={activity}
                isFavorite={false}
                isVisited={false}
                onPass={() => {}}
                onAddToBucketList={() => Promise.resolve()}
                onMarkAsVisited={() => Promise.resolve()}
                onClick={() => {}}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <p>No activities found.</p>
      )}
    </Box>
  );
};

export default SearchResults;
