import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {/* Global toast notifications — positioned at top on mobile */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1C1C2E',
              color: '#F1F0FF',
              border: '1px solid #2A2A40',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#8B5CF6', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#EC4899', secondary: '#fff' } },
          }}
        />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
