import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { startAnalytics } from './utils/analytics.js';
import { loadItems } from './admin/useAdmin.js';

startAnalytics();
// Start downloading the item data now, in parallel with drawing the page.
loadItems().catch(() => {}); // the page shows the failure itself

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
