// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n/config'; // This line correctly imports your configuration

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
