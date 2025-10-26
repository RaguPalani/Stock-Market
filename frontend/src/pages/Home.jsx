import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './home.css';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: '⚡',
      title: 'Real-time Trading',
      description: 'Execute trades with live market data and instant updates'
    },
    
    {
      icon: '🔒',
      title: 'Secure Platform',
      description: 'Your data and transactions are protected with enterprise-grade security'
    }
  ];

  const stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NFLX', 'NVDA'];

  return (
    <div className="home-container">
      <div className="home-content">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title"> StockTrader</h1>
          
          <p className="hero-subtitle">
            Trade stocks in real-time with our advanced platform. Experience the future of 
            stock trading with beautiful animations and seamless user experience.
          </p>

          <div className="cta-buttons">
            {user ? (
              <Link to="/dashboard" className="primary-button">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="primary-button">
                  Get Started Free
                </Link>
                <Link to="/login" className="secondary-button">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-section">
          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card"
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Animated Stock Ticker */}
        <div className="ticker-section">
          <div className="ticker-container">
            {stockSymbols.map((symbol) => (
              <div key={symbol} className="ticker-item">
                <span className="ticker-symbol">{symbol}</span>
                <span className="ticker-change">
                  +{Math.random().toFixed(2)}%
                </span>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {stockSymbols.map((symbol) => (
              <div key={`${symbol}-dup`} className="ticker-item">
                <span className="ticker-symbol">{symbol}</span>
                <span className="ticker-change">
                  +{Math.random().toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;