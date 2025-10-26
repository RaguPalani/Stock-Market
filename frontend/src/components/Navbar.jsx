import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const navItems = user ? [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/trading', label: 'Trading', icon: '💹' },
    { path: '/portfolio', label: 'Portfolio', icon: '💼' },
    { path: '/activities', label: 'Activities', icon: '📝' },
  ] : [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/login', label: 'Login', icon: '🔐' },
    { path: '/register', label: 'Register', icon: '👤' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Brand/Logo */}
          <div className="navbar-brand">
            <Link 
              to={user ? '/dashboard' : '/'} 
              className="brand-link"
            >
              <span className="brand-text"> StockTrader</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-menu">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`navbar-link ${
                  location.pathname === item.path ? 'active' : ''
                }`}
              >
                <span className="navbar-link-content">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
              </Link>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                className="logout-button"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mobile-menu-button"
            aria-label="Toggle menu"
          >
            <svg className="mobile-menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mobile-menu scale-in">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`mobile-navbar-link ${
                  location.pathname === item.path ? 'active' : ''
                }`}
              >
                <span className="mobile-navbar-link-content">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
              </Link>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                className="mobile-logout-button"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;