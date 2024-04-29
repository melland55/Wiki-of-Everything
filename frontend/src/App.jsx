import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AccordionItem from './AccordionItem';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';

function App() {
  const [summary, setSummary] = useState('');
  const [sections, setSections] = useState([]);

  const { topic } = useParams();

  const handleAccordionOpen = async (index) => {
    const section = sections[index];
    if (!section.content && !section.loading) {
      try {
        // Set loading state for the section
        setSections(prevSections => {
          const updatedSections = [...prevSections];
          updatedSections[index] = { ...section, loading: true };
          return updatedSections;
        });

        // Make API call
        const response = await axios.post('http://127.0.0.1:5000/'+topic+'/get-section/'+section.title);
        console.log(response)
        const responseContent = response.data.response; // Extract section content from API response

        setSections(prevSections => {
          const updatedSections = [...prevSections];
          updatedSections[index] = { ...section, content: responseContent, loading: false };
          return updatedSections;
        });
      } catch (error) {
        // Optionally handle error state
      }
    }
  };
  
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
          <h1>{topic}</h1>
          <p>{summary}</p>

          {sections.length > 0 ? (
            <div className="accordion">
              {sections.map((section, index) => (
                <AccordionItem key={index} section={section} index={index} handleAccordionOpen={handleAccordionOpen} />
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
