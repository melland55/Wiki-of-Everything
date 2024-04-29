// AccordionItem.js
import React from 'react';

function AccordionItem({ section, index, handleAccordionOpen }) {
  return (
    <div className="accordion-item">
      <h2 className="accordion-header" id={`panelsStayOpen-heading-${index}`}>
        <button className={`accordion-button ${section.content ? '' : 'collapsed'}`} type="button" data-bs-toggle="collapse" data-bs-target={`#panelsStayOpen-collapse-${index}`} aria-expanded='true' aria-controls={`panelsStayOpen-collapse-${index}`} onClick={() => handleAccordionOpen(index)}>
          {section.title}
        </button>
      </h2>
      <div id={`panelsStayOpen-collapse-${index}`} className={`accordion-collapse collapse ${section.content ? 'show' : ''}`} aria-labelledby={`panelsStayOpen-heading-${index}`}>
        <div className="accordion-body">
          {section.loading ? 'Loading...' : section.content}
        </div>
      </div>
    </div>
  );
}

export default AccordionItem;
