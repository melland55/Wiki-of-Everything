import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App';
import MapOfEverything from './MapOfEverything';
import reportWebVitals from './reportWebVitals';


ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/:topic" element={<App />} />
        <Route path="/" element={<Navigate to="/Wiki of Everything" />} />
        <Route exact path="/map" element={<MapOfEverything />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
