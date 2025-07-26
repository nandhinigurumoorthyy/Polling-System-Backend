const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const { createDbConnection } = require("./db");
const authRoutes = require('./auth/auth.controller');
const pollRoutes = require('./controller/poll.controller');
const userRoutes = require('./controller/user.controller');
const { authenticateToken } = require('./guards/auth.guard');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'https://polling-system-ui.netlify.app/',
  methods: ["POST", "GET", "DELETE", "PUT"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));


// Routes
app.use('/auth', authRoutes);
app.use('/polls', authenticateToken, pollRoutes);
app.use('/users', authenticateToken, userRoutes);

// Start server
app.listen(PORT, () => {
  createDbConnection();
  console.log(`Server running on port ${PORT}`);
});
