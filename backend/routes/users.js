const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('activities');

    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Get user portfolio
router.get('/portfolio', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('portfolio balance');
    
    res.json({
      status: 'success',
      data: {
        portfolio: user.portfolio,
        balance: user.balance
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Update watchlist
router.patch('/watchlist', auth, async (req, res) => {
  try {
    const { symbol, action } = req.body; // action: 'add' or 'remove'
    
    const user = await User.findById(req.user.id);
    
    if (action === 'add') {
      if (!user.watchlist.includes(symbol)) {
        user.watchlist.push(symbol);
      }
    } else if (action === 'remove') {
      user.watchlist = user.watchlist.filter(s => s !== symbol);
    }
    
    await user.save();
    
    res.json({
      status: 'success',
      data: { watchlist: user.watchlist }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

module.exports = router;