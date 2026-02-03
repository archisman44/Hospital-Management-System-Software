import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('doctor');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = e => {
    e.preventDefault();
    const success = login(username, password, role);
    if (success) {
      if (role === 'admin') navigate('/admin');
      else if (role === 'doctor') navigate('/doctor');
      else if (role === 'patient') navigate('/patient');
      else navigate('/login');
    } else {
      setError('Invalid credentials or role');
    }
  };

  return (
    <div className="container">
      <h2>Medical Chatbot Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username (e.g. admin)"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          autoFocus
        /><br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        /><br /><br />
        <label>
          Select Role:&nbsp;
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="doctor">Doctor Account</option>
            <option value="patient">Patient Account</option>
            <option value="admin">Admin Panel</option>
          </select>
        </label>
        <br /><br />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
      <p>
        Tip: Use username <b>admin</b> for admin access.<br />
        Doctors: ayesha, samuel, priya<br />
        Patients: john, jane
      </p>
    </div>
  );
}