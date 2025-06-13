import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './css/ColorSchema.css'
import App from './views/App.jsx'
import Rotas from './views/Routes.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Rotas />
    </BrowserRouter>
  </StrictMode>,
)
