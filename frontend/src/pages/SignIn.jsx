// pages/SignIn.jsx
import React from 'react';
import { signInWithGoogle } from '../firebase/auth';

const SignIn = ({ setUser }) => {
  const handleLogin = async () => {
    const user = await signInWithGoogle();
    setUser(user); // pass user info to parent App
  };

  return (
    <div className="text-white text-center p-6">
      <h1 className="text-3xl mb-4">Welcome to phoniX</h1>
      <button
        onClick={handleLogin}
        className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default SignIn;
