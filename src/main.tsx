import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/app.css'

const wortel = document.getElementById('root')
if (!wortel) throw new Error('Element #root ontbreekt in index.html')

createRoot(wortel).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
