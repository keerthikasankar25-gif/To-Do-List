require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// GET / health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Mount /api/auth
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Mount /api/todos with require("./routes/todos") (placeholder router if missing)
let todosRouter;
try {
  todosRouter = require('./routes/todos');
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND' && err.message.includes('./routes/todos')) {
    todosRouter = express.Router();
  } else {
    throw err;
  }
}
app.use('/api/todos', todosRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
