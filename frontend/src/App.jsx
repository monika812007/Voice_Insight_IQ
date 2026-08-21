import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { HistoryPage } from './pages/HistoryPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LikedPage } from './pages/LikedPage';
import { SettingsPage } from './pages/SettingsPage';
import { ComparePage } from './pages/ComparePage';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WishlistProvider>
          <Router>
            <div className="app-shell font-sans flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route path="/explore" element={<SearchResultsPage />} />
                  <Route path="/product/:productId" element={<ProductDetailsPage />} />
                  <Route path="/liked" element={<LikedPage />} />
                  <Route path="/wishlist" element={<LikedPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/alerts" element={<NotificationsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
