import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AppStoreProvider } from './store/AppStoreContext';
import { router } from './router';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppStoreProvider>
      <RouterProvider router={router} />
    </AppStoreProvider>
  </React.StrictMode>,
);
