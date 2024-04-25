import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';

function App() {
  return (
    <div className="wiki-page">
      <header className="custom-header">
        <div className="logo-container">
          <img src="your-logo.png" alt="Your Logo" />
        </div>
        <div className="navigation-container">
          <nav className="main-menu">
            <ul>
              <li><a href="#">Main Page</a></li>
              <li><a href="#">Contents</a></li>
              <li><a href="#">Current Events</a></li>
            </ul>
          </nav>
          <div className="search-bar">
            <input type="text" placeholder="Search Wikipedia" />
          </div>
          <nav className="user-menu">
            <ul>
              <li><a href="#">Log in</a></li>
              <li><a href="#">Create Account</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="content">
        <div className="sidebar">
          <h2>Contents</h2>
          <ul>
            <li>
              <a href="#early-life">Early Life</a>
            </li>
            <li>
              <a href="#career">Career</a>
            </li>
            <li>
              <a href="#philanthropy">Philanthropy</a>
            </li>
            <li>
              <a href="#personal-life">Personal Life</a>
            </li>
          </ul>
        </div>
        <div className="main-content">
          <p>
            <a class="btn btn-primary" data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
              Link with href
            </a>
            <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
              Button with data-bs-target
            </button>
          </p>
          <div class="collapse" id="collapseExample">
            <div class="card card-body">
              Some placeholder content for the collapse component. This panel is hidden by default but revealed when the user activates the relevant trigger.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
