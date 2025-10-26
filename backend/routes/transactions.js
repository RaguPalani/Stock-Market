const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Buy stocks
router.post('/buy', auth, async (req, res) => {
  try {
    const { symbol, shares, price } = req.body;
    const userId = req.user.id;
    const totalCost = shares * price;

    const user = await User.findById(userId);
    
    if (user.balance < totalCost) {
      return res.status(400).json({
        status: 'fail',
        message: 'Insufficient balance'
      });
    }

    // Update user balance
    user.balance -= totalCost;

    // Update portfolio
    const existingStock = user.portfolio.find(item => item.symbol === symbol);
    
    if (existingStock) {
      const totalShares = existingStock.shares + shares;
      const totalValue = (existingStock.shares * existingStock.averagePrice) + totalCost;
      existingStock.averagePrice = totalValue / totalShares;
      existingStock.shares = totalShares;
    } else {
      user.portfolio.push({
        symbol,
        shares,
        averagePrice: price
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      user: userId,
      type: 'buy',
      symbol,
      shares,
      price,
      totalAmount: totalCost
    });

    // Add activity
    user.activities.push({
      type: 'buy',
      description: `Bought ${shares} shares of ${symbol} at $${price}`
    });

    await user.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(userId).emit('portfolio-update', user.portfolio);
    io.to(userId).emit('balance-update', user.balance);

    res.json({
      status: 'success',
      message: `Successfully bought ${shares} shares of ${symbol}`,
      data: {
        transaction,
        newBalance: user.balance
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Sell stocks
router.post('/sell', auth, async (req, res) => {
  try {
    const { symbol, shares, price } = req.body;
    const userId = req.user.id;
    const totalAmount = shares * price;

    const user = await User.findById(userId);
    const existingStock = user.portfolio.find(item => item.symbol === symbol);
    
    if (!existingStock || existingStock.shares < shares) {
      return res.status(400).json({
        status: 'fail',
        message: 'Insufficient shares to sell'
      });
    }

    // Update portfolio
    existingStock.shares -= shares;
    if (existingStock.shares === 0) {
      user.portfolio = user.portfolio.filter(item => item.symbol !== symbol);
    }

    // Update balance
    user.balance += totalAmount;

    // Create transaction
    const transaction = await Transaction.create({
      user: userId,
      type: 'sell',
      symbol,
      shares,
      price,
      totalAmount
    });

    // Add activity
    user.activities.push({
      type: 'sell',
      description: `Sold ${shares} shares of ${symbol} at $${price}`
    });

    await user.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(userId).emit('portfolio-update', user.portfolio);
    io.to(userId).emit('balance-update', user.balance);

    res.json({
      status: 'success',
      message: `Successfully sold ${shares} shares of ${symbol}`,
      data: {
        transaction,
        newBalance: user.balance
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Get user transactions
router.get('/my-transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      status: 'success',
      data: transactions
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

module.exports = router;