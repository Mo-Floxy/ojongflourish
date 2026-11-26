import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap-reboot.min.css'
import './styles/global.css'
import './styles/animations.css'
import './styles/responsive.css'
import './styles/electric-blue.css'
import App from './App'
import { SoundProvider } from './components/SoundController'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SoundProvider>
        <App />
      </SoundProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
