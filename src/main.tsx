import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <main className="app-shell">
      <section className="app-card" aria-labelledby="app-title">
        <div className="app-mark" aria-hidden="true">⚔</div>
        <p className="eyebrow">5e 2014 Character Companion</p>
        <h1 id="app-title">D&D Companion</h1>
        <p className="status">New engine foundation loaded.</p>
        <p className="detail">The legacy application is preserved separately. This branch is the clean rebuild.</p>
      </section>
    </main>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('D&D Companion root element was not found.');

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
