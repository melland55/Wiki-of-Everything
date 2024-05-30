import React, { useState, useEffect } from 'react';
import axios from 'axios';

import SearchBar from './SearchBar';

const NavBar = () => {
    const [topics, setTopics] = useState([]); //For Search bar results
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const apiEndpoint = process.env.NODE_ENV === 'development' ? 'http://localhost:5000/' : window.location.origin + '/api/';

    // Function to toggle hamburger menu visibility
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const topics_response = await axios.get(apiEndpoint+'get-topics');
                setTopics(topics_response.data.response.flatMap(topicArr => topicArr));
            } catch (error) {
                console.error('Error fetching Search Bar data:', error);
            }
        };
        fetchData();
            return () => {
        };
    }, []);

    return (
        <header className="custom-header">
        <div className="logo-container">
            <img src="/hamburgerMenu.svg" alt="Your Logo" style={{ width: '28px', height: 'auto', marginRight: '15px', cursor: 'pointer' }} onClick={toggleMenu} />
            <a className="navbar-logo" href="/">
                <img src="/logo.svg" alt="Your Logo" style={{ width: '64px', height: 'auto' }}/>
            </a>
        </div>
        <div className="navigation-container">
            <SearchBar items={topics}/>
        </div>
        {isMenuOpen && (
            <div className="hamburger-menu">
                <ul>
                    <li>
                        <a href="/map">Map of Everything</a>
                    </li>
                    <li>
                        <a href="/">About page</a>
                    </li>
                </ul>
            </div>
        )}
        </header>
    );
};

export default NavBar;