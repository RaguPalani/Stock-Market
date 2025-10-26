import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SuccessPopup from '../components/SuccessPopup';
import axios from 'axios';
import './trading.css';

const Trading = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockQuote, setStockQuote] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [action, setAction] = useState('buy');
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchStocks();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (selectedStock) {
      fetchStockQuote(selectedStock.symbol);
    }
  }, [selectedStock]);

  const searchStocks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/stocks/search/${searchTerm}`);
      setSearchResults(response.data.data);
    } catch (error) {
      console.error('Error searching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockQuote = async (symbol) => {
    try {
      setQuoteLoading(true);
      const response = await axios.get(`http://localhost:5000/api/stocks/quote/${symbol}`);
      setStockQuote(response.data.data);
    } catch (error) {
      console.error('Error fetching stock quote:', error);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleTrade = async () => {
    if (!selectedStock || !stockQuote || quantity <= 0) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `http://localhost:5000/api/transactions/${action}`,
        {
          symbol: selectedStock.symbol,
          shares: quantity,
          price: stockQuote.price
        }
      );

      setSuccessMessage(response.data.message);
      setShowSuccess(true);
      
      // Reset form
      setQuantity(1);
      setSelectedStock(null);
      setStockQuote(null);
      setSearchTerm('');
      
    } catch (error) {
      console.error('Error executing trade:', error);
      alert(error.response?.data?.message || 'Trade failed');
    } finally {
      setLoading(false);
    }
  };

  const totalCost = stockQuote ? quantity * stockQuote.price : 0;

  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.34 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 135.67, change: 1.23 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 330.12, change: -0.45 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.78, change: 5.67 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 145.23, change: 0.89 }
  ];

  return (
    <div className="trading-container">
      <div className="trading-content">
        <div className="trading-header fade-in">
          <h1 className="trading-title">Stock Trading 💹</h1>
          <p className="trading-subtitle">Buy and sell stocks in real-time</p>
        </div>

        <SuccessPopup
          message={successMessage}
          isVisible={showSuccess}
          onClose={() => setShowSuccess(false)}
        />

        <div className="trading-main">
          {/* Trading Panel */}
          <div className="trading-panel slide-in-left">
            <h2 className="panel-title">Execute Trade</h2>
            
            {/* Action Toggle */}
            <div className="action-toggle">
              {['buy', 'sell'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setAction(tab)}
                  className={`toggle-button ${action === tab ? 'active' : ''}`}
                >
                  {tab === 'buy' ? '🛒 Buy' : '💰 Sell'}
                </button>
              ))}
            </div>

            {/* Stock Search */}
            <div className="form-group">
              <label className="form-label">Search Stocks</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter stock symbol (e.g., AAPL, TSLA)"
                className="form-input"
              />
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="search-results fade-in">
                  {searchResults.map((stock) => (
                    <div
                      key={stock.symbol}
                      onClick={() => {
                        setSelectedStock(stock);
                        setSearchResults([]);
                        setSearchTerm(stock.symbol);
                      }}
                      className="search-result"
                    >
                      <div className="result-symbol">{stock.symbol}</div>
                      <div className="result-name">{stock.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stock Info */}
            {selectedStock && stockQuote && (
              <div className="stock-info scale-in">
                <div className="stock-header">
                  <h3 className="stock-symbol">{selectedStock.symbol}</h3>
                  <span className={`stock-price ${stockQuote.change >= 0 ? 'positive' : 'negative'}`}>
                    ${stockQuote.price.toFixed(2)}
                  </span>
                </div>
                <p className="stock-name">{selectedStock.name}</p>
                <div className="stock-details">
                  <div className="stock-detail">
                    <span className="detail-label">Change:</span>
                    <span className={`detail-value ${stockQuote.change >= 0 ? 'positive' : 'negative'}`}>
                      {stockQuote.change >= 0 ? '+' : ''}{stockQuote.change} ({stockQuote.changePercent})
                    </span>
                  </div>
                  <div className="stock-detail">
                    <span className="detail-label">Volume:</span>
                    <span className="detail-value">{stockQuote.volume.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Input */}
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="form-input"
              />
            </div>

            {/* Total Cost */}
            {stockQuote && (
              <div className="total-cost fade-in">
                <div className="total-row">
                  <span>Total {action === 'buy' ? 'Cost' : 'Proceeds'}:</span>
                  <span className="total-amount">${totalCost.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Execute Button */}
            <button
              onClick={handleTrade}
              disabled={!selectedStock || !stockQuote || loading}
              className="execute-button"
            >
              {loading ? (
                <div className="execute-loading">
                  <div className="execute-spinner"></div>
                  Processing...
                </div>
              ) : (
                `${action === 'buy' ? 'Buy' : 'Sell'} ${quantity} Share${quantity !== 1 ? 's' : ''}`
              )}
            </button>
          </div>

          {/* Market Data */}
          <div className="market-panel slide-in-right">
            <h2 className="market-title">Popular Stocks</h2>
            <div className="stocks-list">
              {popularStocks.map((stock, index) => (
                <div
                  key={stock.symbol}
                  className="stock-card stagger-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => {
                    setSelectedStock(stock);
                    setSearchTerm(stock.symbol);
                  }}
                >
                  <div className="stock-card-content">
                    <div className="stock-card-info">
                      <h4>{stock.symbol}</h4>
                      <p>{stock.name}</p>
                    </div>
                    <div className="stock-card-pricing">
                      <div className="stock-card-price">${stock.price.toFixed(2)}</div>
                      <div className={`stock-card-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trading;