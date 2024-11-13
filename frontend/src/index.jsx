import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App';
import MapOfEverything from './MapOfEverything';
import NavBar from './NavBar';
import reportWebVitals from './reportWebVitals';

const MainLayout = () => (
  <div>
    <NavBar /> {/* This will remain constant across all pages */}
    <Routes>
      <Route path="/:topic" element={<App />} />
      <Route path="/" element={<Navigate to="/Wiki of Everything" />} />
      <Route path="/map" element={<MapOfEverything />} />
    </Routes>
  </div>
);

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <MainLayout />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
