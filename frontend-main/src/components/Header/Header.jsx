import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);

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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollTop]);

  return (
    <header className={`header ${isHidden ? 'hidden' : ''}`}>
      <div className="header-content">
        <Link to="/" className="logo">
          NoScoffs
        </Link>
        <nav className="nav">
          <Link to="/" className="main-button">Главная</Link>
          <Link to="/about_us" className="nav-link">О нас</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 