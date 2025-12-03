require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const historyRoutes = require('./routes/historyRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for image/base64 data

// Database Connection
mongoose.connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/history', historyRoutes);
app.use('/aiush', aiRoutes);
// placeholders for specific voice/ocr endpoints if logic differs from generic AI query
app.post('/voice/transcript', (req, res) => res.json({ message: "Voice transcript endpoint ready" })); 
app.post('/ocr/upload', (req, res) => res.json({ message: "OCR upload endpoint ready" }));

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'API is running', service: 'Aiush Agent Backend' });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});