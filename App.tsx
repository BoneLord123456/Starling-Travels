
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Discover from './views/Discover';
import DestinationDetail from './views/DestinationDetail';
import WasteSubmission from './views/WasteSubmission';
import Profile from './views/Profile';
import Dashboard from './views/Dashboard';
import Leaderboard from './views/Leaderboard';
import GuideMarketplace from './views/GuideMarketplace';
import ChatRoom from './views/ChatRoom';
import AIChat from './views/AIChat';
import TripOptimizer from './views/TripOptimizer';
import Premium from './views/Premium';
import Settings from './views/Settings';
import Onboarding from './views/Onboarding';
import BookingFlow from './views/BookingFlow';
import TripDashboard from './views/TripDashboard';
import { User } from './types';
import { apiService } from './services/apiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial Session Check
    const saved = localStorage.getItem('ecobalance-user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const handleOnboarding = async (userData: { name: string; email: string; passwordHash: string }) => {
    const newUser: User = {
      ...userData,
      isPremium: false,
      joinedDate: new Date().toISOString(),
      ecoPoints: 0,
      loyaltyTier: 'Green Explorer'
    };
    const savedUser = await apiService.signup(newUser);
    if (savedUser) {
      setUser(savedUser);
    } else {
      // Handle signup error (e.g., email already exists)
      alert('Signup failed. Email might already be in use.');
    }
  };

  const handleLogin = async (email: string, passwordHash: string) => {
    const loggedInUser = await apiService.login(email, passwordHash);
    if (loggedInUser) {
      setUser(loggedInUser);
      return true;
    }
    return false;
  };

  if (loading) return null;

  if (!user) {
    return <Onboarding onComplete={handleOnboarding} onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Discover />} />
          <Route path="/destination/:id" element={<DestinationDetail />} />
          <Route path="/plan/:destId" element={<TripOptimizer />} />
          <Route path="/book/:destId" element={<BookingFlow />} />
          <Route path="/trip-dashboard" element={<TripDashboard />} />
          <Route path="/waste" element={<WasteSubmission />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/subscription" element={<Premium />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/guides/:destId" element={<GuideMarketplace />} />
          <Route path="/chat/:guideId" element={<ChatRoom />} />
          <Route path="/ai-chat/:destId" element={<AIChat />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
