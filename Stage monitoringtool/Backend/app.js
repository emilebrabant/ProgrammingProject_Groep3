const express = require("express");
const cors = require("cors");
const session = require("express-session");
const app = express();
const authRoutes = require("./routes/authRoutes")
require('dotenv').config();

// CORS config
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 1000 * 60 * 60 * 8,
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  }
}));

// Routes
app.use("/api/auth", authRoutes);

// Add error handling middleware to see what's happening
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(3000, () => console.log("Backend draait op poort 3000"));