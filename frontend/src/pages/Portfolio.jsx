import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import './portfolio.css';

const Portfolio = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [portfolio, setPortfolio] = useState([]);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioData();
    fetchTransactions();

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

  const fetchPortfolioData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/portfolio');
      setPortfolio(response.data.data.portfolio);
      setBalance(response.data.data.balance);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transactions/my-transactions');
      setTransactions(response.data.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const totalPortfolioValue = portfolio.reduce((total, stock) => {
    return total + (stock.shares * stock.averagePrice);
  }, 0);

  const totalGainLoss = portfolio.reduce((total, stock) => {
    // Mock current price for demonstration (in real app, fetch from API)
    const currentPrice = stock.averagePrice * (1 + (Math.random() - 0.5) * 0.1);
    return total + ((currentPrice - stock.averagePrice) * stock.shares);
  }, 0);

  if (loading) {
    return (
      <div className="portfolio-loading">
        <div className="loading-spinner-large"></div>
      </div>
    );
  }

  return (
    <div className="portfolio-container">
      <div className="portfolio-content">
        <div className="portfolio-header">
          <h1 className="portfolio-title">Your Portfolio 💼</h1>
          <p className="portfolio-subtitle">Track your investments and performance</p>
        </div>

        {/* Portfolio Summary */}
        <div className="portfolio-summary">
          <div className="summary-card fade-in">
            <div className="text-center">
              <p className="summary-label">Cash Balance</p>
              <p className="summary-value positive">${balance.toFixed(2)}</p>
            </div>
          </div>

          <div className="summary-card fade-in">
            <div className="text-center">
              <p className="summary-label">Portfolio Value</p>
              <p className="summary-value">${totalPortfolioValue.toFixed(2)}</p>
            </div>
          </div>

          <div className="summary-card fade-in">
            <div className="text-center">
              <p className="summary-label">Total Value</p>
              <p className="summary-value">${(balance + totalPortfolioValue).toFixed(2)}</p>
            </div>
          </div>

          <div className="summary-card fade-in">
            <div className="text-center">
              <p className="summary-label">Gain/Loss</p>
              <p className={`summary-value ${totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
                {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="portfolio-main">
          {/* Holdings */}
          <div className="holdings-section slide-up">
            <h2 className="holdings-title">Your Holdings</h2>
            
            {portfolio.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p className="empty-title">No investments yet</p>
                <p className="empty-description">Start trading to build your portfolio!</p>
              </div>
            ) : (
              <div className="holdings-list">
                {portfolio.map((stock, index) => {
                  const isPositive = Math.random() > 0.5;
                  const changePercent = (Math.random() * 10).toFixed(2);
                  
                  return (
                    <div
                      key={stock.symbol}
                      className="holding-item fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="holding-header">
                        <h3 className="holding-symbol">{stock.symbol}</h3>
                        <span className={`holding-change ${isPositive ? 'positive' : 'negative'}`}>
                          {isPositive ? '+' : ''}{changePercent}%
                        </span>
                      </div>
                      
                      <div className="holding-details">
                        <div className="holding-detail">
                          <span className="holding-label">Shares:</span>
                          <span className="holding-value">{stock.shares}</span>
                        </div>
                        <div className="holding-detail">
                          <span className="holding-label">Avg Price:</span>
                          <span className="holding-value">${stock.averagePrice.toFixed(2)}</span>
                        </div>
                        <div className="holding-detail">
                          <span className="holding-label">Total Value:</span>
                          <span className="holding-value">
                            ${(stock.shares * stock.averagePrice).toFixed(2)}
                          </span>
                        </div>
                        <div className="holding-detail">
                          <span className="holding-label">Weight:</span>
                          <span className="holding-value">
                            {((stock.shares * stock.averagePrice) / totalPortfolioValue * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="transactions-section slide-up">
            <h2 className="transactions-title">Recent Transactions</h2>
            
            {transactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p className="empty-title">No transactions yet</p>
                <p className="empty-description">Your trades will appear here</p>
              </div>
            ) : (
              <div className="transactions-list">
                {transactions.slice(0, 10).map((transaction, index) => (
                  <div
                    key={transaction._id}
                    className="transaction-item fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="transaction-content">
                      <div className="transaction-info">
                        <div className={`transaction-icon ${transaction.type}`}>
                          {transaction.type === 'buy' ? '🛒' : '💰'}
                        </div>
                        <div className="transaction-details">
                          <h4>{transaction.symbol}</h4>
                          <div className="transaction-date">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="transaction-amount">
                        <div className={`transaction-total ${transaction.type}`}>
                          {transaction.type === 'buy' ? '-' : '+'}${transaction.totalAmount.toFixed(2)}
                        </div>
                        <div className="transaction-meta">
                          {transaction.shares} shares @ ${transaction.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;