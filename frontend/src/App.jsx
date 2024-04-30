import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AccordionItem from './AccordionItem';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';

function modifyATags(inputString) {
  // Define the regex pattern to match <a> tags with any content inside
  const regex = /<a>(.*?)<\/a>/g;
  const baseUrl = window.location.origin;
  // Use the replace function to replace the matched pattern with the desired format
  const modifiedString = inputString.replace(regex, `<a href="${baseUrl}/$1">$1</a>`);

  return modifiedString;
}

function capitalizeString(inputString) {
  // Define an array of words to exclude from capitalization
  const excludedWords = ['of', 'the', 'for', 'in', 'and', 'or', 'but', 'with'];

  // Split the input string into an array of words
  const words = inputString.split(/\s+/);

  // Capitalize the first letter of each word, except for excluded words
  const capitalizedWords = words.map((word, index) => {
    if (index === 0 || !excludedWords.includes(word.toLowerCase())) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    } else {
      return word.toLowerCase(); // Keep excluded words in lowercase
    }
  });

  // Join the capitalized words back into a string
  return capitalizedWords.join(' ');
}

function App() {
  const [summary, setSummary] = useState('');
  const [sections, setSections] = useState([]);

  const { topic } = useParams();

  
  
  // useEffect to call API on page load
  useEffect(() => {
    // Define async function to fetch API data
    const fetchData = async () => {
      try {
        // Make API call using axios (replace 'apiEndpoint' with your actual API endpoint)
        const response = await axios.post('http://127.0.0.1:5000/get-summary/'+topic);
        const responseData = response.data.response; // Extract response data
        setSummary(responseData.summary); // Set summary state
        setSections(responseData.sections); // Set sections state
      } catch (error) {
        console.error('Error fetching API data:', error);
      }
    };

    fetchData();

    // Cleanup function (optional)
    return () => {
      // Perform cleanup if necessary
    };
  }, []);

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
          {sections.length > 0 ? (
            <ul>
              {sections.map((section, index) => (
                <li key={index}>
                  <a href={`#${section.title}`}>{section.title}</a>
                </li>
              ))}
            </ul>
          ) : (
            <p>Loading...</p>
          )}
        </div>
        <div className="main-content">
          <h1>{capitalizeString(topic)}</h1>
          <p dangerouslySetInnerHTML={{ __html: modifyATags(summary) }} />

          {sections.length > 0 ? (
            <div className="accordion accordion-flush">
              {sections.map((section, index) => (
                <AccordionItem key={index} topic={topic} section_prop={section} index={index} />
              ))}
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
