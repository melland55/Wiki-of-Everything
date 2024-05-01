// AccordionItem.js
import React, { useState } from 'react';
import axios from 'axios';
import { modifyATags } from './utils';


function AccordionItem({ topic, section_prop, index}) {

  const [section, setSection] = useState(section_prop);

  const handleAccordionOpen = async (index) => {
    if (!section.content && !section.loading) {
      try {
        // Set loading state for the section
        setSection(prevSection => ({ ...prevSection, loading: true }));
        
        // Make API call
        const response = await axios.post('/api/'+topic+'/get-section/'+section.title);
        const responseContent = response.data.response; // Extract section content from API response

        setSection(prevSection => ({ ...prevSection, content: responseContent, loading: false }));
      } catch (error) {
        // Optionally handle error state
      }
    }
  };

  return (
    <div className="accordion-item">
      <h2 className="accordion-header" id={`panelsStayOpen-heading-${index}`}>
        <button className={`accordion-button ${section.content ? '' : 'collapsed'}`} type="button" data-bs-toggle="collapse" data-bs-target={`#panelsStayOpen-collapse-${index}`} aria-expanded='true' aria-controls={`panelsStayOpen-collapse-${index}`} onClick={() => handleAccordionOpen(index)}>
          {section.title}
        </button>
      </h2>
      <div id={`panelsStayOpen-collapse-${index}`} className={`accordion-collapse collapse ${section.content ? 'show' : ''}`} aria-labelledby={`panelsStayOpen-heading-${index}`}>
        <div className="accordion-body">
          {section.loading ? 'Loading...' : <p dangerouslySetInnerHTML={{ __html: modifyATags(section.content) }} />}
        </div>
      </div>
    </div>
  );
}

export default AccordionItem;
