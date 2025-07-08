import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OAuthSignInPage from './components/OAuthSignInPage';
import Home from './components/Home';
import UploadSnap from './components/upload_video';
import Profile from './components/Profile'
import { useNavigate } from 'react-router-dom';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Sign In Page */}
        <Route path="/login" element={<OAuthSignInPage />} />

        {/* Home Page */}
        <Route path="/Home" element={<Home />} />

        <Route path="/upload_snap" element={<UploadSnap />} />
        <Route path="/Profile" element={<Profile />} />

        {/* Optional: Redirect root to login */}
        <Route path="/" element={<NavigateToLogin />} />
      </Routes>
    </BrowserRouter>
  );
} 

// Helper component to redirect from `/` to `/login`
function NavigateToLogin() {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate('/login');
  }, [navigate]);
  return null;
}