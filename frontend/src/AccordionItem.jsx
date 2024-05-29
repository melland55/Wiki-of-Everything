import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { modifyATags, addBulletPoints, capitalizeString } from './utils';

function AccordionItem({ topic, section_prop, index, isScrolledTo}) {
  const [section, setSection] = useState(section_prop);
  const [isOpen, setIsOpen] = useState(section.content.length > 1);
  const buttonRef = useRef(null);

  const apiEndpoint = process.env.NODE_ENV === 'development' ? 'http://localhost:5000/' : window.location.origin + '/api/';

  // Update the internal state when the controlled prop changes
  useEffect(() => {
    if(!isOpen && isScrolledTo){
      if (buttonRef.current) {
        buttonRef.current.click();
      }
    }
    // eslint-disable-next-line
  }, [isScrolledTo]);

  const handleAccordionOpen = async () => {
    if (!section.content && !section.loading) {
      try {
        // Set loading state for the section
        setSection(prevSection => ({ ...prevSection, loading: true }));

        // Make API call
        const response = await axios.post(apiEndpoint+topic+'/get-section/'+section.title);
        const responseContent = response.data.response; // Extract section content from API response

        setSection(prevSection => ({ ...prevSection, content: responseContent, loading: false }));
      } catch (error) {
        // Optionally handle error state
      }
    }
  };

  const toggleAccordion = async () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      handleAccordionOpen();
    }
  };

  return (
    <div className="accordion-item">
      <h2 className="accordion-header" id={`panelsStayOpen-heading-${index}`}>
        <button ref={buttonRef} className={`accordion-button ${section.content ? '' : 'collapsed'}`} type="button" data-bs-toggle="collapse" data-bs-target={`#panelsStayOpen-collapse-${index}`} aria-expanded={isOpen ? 'true' : 'false'} aria-controls={`panelsStayOpen-collapse-${index}`} onClick={() => toggleAccordion()}>
          {capitalizeString(section.title)}
        </button>
      </h2>
      <div id={`panelsStayOpen-collapse-${index}`} className={`accordion-collapse collapse ${section.content && isOpen ? 'show' : ''}`} aria-labelledby={`panelsStayOpen-heading-${index}`}>
        <div className="accordion-body">
          {section.loading ? 'Loading...' : <p dangerouslySetInnerHTML={{ __html: addBulletPoints(modifyATags(section.content))}} />}
        </div>
      </div>
    </div>
  );
}

export default AccordionItem;
