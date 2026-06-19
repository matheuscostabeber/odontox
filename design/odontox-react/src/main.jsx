import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ClinicProvider } from './context/ClinicContext';
import { ModalProvider } from './context/ModalContext';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ClinicProvider>
          <ModalProvider>
            <App />
          </ModalProvider>
        </ClinicProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
