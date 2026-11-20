import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ThemeContextProvider } from './context/ThemeContext';
import { BookingPage } from './pages/BookingPage';
import { LandingPage } from './pages/LandingPage';
import { MoviesPage } from './pages/MoviesPage';
import { RewatchPage } from './pages/RewatchPage';

export const App: React.FC = () => {
  return (
    <ThemeContextProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/rewatch" element={<RewatchPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeContextProvider>
  );
};

export default App;
