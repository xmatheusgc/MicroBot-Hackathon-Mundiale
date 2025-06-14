import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'

import NavBar from '../components/NavBar.jsx'
import Home from './public/Home.jsx'
import Dashboard from './admin/Dashboard.jsx'
import ClientChat from './public/ClientChat.jsx'

export default function App() {
  const [theme, setTheme] = useState(() => {

    const storedTheme = localStorage.getItem('theme')
    
    if (storedTheme) return storedTheme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)

    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <main className='flex flex-col h-full'>
      <NavBar theme={theme} toggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<ClientChat />} />
        <Route path="/Dashboard" element={<Dashboard />} />
      </Routes>
    </main>
  );
}
