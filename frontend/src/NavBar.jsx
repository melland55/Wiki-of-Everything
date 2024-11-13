import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NavBar.css';

import SearchBar from './SearchBar';

const NavBar = () => {
    const [topics, setTopics] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const apiEndpoint = process.env.NODE_ENV === 'development' ? 'http://localhost:5000/' : window.location.origin + '/api/';

    // Toggle hamburger menu visibility
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const topics_response = await axios.get(apiEndpoint+'get-topics');
                setTopics(topics_response.data.response);
            } catch (error) {
                console.error('Error fetching Search Bar data:', error);
            }
        };
        fetchData();
            return () => {
        };
        // eslint-disable-next-line
    }, []);

    const handleRandomTopicClick = () => {
        const establishedArticles = topics.filter(topic => topic[1] === 1).map(topic => topic[0]);
        const randomIndex = Math.floor(Math.random() * establishedArticles.length);
        const randomTopic = establishedArticles[randomIndex];
        window.location.href = `/${randomTopic}`; // Redirect to random topic page
    };

    const handleNewTopicClick = () => {
        const establishedArticles = topics.filter(topic => topic[1] === 0).map(topic => topic[0]);
        const randomIndex = Math.floor(Math.random() * establishedArticles.length);
        const randomTopic = establishedArticles[randomIndex];
        window.location.href = `/${randomTopic}`; // Redirect to random topic page
    };

    return (
        <header className="custom-header">
        <div className="logo-container">
            <img src="/hamburgerMenu.svg" alt="Your Logo" style={{ width: '28px', height: 'auto', marginRight: '15px', cursor: 'pointer' }} onClick={toggleMenu} />
            <a className="navbar-logo" href="/">
                <img src="/logo.svg" alt="Your Logo" style={{ width: '64px', height: 'auto' }}/>
            </a>
        </div>
        <div className="navigation-container">
            <SearchBar items={topics.map(item => item[0])}/>
        </div>
        {isMenuOpen && (
            <div className="hamburger-menu">
                <ul>
                    <li>
                        <a href="/map">Map of Everything</a>
                    </li>
                    <li>
                        <button onClick={handleRandomTopicClick}>Random Article</button>
                    </li>
                    <li>
                        <button onClick={handleNewTopicClick}>New Article</button>
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