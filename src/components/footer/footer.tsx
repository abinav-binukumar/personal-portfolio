import React from 'react';
import './footer.scss';
import { FaLinkedin, FaGlobe } from 'react-icons/fa';
import { IoMail, IoCallOutline } from "react-icons/io5";

const Footer: React.FC = () => {
  return (
    <footer className="footer-container" id="footer">
      <div className="left-align">
        <p>
          Developed by  
          <a href="https://www.linkedin.com/in/abinav-binukumar/" target="_blank" rel="noopener noreferrer" className="footer-link">Me</a>.
        </p>
      </div>
      <div className="center-align">
        <p>#AbinavBinukumar2024</p>
      </div>
      <div className="right-align social-icons">
        <a href="https://linkedin.com/in/abinav-binukumar" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
        <a href="https://abinav-binukumar.co" target="_blank" rel="noopener noreferrer"><FaGlobe /></a>
        <a href="mailto:abinav.binukumar@ontariotechu.net" target="_blank" rel="noopener noreferrer"><IoMail /></a>
        <a href="tel:7827785268" rel="noopener noreferrer"><IoCallOutline /></a>
      </div>
    </footer>
  );
};

export default Footer;
