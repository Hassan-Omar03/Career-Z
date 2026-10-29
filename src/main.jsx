import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { TranslationProvider } from './context/TranslationContext';
import { initOfflineLearning } from './utils/offlineLearning';

initOfflineLearning();

// /ur/… addresses are the Urdu version of the site (for Urdu search results): the same app,
// opened in Urdu, with every in-app link kept under /ur.
const URDU = /^\/ur(\/|$)/.test(window.location.pathname);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={URDU ? '/ur' : undefined}>
      <TranslationProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </TranslationProvider>
    </BrowserRouter>
  </StrictMode>
);
