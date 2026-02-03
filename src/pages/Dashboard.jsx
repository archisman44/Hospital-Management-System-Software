import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="container">
      <h1>Welcome, {user?.username}!</h1>
      <p>This is your Medical Chatbot Assistant dashboard.</p>
      <nav>
        <Link to="/chatbot">Chatbot</Link>
        <Link to="/profile">Profile</Link>
        {user?.isAdmin && <Link to="/admin">Admin Panel</Link>}
        <button onClick={logout}>Logout</button>
      </nav>
      <hr />
      <section>
        <h2>Get Started</h2>
        <ul>
          <li>Use the <b>Chatbot</b> for medical assistance.</li>
          <li>View or edit your <b>Profile</b>.</li>
          {user?.isAdmin && <li>Manage users and data in the <b>Admin Panel</b>.</li>}
        </ul>
      </section>
    </div>
  );
}