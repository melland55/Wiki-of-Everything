import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AccordionItem from './AccordionItem';
import SearchBar from './SearchBar';
import { useParams } from 'react-router-dom';
import { modifyATags, capitalizeString, addBulletPoints } from './utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';

function App() {
  const [summary, setSummary] = useState('');
  const [sections, setSections] = useState([]);
  const [topics, setTopics] = useState([]);

  const { topic } = useParams();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const topics_response = await axios.get('http://127.0.0.1:5000/get-topics');
        setTopics(topics_response.data.response.flatMap(topicArr => topicArr));
        const summary_response = await axios.post('http://127.0.0.1:5000/get-summary/'+topic);
        const summary_responseData = summary_response.data.response;
        setSummary(summary_responseData.summary);
        setSections(summary_responseData.sections);
      } catch (error) {
        console.error('Error fetching API data:', error);
      }
    };

    fetchData();

    return () => {

    };
  }, [topic]);

  

  return (
    <div className="wiki-page">
      <header className="custom-header">
        <div className="logo-container">
          <a href="/">
            <img src="/Wiki-Logo.svg" alt="Your Logo" style={{ width: '64px', height: 'auto' }}/>
          </a>
        </div>
        <div className="navigation-container">
            <SearchBar items={topics}/>
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
          <p dangerouslySetInnerHTML={{ __html: addBulletPoints(modifyATags(summary)) }} />

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
