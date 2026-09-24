import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { aplicarTema, lerTemaSalvo } from './utils/tema'

// Aplica o tema salvo antes do primeiro render (sem "flash" do tema errado).
aplicarTema(lerTemaSalvo())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
