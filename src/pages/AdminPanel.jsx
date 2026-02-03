import React from 'react';
import { useAuth } from '../auth/AuthContext';

export default function AdminPanel() {
  const { user } = useAuth();
  if (!user?.isAdmin) return <div className="container">Access Denied</div>;

  return (
    <div className="container">
      <h2>Admin Panel</h2>
      <p>As an admin, you can manage users, view analytics, and monitor system health.</p>
      <ul>
        <li><b>User Management:</b> Add, remove, or edit users <i>(not implemented)</i></li>
        <li><b>Analytics:</b> View chatbot usage statistics <i>(not implemented)</i></li>
        <li><b>System Settings:</b> Configure system-wide settings <i>(not implemented)</i></li>
      </ul>
    </div>
  );
}