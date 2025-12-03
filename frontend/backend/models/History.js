const mongoose = require('mongoose');

const historySchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  message: {
    type: String,
    required: true,
  },
  ai_response: {
    type: Object, // Stores the full JSON response from AI
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'voice', 'ocr', 'action'],
    default: 'text',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('History', historySchema);