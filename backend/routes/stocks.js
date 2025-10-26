const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');

const router = express.Router();

const ALPHA_VANTAGE_API_KEY = '2O2QN5941E21VUZS';

// Get stock quote
router.get('/quote/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    const data = response.data['Global Quote'];
    
    if (!data) {
      return res.status(404).json({
        status: 'fail',
        message: 'Stock not found'
      });
    }

    const stockData = {
      symbol: data['01. symbol'],
      open: parseFloat(data['02. open']),
      high: parseFloat(data['03. high']),
      low: parseFloat(data['04. low']),
      price: parseFloat(data['05. price']),
      volume: parseInt(data['06. volume']),
      latestTradingDay: data['07. latest trading day'],
      previousClose: parseFloat(data['08. previous close']),
      change: parseFloat(data['09. change']),
      changePercent: data['10. change percent']
    };

    res.json({
      status: 'success',
      data: stockData
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: 'Error fetching stock data'
    });
  }
});

// Search stocks
router.get('/search/:keywords', auth, async (req, res) => {
  try {
    const { keywords } = req.params;
    
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    const matches = response.data.bestMatches || [];
    
    const stocks = matches.map(match => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
      currency: match['8. currency']
    }));

    res.json({
      status: 'success',
      data: stocks
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: 'Error searching stocks'
    });
  }
});

// Get market status (mock data for demonstration)
router.get('/market-status', auth, (req, res) => {
  const statuses = ['open', 'closed', 'after-hours'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  res.json({
    status: 'success',
    data: {
      market: 'US Stock Market',
      status: randomStatus,
      lastUpdated: new Date().toISOString()
    }
  });
});

module.exports = router;