import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { CustomThemeProvider } from './contexts/ThemeContext';
import { SearchProvider } from './contexts/SearchContext';
import 'leaflet/dist/leaflet.css';


const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement as HTMLElement);

root.render(
  <React.StrictMode>
    <CustomThemeProvider>
      <AuthProvider>
        <SearchProvider>
          <App />
        </SearchProvider>
      </AuthProvider>
    </CustomThemeProvider>
  </React.StrictMode>
);
