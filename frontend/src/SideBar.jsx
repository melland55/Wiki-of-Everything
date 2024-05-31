import React, { useState, useEffect } from 'react';
import './SideBar.css';

const SideBar = ({sections, sectionRefs, scrollToItem}) => {
    const [activeSection, setActiveSection] = useState(null);
    const apiEndpoint = process.env.NODE_ENV === 'development' ? 'http://localhost:5000/' : window.location.origin + '/api/';

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

    return (
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
    );
};

export default SideBar;