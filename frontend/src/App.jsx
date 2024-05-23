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
  const [isControlled, setIsControlled] = useState([]); //For Search bar results
  const { topic } = useParams(); //For Topic of current page
  const sectionRefs = useRef([]); //Ref to scroll to sections
  const [activeSection, setActiveSection] = useState(null);

  const handleScroll = () => {
    if (sectionRefs.current.length === 0) {
      setActiveSection(-1);
      return; // No sections to handle
    }
  
    const sectionTops = sectionRefs.current.map(ref => {
      return {
        section: ref,
        top: ref.getBoundingClientRect().top
      };
    });
  
    
    // Find the section closest to the top of the viewport
    const closestSection = sectionTops.reduce((prev, curr) => {
      return Math.abs(curr.top) < Math.abs(prev.top) ? curr : prev;
    });
  
    const index = sectionRefs.current.findIndex(ref => ref.getBoundingClientRect().top === closestSection.top);
    setActiveSection(index);
  };
  

  useEffect(() => {
    // Attach scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Initial check on mount
    handleScroll();

    return () => {
      // Remove scroll event listener on unmount
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sections]);


  const scrollToItem = (index) => {
    if (sectionRefs.current[index]) {
      sectionRefs.current[index].scrollIntoView({ behavior: 'smooth'});
      setIsControlled(prevState => {
        const newState = [...prevState];
        newState[index] = true;
        return newState;
      });
    }
  };

  const snapToItem = (index) => {
    if (sectionRefs.current[index]) {
      sectionRefs.current[index].scrollIntoView();
      setIsControlled(prevState => {
        const newState = [...prevState];
        newState[index] = true;
        return newState;
      });
    }
  };

  const handleLinkClick = (title) => {
    if(window.location.hash.substring(1).replace(/%20/g, ' ') === title){
      const hash = window.location.hash;
      const hashtag = hash.substring(1).replace(/%20/g, ' '); // Remove '#' from the hash
      let index = -1;
      sections.forEach((section, idx) => {
        if (section.title.toLowerCase() === hashtag.toLowerCase()) {
          index = idx;
          return;
        }
      });
      scrollToItem(index); // Scroll to the appropriate section
    }else{
      window.location.hash = `#${title}`; // Update the URL hash
    }
  };
  

  useEffect(() => {
    sectionRefs.current = Array(sections.length).fill(null).map((_, index) => sectionRefs.current[index]);
  }, [sections]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const topics_response = await axios.get(window.location.origin+'/api/get-topics');
        setTopics(topics_response.data.response.flatMap(topicArr => topicArr));
        const summary_response = await axios.post(window.location.origin+'/api/get-summary/'+topic);
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

    const handleHashReload = () => {
      const hash = window.location.hash;
      if(hash){
        const hashtag = hash.substring(1).replace(/%20/g, ' '); // Remove '#' from the hash
        let index = -1;
        sections.forEach((section, idx) => {
          if (section.title.toLowerCase() === hashtag.toLowerCase()) {
            index = idx;
            snapToItem(index)
            return;
          }
        });
      }
    };

    handleHashReload();
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
              <h2 className="sidebar-title-text" onClick={() => {
                window.location.hash = ''; // Remove hash from URL
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to the top
              }}>
                Contents
              </h2>
            </div>
            {sections.length > 0 ? (
              <ul>
                {sections.map((section, index) => (
                  <li key={index} className='content-link'>
                    <button 
                      onClick={() => handleLinkClick(section.title)} 
                      style={{
                        color: activeSection === index ? 'black' : 'rgb(13, 110, 253)',
                        cursor: 'pointer', 
                        fontSize: '10px', 
                        margin: '0px', 
                        border: 'none', 
                        backgroundColor: 'transparent', // Set background color to transparent
                        padding: '0', // Remove padding
                        textAlign: 'left',
                      }}
                    >
                      {section.title}
                    </button>
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
            <h1 className="main-title-text">{capitalizeString(topic)}</h1>
          </div>
          <p dangerouslySetInnerHTML={{ __html: addBulletPoints(modifyATags(summary)) }} />

          {sections.length > 0 ? (
            <div className="accordion accordion-flush">
              {sections.map((section, index) => (
                <div key={index} ref={(ref) => (sectionRefs.current[index] = ref)}>
                  <AccordionItem topic={topic} section_prop={section} index={index} isScrolledTo={isControlled[index]}/>
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
