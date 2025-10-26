import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import axios from 'axios';

const router = express.Router();

router.use(auth);

// Get user portfolio with real-time prices
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get real-time prices for portfolio items
    const portfolioWithPrices = await Promise.all(
      user.portfolio.map(async (item) => {
        try {
          const response = await axios.get(`http://localhost:5000/api/market/quote/${item.symbol}`);
          const currentPrice = response.data.data.price;
          const currentValue = currentPrice * item.quantity;
          const investment = item.averagePrice * item.quantity;
          const profitLoss = currentValue - investment;
          const profitLossPercent = (profitLoss / investment) * 100;

          return {
            ...item.toObject(),
            currentPrice,
            currentValue,
            profitLoss,
            profitLossPercent,
            dayChange: response.data.data.change * item.quantity
          };
        } catch (error) {
          return {
            ...item.toObject(),
            currentPrice: item.averagePrice,
            currentValue: item.averagePrice * item.quantity,
            profitLoss: 0,
            profitLossPercent: 0,
            dayChange: 0
          };
        }
      })
    );

    const totalPortfolioValue = portfolioWithPrices.reduce((total, item) => total + item.currentValue, 0);
    const totalProfitLoss = portfolioWithPrices.reduce((total, item) => total + item.profitLoss, 0);

    res.json({
      status: 'success',
      data: {
        portfolio: portfolioWithPrices,
        balance: user.balance,
        totalPortfolioValue: totalPortfolioValue + user.balance,
        totalProfitLoss,
        totalTrades: user.totalTrades
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Buy stock with enhanced validation
router.post('/buy', async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    
    if (!symbol || !quantity || quantity <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid symbol or quantity'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Get real-time stock data
    const stockResponse = await axios.get(`http://localhost:5000/api/market/quote/${symbol}`);
    if (!stockResponse.data.data) {
      return res.status(404).json({
        status: 'fail',
        message: 'Stock not found'
      });
    }

    const stockData = stockResponse.data.data;
    const totalCost = stockData.price * quantity;

    if (user.balance < totalCost) {
      return res.status(400).json({
        status: 'fail',
        message: `Insufficient balance. Need $${totalCost.toFixed(2)}, available $${user.balance.toFixed(2)}`
      });
    }

    // Update user balance
    user.balance -= totalCost;

    // Update portfolio
    const existingStock = user.portfolio.find(item => item.symbol === symbol);
    
    if (existingStock) {
      const totalQuantity = existingStock.quantity + quantity;
      const totalValue = (existingStock.averagePrice * existingStock.quantity) + totalCost;
      existingStock.averagePrice = totalValue / totalQuantity;
      existingStock.quantity = totalQuantity;
      existingStock.totalInvestment = totalValue;
    } else {
      // Get company name for new stock
      const companyResponse = await axios.get(`http://localhost:5000/api/market/company/${symbol}`);
      const companyName = companyResponse.data.data?.name || symbol;

      user.portfolio.push({
        symbol,
        companyName,
        quantity,
        averagePrice: stockData.price,
        totalInvestment: totalCost
      });
    }

    // Create transaction record
    await Transaction.create({
      user: user._id,
      type: 'BUY',
      symbol,
      companyName: stockData.symbol,
      quantity,
      price: stockData.price,
      totalAmount: totalCost
    });

    user.totalTrades += 1;
    await user.save();

    res.json({
      status: 'success',
      message: `Successfully bought ${quantity} shares of ${symbol} at $${stockData.price.toFixed(2)}`,
      data: {
        portfolio: user.portfolio,
        balance: user.balance,
        transaction: {
          symbol,
          quantity,
          price: stockData.price,
          totalAmount: totalCost
        }
      }
    });
  } catch (error) {
    console.error('Buy stock error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Sell stock
router.post('/sell', async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    
    if (!symbol || !quantity || quantity <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid symbol or quantity'
      });
    }

    const user = await User.findById(req.user.id);
    const existingStock = user.portfolio.find(item => item.symbol === symbol);
    
    if (!existingStock || existingStock.quantity < quantity) {
      return res.status(400).json({
        status: 'fail',
        message: `Insufficient shares. You have ${existingStock?.quantity || 0} shares of ${symbol}`
      });
    }

    // Get current stock price
    const stockResponse = await axios.get(`http://localhost:5000/api/market/quote/${symbol}`);
    const stockData = stockResponse.data.data;

    const totalValue = stockData.price * quantity;
    const investment = existingStock.averagePrice * quantity;
    const profitLoss = totalValue - investment;

    // Update user balance
    user.balance += totalValue;

    // Update portfolio
    if (existingStock.quantity === quantity) {
      user.portfolio = user.portfolio.filter(item => item.symbol !== symbol);
    } else {
      existingStock.quantity -= quantity;
      existingStock.totalInvestment = existingStock.averagePrice * existingStock.quantity;
    }

    // Update total profit/loss
    user.totalProfitLoss += profitLoss;

    // Create transaction record
    await Transaction.create({
      user: user._id,
      type: 'SELL',
      symbol,
      companyName: stockData.symbol,
      quantity,
      price: stockData.price,
      totalAmount: totalValue,
      profitLoss
    });

    user.totalTrades += 1;
    await user.save();

    res.json({
      status: 'success',
      message: `Successfully sold ${quantity} shares of ${symbol} at $${stockData.price.toFixed(2)}`,
      data: {
        portfolio: user.portfolio,
        balance: user.balance,
        profitLoss,
        transaction: {
          symbol,
          quantity,
          price: stockData.price,
          totalAmount: totalValue
        }
      }
    });
  } catch (error) {
    console.error('Sell stock error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get transaction history
router.get('/transactions', async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Transaction.countDocuments({ user: req.user.id });

    res.json({
      status: 'success',
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Add to watchlist
router.post('/watchlist', async (req, res) => {
  try {
    const { symbol } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.watchlist.includes(symbol)) {
      user.watchlist.push(symbol);
      await user.save();
    }

    res.json({
      status: 'success',
      message: `Added ${symbol} to watchlist`,
      data: {
        watchlist: user.watchlist
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Remove from watchlist
router.delete('/watchlist/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const user = await User.findById(req.user.id);

    user.watchlist = user.watchlist.filter(s => s !== symbol);
    await user.save();

    res.json({
      status: 'success',
      message: `Removed ${symbol} from watchlist`,
      data: {
        watchlist: user.watchlist
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;