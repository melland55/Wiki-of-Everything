import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AccordionItem from './AccordionItem';
import SideBar from './SideBar';
import { useParams } from 'react-router-dom';
import { modifyATags, capitalizeString, addBulletPoints, addBold } from './utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';


function App() {
  const [summary, setSummary] = useState(''); //For Topic summary
  const [sections, setSections] = useState([]); //For section titles and contents
  const [isControlled, setIsControlled] = useState([]); //Used for allowing toggle of accordion items
  const { topic } = useParams(); //For Topic of current page
  const sectionRefs = useRef([]); //Ref to scroll to sections

  const apiEndpoint = process.env.NODE_ENV === 'development' ? 'http://localhost:5000/' : window.location.origin + '/api/';


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

  useEffect(() => {
    sectionRefs.current = Array(sections.length).fill(null).map((_, index) => sectionRefs.current[index]);
  }, [sections]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const summary_response = await axios.post(apiEndpoint+'get-summary/'+topic);
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
    // eslint-disable-next-line
  }, [topic]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const hashtag = hash.substring(1).replace(/%20/g, ' ');
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
        const hashtag = hash.substring(1).replace(/%20/g, ' ');
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
      
      <div className="content">
        <SideBar sections={sections} sectionRefs={sectionRefs} scrollToItem={scrollToItem} />
        <div className="main-content">
          <div className="main-content-title">
            <h1 className="main-title-text">{capitalizeString(topic)}</h1>
          </div>
          <p dangerouslySetInnerHTML={{ __html: addBold(addBulletPoints(modifyATags(summary))) }} />

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
