import express from 'express';
import axios from 'axios';
import auth from '../middleware/auth.js';

const router = express.Router();

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Cache for API responses
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute

// Get real-time stock quote
router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `quote_${symbol}`;
    
    if (cache.has(cacheKey) && Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION) {
      return res.json(cache.get(cacheKey).data);
    }

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );

    const data = response.data['Global Quote'];
    
    if (!data || Object.keys(data).length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Stock not found or API limit reached'
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
      changePercent: parseFloat(data['10. change percent'].replace('%', ''))
    };

    const result = {
      status: 'success',
      data: stockData
    };

    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    res.json(result);
  } catch (error) {
    console.error('Alpha Vantage API Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch stock data'
    });
  }
});

// Search stocks
router.get('/search/:keywords', async (req, res) => {
  try {
    const { keywords } = req.params;
    const cacheKey = `search_${keywords}`;
    
    if (cache.has(cacheKey)) {
      return res.json(cache.get(cacheKey).data);
    }

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${API_KEY}`
    );

    const matches = response.data.bestMatches || [];
    
    const searchResults = matches.map(match => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
      marketOpen: match['5. marketOpen'],
      marketClose: match['6. marketClose'],
      timezone: match['7. timezone'],
      currency: match['8. currency'],
      matchScore: parseFloat(match['9. matchScore'])
    }));

    const result = {
      status: 'success',
      data: searchResults
    };

    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    res.json(result);
  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search stocks'
    });
  }
});

// Get historical data
router.get('/history/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = 'daily' } = req.query;
    const cacheKey = `history_${symbol}_${interval}`;
    
    if (cache.has(cacheKey) && Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION) {
      return res.json(cache.get(cacheKey).data);
    }

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_${interval.toUpperCase()}&symbol=${symbol}&apikey=${API_KEY}`
    );

    const timeSeries = response.data[`Time Series (${interval.charAt(0).toUpperCase() + interval.slice(1)})`];
    
    if (!timeSeries) {
      return res.status(404).json({
        status: 'fail',
        message: 'Historical data not available'
      });
    }

    const historicalData = Object.entries(timeSeries).map(([date, values]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'])
    })).slice(0, 100);

    const result = {
      status: 'success',
      data: historicalData.reverse()
    };

    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    res.json(result);
  } catch (error) {
    console.error('Historical Data API Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch historical data'
    });
  }
});

// Get market overview with popular stocks
router.get('/overview', async (req, res) => {
  try {
    const cacheKey = 'market_overview';
    
    if (cache.has(cacheKey) && Date.now() - cache.get(cacheKey).timestamp < 30000) {
      return res.json(cache.get(cacheKey).data);
    }

    const popularStocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'JPM', 'JNJ', 'V', 'WMT'];
    
    const stockPromises = popularStocks.map(async (symbol) => {
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
        );
        return response.data;
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
        return null;
      }
    });

    const responses = await Promise.allSettled(stockPromises);
    
    const marketData = responses
      .filter(result => result.status === 'fulfilled' && result.value && result.value['Global Quote'])
      .map(result => {
        const data = result.value['Global Quote'];
        return {
          symbol: data['01. symbol'],
          price: parseFloat(data['05. price']),
          change: parseFloat(data['09. change']),
          changePercent: parseFloat(data['10. change percent'].replace('%', '')),
          volume: parseInt(data['06. volume']),
          high: parseFloat(data['03. high']),
          low: parseFloat(data['04. low'])
        };
      });

    const result = {
      status: 'success',
      data: marketData
    };

    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    res.json(result);
  } catch (error) {
    console.error('Market Overview Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch market overview'
    });
  }
});

// Get company overview
router.get('/company/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `company_${symbol}`;
    
    if (cache.has(cacheKey)) {
      return res.json(cache.get(cacheKey).data);
    }

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
    );

    const data = response.data;
    
    if (!data || Object.keys(data).length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Company information not available'
      });
    }

    const companyInfo = {
      symbol: data.Symbol,
      name: data.Name,
      description: data.Description,
      exchange: data.Exchange,
      currency: data.Currency,
      country: data.Country,
      sector: data.Sector,
      industry: data.Industry,
      marketCap: parseFloat(data.MarketCapitalization) || 0,
      peRatio: parseFloat(data.PERatio) || 0,
      dividendYield: parseFloat(data.DividendYield) || 0,
      profitMargin: parseFloat(data.ProfitMargin) || 0,
      revenue: parseFloat(data.RevenueTTM) || 0,
      eps: parseFloat(data.EPS) || 0
    };

    const result = {
      status: 'success',
      data: companyInfo
    };

    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    res.json(result);
  } catch (error) {
    console.error('Company Overview Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch company information'
    });
  }
});

export default router;