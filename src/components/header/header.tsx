import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaHome, FaUser, FaCode, FaFileAlt, FaBars, FaTimes } from 'react-icons/fa';
import { IoIosCall } from 'react-icons/io'; // Import the phone call icon
import './header.scss';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // The header is sticky (takes real space at the top of the page), so
    // sections sized with `100vh` (see hero.tsx) end up taller than the
    // viewport by exactly this much unless they subtract it. Expose the
    // real rendered height as a CSS var instead of hardcoding a guess.
    const el = headerRef.current;
    if (!el) return;
    const setHeight = () => {
      document.documentElement.style.setProperty('--header-height', `${el.offsetHeight}px`);
    };
    setHeight();
    const observer = new ResizeObserver(setHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    const section = document.getElementById(target);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    if (target === 'contact') {
      // Tells hero.tsx to flip the card so the contact game is actually showing.
      window.dispatchEvent(new Event('open-contact-game'));
    }
    setIsOpen(false);
  };

  return (
    <header className="header-container" ref={headerRef}>
      <a href="#home" className="logo" onClick={(e) => handleClick(e, 'home')}>
        A.B
      </a>
      <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes size={30} className="close-icon" /> : <FaBars size={30} />}
      </div>
      {/* Rendered via portal straight into <body> - the header's own
          backdrop-filter (for the frosted-glass look) creates a new
          containing block for any `position: fixed` descendant, which was
          trapping this full-screen mobile nav inside the header's own
          (tiny) box instead of the viewport. Portal sidesteps that instead
          of giving up the blur effect. */}
      {createPortal(
        <nav className={`nav ${isOpen ? 'open' : ''}`}>
          <a href="#home" className="nav-link" onClick={(e) => handleClick(e, 'home')}>
            <FaHome />
            Home
          </a>
          <a href="#about" className="nav-link" onClick={(e) => handleClick(e, 'about')}>
            <FaUser />
            About
          </a>
          <a href="#projects" className="nav-link" onClick={(e) => handleClick(e, 'projects')}>
            <FaCode />
            Projects
          </a>
          <a href="#resume" className="nav-link" onClick={(e) => handleClick(e, 'resume')}>
            <FaFileAlt />
            Resume
          </a>
          <a href="#contact" className="button contact-link" onClick={(e) => handleClick(e, 'contact')}>
            <IoIosCall />
            Contact
          </a>
        </nav>,
        document.body
      )}
    </header>
  );
};

export default Header;
