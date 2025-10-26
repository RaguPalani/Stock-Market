import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import './dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [portfolio, setPortfolio] = useState([]);
  const [balance, setBalance] = useState(0);
  const [marketStatus, setMarketStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchMarketStatus();

    if (socket) {
      socket.on('portfolio-update', (updatedPortfolio) => {
        setPortfolio(updatedPortfolio);
      });

      socket.on('balance-update', (updatedBalance) => {
        setBalance(updatedBalance);
      });
    }

    return () => {
      if (socket) {
        socket.off('portfolio-update');
        socket.off('balance-update');
      }
    };
  }, [socket]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/portfolio');
      setPortfolio(response.data.data.portfolio);
      setBalance(response.data.data.balance);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/stocks/market-status');
      setMarketStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching market status:', error);
    }
  };

  const totalPortfolioValue = portfolio.reduce((total, item) => 
    total + (item.shares * item.averagePrice), 0
  );

  const getMarketStatusColor = (status) => {
    switch (status) {
      case 'open': return 'market-open';
      case 'closed': return 'market-closed';
      default: return 'market-other';
    }
  };

  const getMarketStatusIcon = (status) => {
    switch (status) {
      case 'open': return '🟢';
      case 'closed': return '🔴';
      default: return '🟡';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Welcome Section */}
        <div className="dashboard-header fade-in">
          <h1 className="dashboard-title">Welcome back, {user?.username}! 👋</h1>
          <p className="dashboard-subtitle">Ready to make your next investment?</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {/* Balance Card */}
          <div className="stat-card slide-left">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Available Balance</h3>
                <div className={`stat-value balance-update`}>
                  ${balance.toFixed(2)}
                </div>
              </div>
              <div className="stat-icon">💰</div>
            </div>
          </div>

          {/* Portfolio Value */}
          <div className="stat-card slide-up">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Portfolio Value</h3>
                <div className="stat-value">
                  ${totalPortfolioValue.toFixed(2)}
                </div>
              </div>
              <div className="stat-icon">📈</div>
            </div>
          </div>

          {/* Market Status */}
          <div className="stat-card slide-right">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Market Status</h3>
                <div className={`stat-value ${getMarketStatusColor(marketStatus.status)}`}>
                  {marketStatus.status?.toUpperCase() || 'Loading...'}
                </div>
              </div>
              <div className="stat-icon">
                {getMarketStatusIcon(marketStatus.status)}
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="portfolio-overview fade-in">
          <h2 className="portfolio-title">Your Portfolio</h2>
          {portfolio.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p className="empty-title">No investments yet</p>
              <p className="empty-description">Start trading to build your portfolio!</p>
            </div>
          ) : (
            <div className="portfolio-grid">
              {portfolio.map((stock, index) => (
                <div
                  key={stock.symbol}
                  className="stock-card stagger-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="stock-header">
                    <h3 className="stock-symbol">{stock.symbol}</h3>
                    <span className="stock-change">
                      +{Math.random().toFixed(2)}%
                    </span>
                  </div>
                  <p className="stock-detail">Shares: {stock.shares}</p>
                  <p className="stock-detail">
                    Avg Price: ${stock.averagePrice.toFixed(2)}
                  </p>
                  <p className="stock-value">
                    Value: ${(stock.shares * stock.averagePrice).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions slide-up">
          <h2 className="actions-title">Quick Actions</h2>
          <div className="actions-grid">
            <Link
              to="/trading"
              className="action-card action-trading"
            >
              <div className="action-icon">💹</div>
              <div className="action-label">Trade Stocks</div>
            </Link>

            <Link
              to="/portfolio"
              className="action-card action-portfolio"
            >
              <div className="action-icon">💼</div>
              <div className="action-label">View Portfolio</div>
            </Link>

            <Link
              to="/trading"
              className="action-card action-market"
            >
              <div className="action-icon">📊</div>
              <div className="action-label">Market Data</div>
            </Link>

            <Link
              to="/activities"
              className="action-card action-activities"
            >
              <div className="action-icon">📝</div>
              <div className="action-label">Activities</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;