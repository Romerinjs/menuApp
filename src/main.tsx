import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { TenantProvider } from './context/TenantContext';
import { ThemeProvider } from './context/ThemeContext';

// Estilos globales y específicos
import './styles/variables.css';
import './styles/global.css';
import './styles/admin.css';
import './styles/client.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <TenantProvider>
        <App />
      </TenantProvider>
    </ThemeProvider>
  </React.StrictMode>
);
