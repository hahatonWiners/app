import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          NoScoffs
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Главная</Link>
          <Link to="/upload" className="upload-button">Загрузить данные</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 