import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext' // ✅ ADD

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider> {/* ✅ ADD */}
      <App />
    </AuthProvider>
  </StrictMode>,
)