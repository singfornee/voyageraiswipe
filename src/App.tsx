import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ForgotPassword from './components/ForgotPassword';
import NavBar from './components/NavBar';
import SearchBar from './components/SearchBar';
import { BucketListProvider } from './contexts/BucketListContext';
import { VisitedListProvider } from './contexts/VisitedListContext';
import { Box, CssBaseline, Container, ThemeProvider, IconButton, CircularProgress } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { lightTheme, darkTheme } from './styles/theme';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import './styles/App.css';

const Dashboard = lazy(() => import('./components/Dashboard'));
const Explore = lazy(() => import('./components/Explore'));
const BucketList = lazy(() => import('./components/BucketList'));
const Visited = lazy(() => import('./components/Visited'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const SearchResults = lazy(() => import('./components/SearchResults'));

const App: React.FC = () => {
  const auth = useAuth();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { currentUser, loading } = auth;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Router>
        {currentUser ? (
          <Box className="outer-container">
            <Box
              className="app-container"
              sx={{
                display: 'flex',
                justifyContent: 'center',
                padding: isSmallScreen ? '8px' : '16px',
                minHeight: '100vh',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: isSmallScreen ? 'column' : 'row',
                  maxWidth: '1200px',
                  width: '100%',
                }}
              >
                <NavBar />
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    padding: isSmallScreen ? '8px' : '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: '1000px', // Fixed maxWidth for main content area
                    margin: '0 auto',    // Center the content
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="flex-end"
                    width="100%"
                    mb={isSmallScreen ? 1 : 2}
                  >
                    <IconButton onClick={handleToggleTheme} color="inherit">
                      {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                  </Box>
                  {/* Wrap SearchBar in a Box for consistent width */}
                  <Box sx={{ width: '100%', maxWidth: '600px', mb: 2 }}>
                    <SearchBar />
                  </Box>
                  <Container
                    sx={{
                      width: '100%',
                      padding: '16px',
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <VisitedListProvider>
                      <BucketListProvider>
                        <Suspense fallback={<CircularProgress />}>
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/explore" element={<Explore />} />
                            <Route path="/bucketlist" element={<BucketList />} />
                            <Route path="/visited" element={<Visited />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/search-results" element={<SearchResults />} />
                            <Route path="*" element={<Navigate to="/" />} />
                          </Routes>
                        </Suspense>
                      </BucketListProvider>
                    </VisitedListProvider>
                  </Container>
                </Box>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box className="auth-container" sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Routes>
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgotpassword" element={<ForgotPassword />} />
              <Route path="*" element={<Navigate to="/signin" />} />
            </Routes>
          </Box>
        )}
      </Router>
    </ThemeProvider>
  );
};

export default App;
