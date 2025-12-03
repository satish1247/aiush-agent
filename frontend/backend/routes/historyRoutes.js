const express = require('express');
const router = express.Router();
const History = require('../models/History');
const { protect } = require('../middleware/authMiddleware');

// @desc    Add entry to history
// @route   POST /history/add
router.post('/add', protect, async (req, res) => {
  const { message, ai_response, type } = req.body;

  try {
    const historyItem = await History.create({
      user_id: req.user._id,
      message,
      ai_response,
      type: type || 'text',
    });

    res.status(201).json(historyItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save history' });
  }
});

// @desc    Get user history
// @route   GET /history/get
router.get('/get', protect, async (req, res) => {
  try {
    const history = await History.find({ user_id: req.user._id }).sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// @desc    Clear user history
// @route   DELETE /history/clear
router.delete('/clear', protect, async (req, res) => {
  try {
    await History.deleteMany({ user_id: req.user._id });
    res.json({ message: 'History cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

module.exports = router;