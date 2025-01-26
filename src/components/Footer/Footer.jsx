import React, { useState } from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Search, Send } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Implement search functionality here
        console.log('Search query:', searchQuery);
    };

    return (
        <footer className="footer">
            <div className="search-section">
                <h2>What can we help you with</h2>
                <form onSubmit={handleSearchSubmit} className="search-form">
                    <div className="search-input-container">
                        <Search className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search for help..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="send-button">
                            <Send />
                        </button>
                    </div>
                </form>
            </div>

            <div className="footer-content">
                <div className="footer-section">
                    <h3>Resources</h3>
                    <ul>
                        <li>FAQ's</li>
                        <li>Blog Articles</li>
                        <li>Customer Support</li>
                        <li>Careers</li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Get Help</h3>
                    <div className="contact-info">
                        <p>Contact Number: +91-6375688912</p>
                        <p>Email: abc.123@gmail.com</p>
                    </div>
                </div>

                <div className="footer-section">
                    <h3>Connect With Us</h3>
                    <div className="social-icons">
                        <a href="#" className="social-icon"><Facebook /></a>
                        <a href="#" className="social-icon"><Instagram /></a>
                        <a href="#" className="social-icon"><Twitter /></a>
                        <a href="#" className="social-icon"><Linkedin /></a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 Interview AI. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;