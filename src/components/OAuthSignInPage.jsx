// src/components/OAuthSignInPage.jsx

import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage } from '@toolpad/core/SignInPage';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Import Firebase auth
import { auth, provider, signInWithPopup } from '../firebase'; // adjust path if needed

// Define your providers
const providers = [
  { id: 'google', name: 'Google' },
];

export default function OAuthSignInPage() {
  const theme = useTheme();
  const navigate = useNavigate(); // ✅ Moved to top level


  const signIn = async (selectedProvider) => {
    if (selectedProvider.id === 'google') {
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const email = user.email;
        const uid = user.uid;
        const username = email.split('@')[0]; // e.g., "nikunj" from "nikunj@gmail.com"

        console.log('✅ Signed in user:');
        console.log('Email:', email);
        console.log('UID:', uid);
        console.log('Username:', username);

        // Optionally: Store in localStorage or context
        localStorage.setItem('uid', uid);
        localStorage.setItem('email', email);
        localStorage.setItem('username', username);

        // OAuthSignInPage.jsx  (inside your try block, *after* you get user)
        await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/register_user/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid,
            username,
            email,
            bio: ""          // or collect it in a separate “edit profile” page
          }),
        });

        navigate('/Home'); // ✅ Safe to navigate

        return { user }; // Success
    }   catch (error) {
        console.error('Sign in error:', error.message);
        return { error: error.message };
    }
  }

  return { error: 'Unsupported provider' };
};

  return (
    <AppProvider theme={theme}>
      <SignInPage
        signIn={signIn}
        providers={providers}
        logo="https://your-logo-url-here.com/logo.png"  // Optional custom logo
        sx={{
          height: '100vh',
        }}
      />
    </AppProvider>
  );
}