import React, { useState, useEffect } from 'react';
import './SideBar.css';

const SideBar = ({sections, sectionRefs, scrollToItem}) => {
    const [activeSection, setActiveSection] = useState(null);

    const handleScroll = () => {
        if (sectionRefs.current.length === 0) {
          setActiveSection(-1);
          return;
        }
      
        const sectionTops = sectionRefs.current.map(ref => {
          return {
            section: ref,
            top: ref.getBoundingClientRect().top
          };
        });
      
        const closestSection = sectionTops.reduce((prev, curr) => {
          return Math.abs(curr.top) < Math.abs(prev.top) ? curr : prev;
        });
      
        const index = sectionRefs.current.findIndex(ref => ref.getBoundingClientRect().top === closestSection.top);
        setActiveSection(index);
      };

      useEffect(() => {
        window.addEventListener('scroll', handleScroll);
    
        handleScroll();
    
        return () => {
          window.removeEventListener('scroll', handleScroll);
        };
        // eslint-disable-next-line
      }, [sections]);

      const handleLinkClick = (title) => {
        if(window.location.hash.substring(1).replace(/%20/g, ' ') === title){
          const hash = window.location.hash;
          const hashtag = hash.substring(1).replace(/%20/g, ' ');
          let index = -1;
          sections.forEach((section, idx) => {
            if (section.title.toLowerCase() === hashtag.toLowerCase()) {
              index = idx;
              return;
            }
          });
          scrollToItem(index);
        }else{
          window.location.hash = `#${title}`;
        }
      };

    return (
        <div className="sidebar">
          <div className="sidebar-content">
            <div className="sidebar-title">
              <h2 className="sidebar-title-text" onClick={() => {
                window.location.hash = '';
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}>
                Contents
              </h2>
            </div>
            {sections.length > 0 ? (
              <ul>
                {sections.map((section, index) => (
                  <li key={index} className='content-link'>
                    <button
                      className='link-button'
                      onClick={() => handleLinkClick(section.title)} 
                      // Dynamically Style the links based on active section
                      style={{
                        color: activeSection === index ? 'black' : 'rgb(13, 110, 253)',
                        cursor: 'pointer', 
                        fontSize: '12px', 
                        margin: '0px',
                        marginBottom: '5px',
                        border: 'none', 
                        backgroundColor: 'transparent',
                        padding: '0',
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