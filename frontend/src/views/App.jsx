import { useState, useEffect } from 'react'
import ChatWindow from '../components/ChatWindow.jsx'
import MicroBotPanel from '../components/MicroBotPanel.jsx'
import NavBar from '../components/NavBar.jsx'

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
    <main className='flex flex-col w-full h-full px-8 py-6 gap-3'>
      <NavBar theme={theme} toggleTheme={toggleTheme} />
      <div className='flex w-full h-full gap-6'>
        <ChatWindow />
        <MicroBotPanel />
      </div>
    </main>
  );
}
