require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const dnaRoutes = require('./routes/dna');
const graphRoutes = require('./routes/graph');
const timelineRouter = require('./routes/timeline');

const app = express();
// Configure CORS to allow FRONTEND_URL (fallback to all origins)
const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// Health check - placed before other routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error(err));

app.use('/api/dna', dnaRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/timeline', timelineRouter);

const debugRoutes = require('./routes/debug');

app.use('/api/debug', debugRoutes);

mongoose.connection.once('open', async () => {
  console.log('Connected DB name:', mongoose.connection.name);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on ${PORT}`));