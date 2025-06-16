import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Navigate } from "react-router-dom";

import NavBar from '../components/NavBar.jsx'
import Home from './public/Home.jsx'
import Dashboard from './admin/Dashboard.jsx'
import Login from './public/Login.jsx'
import Register from './public/Register.jsx'
import UserChatWindow from './public/UserChatWindow.jsx'
import { getUserRole } from '../services/auth.js';

export default function App() {
  const [theme, setTheme] = useState(() => {

    const storedTheme = localStorage.getItem('theme')
    
    if (storedTheme) return storedTheme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  })

  function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
 }

  function RoleProtectedRoute({ allowedRoles, children }) {
    const token = localStorage.getItem("token");
    const role = getUserRole();
    if (!token) return <Navigate to="/login" />;
    if (!allowedRoles.includes(role)) return <Navigate to="/" />;
    return children;
  }

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)

    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const [authChanged, setAuthChanged] = useState(0);

  return (
    <main className='flex flex-col h-full'>
      <NavBar theme={theme} toggleTheme={toggleTheme} authChanged={authChanged} />      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={
          <RoleProtectedRoute allowedRoles={["usuario"]}>
            <UserChatWindow />
          </RoleProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <RoleProtectedRoute allowedRoles={["admin", "funcionario"]}>
            <Dashboard />
          </RoleProtectedRoute>
        } />
        <Route path="/login" element={<Login onLogin={() => setAuthChanged(c => c + 1)} />} />
        <Route path="/register" element={<Register onRegister={() => setAuthChanged(c => c + 1)} />} />
        <Route path="/user-chat-window" element={<UserChatWindow />} />
      </Routes>
    </main>
  );
}
