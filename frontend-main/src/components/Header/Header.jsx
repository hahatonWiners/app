import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      
      if (scrollTop > lastScrollTop) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      
      setLastScrollTop(scrollTop);
    };

    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        navRef.current &&
        !navRef.current.contains(event.target) &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [lastScrollTop, isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`header ${isHidden ? 'hidden' : ''}`}>
      <div className="header-content">
        <Link to="/" className="logo">
          NoScoffs
        </Link>
        <button 
          className={`hamburger-menu ${isMenuOpen ? 'open' : ''}`} 
          onClick={toggleMenu}
          ref={hamburgerRef}
          aria-label="Toggle menu"
        >
          <span className="hamburger-icon"></span>
        </button>
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`} ref={navRef}>
          <Link to="/" className="main-button" onClick={() => setIsMenuOpen(false)}>Главная</Link>
          <Link to="/about_us" className="nav-link" onClick={() => setIsMenuOpen(false)}>О нас</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 