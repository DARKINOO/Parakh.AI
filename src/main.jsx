import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import UserContext from './context/UserContext.jsx'
import LoadingProvider from './context/LoadingProvider.jsx'

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <LoadingProvider>
      <UserContext>
        <App />
      </UserContext>
    </LoadingProvider>
  </StrictMode>
)