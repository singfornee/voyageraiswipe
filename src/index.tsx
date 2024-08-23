import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { CustomThemeProvider } from './contexts/ThemeContext';
import { SearchProvider } from './contexts/SearchContext'; // Import the SearchProvider

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement as HTMLElement);

root.render(
  <React.StrictMode>
    <CustomThemeProvider>
      <AuthProvider>
        <SearchProvider> {/* Wrap your app with SearchProvider */}
          <App />
        </SearchProvider>
      </AuthProvider>
    </CustomThemeProvider>
  </React.StrictMode>
);
