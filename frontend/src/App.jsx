import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AccordionItem from './AccordionItem';
import SearchBar from './SearchBar';
import { useParams } from 'react-router-dom';
import { modifyATags, capitalizeString, addBulletPoints } from './utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';


function App() {
  const [summary, setSummary] = useState(''); //For Topic summary
  const [sections, setSections] = useState([]); //For section titles and contents
  const [topics, setTopics] = useState([]); //For Search bar results
  const { topic } = useParams(); //For Topic of current page
  const sectionRefs = useRef([]); //Ref to scroll to sections

  const scrollToItem = (index) => {
    if (sectionRefs.current[index]) {
      sectionRefs.current[index].scrollIntoView({ behavior: 'smooth'});
    }
  };

  useEffect(() => {
    sectionRefs.current = Array(sections.length).fill(null).map((_, index) => sectionRefs.current[index]);
  }, [sections]);
  
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

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const hashtag = hash.substring(1).replace(/%20/g, ' '); // Remove '#' from the hash
      let index = -1;
      sections.forEach((section, idx) => {
        if (section.title.toLowerCase() === hashtag.toLowerCase()) {
          index = idx;
          return;
        }
      });
      scrollToItem(index)
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [sections]);

  return (
    <div className="wiki-page">
      <header className="custom-header">
        <div className="logo-container">
          <a href="/">
            <img src="/logo.svg" alt="Your Logo" style={{ width: '64px', height: 'auto' }}/>
          </a>
        </div>
        <div className="navigation-container">
            <SearchBar items={topics}/>
        </div>
      </header>
      <div className="content">
        <div className="sidebar">
          <div className="sidebar-content">
            <div className="sidebar-title">
              <h2>Contents</h2>
            </div>
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
        </div>
        <div className="main-content">
          <div className="main-content-title">
            <h1>{capitalizeString(topic)}</h1>
          </div>
          <p dangerouslySetInnerHTML={{ __html: addBulletPoints(modifyATags(summary)) }} />

          {sections.length > 0 ? (
            <div className="accordion accordion-flush">
              {sections.map((section, index) => (
                <div key={index} ref={(ref) => (sectionRefs.current[index] = ref)}>
                  <AccordionItem topic={topic} section_prop={section} index={index} />
                </div>
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
