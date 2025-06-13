import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
<<<<<<< Updated upstream
import './css/ColorSchema.css'
import App from './views/App.jsx'
=======
import Rotas from './views/Routes.jsx'
import { BrowserRouter } from 'react-router-dom'
>>>>>>> Stashed changes

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Rotas />
    </BrowserRouter>
  </StrictMode>,
)
