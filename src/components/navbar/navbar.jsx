import React from 'react';
import "./navbar.css";
import logo from "../../assets/logo.png";

const Navbar = () => {
    return (
        <nav>
            <img src={logo} alt="Logo" className="logo" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ul>
                    <li>Home</li>
                    <li>Testimonials</li>
                    <li>Interview</li>
                    <li>About Us</li>
                    <li>Contact Us</li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;