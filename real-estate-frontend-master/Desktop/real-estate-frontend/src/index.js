import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Log full error details; "Script error." usually means the browser hid the real error (e.g. cross-origin)
window.onerror = function (message, source, lineno, colno, error) {
  console.error("[window.onerror]", { message, source, lineno, colno, error: error?.stack || error });
  return false;
};
window.onunhandledrejection = function (event) {
  console.error("[unhandledrejection]", event.reason);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
