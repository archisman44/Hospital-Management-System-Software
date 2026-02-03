import React from 'react';
import { useAuth } from '../auth/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="container">
      <h2>Profile</h2>
      <p><b>Username:</b> {user?.username}</p>
      <p><b>Role:</b> {user?.isAdmin ? 'Admin' : 'User'}</p>
      <p>This page can be extended with medical history, preferences, etc.</p>
    </div>
  );
}