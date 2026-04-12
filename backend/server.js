const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const connectDB = require('./config/db');


dotenv.config(); // this loads environment variables 
const connectDB = require('./config/db');


const app = express(); // initializes Express app


connectDB(); // connects with MongoDB database

// middleware
app.use(cors()); // enable requests from different origins (e.g., frontend running on a different port)
app.use(express.json()); // allow server to read JSON data from requests
app.use(express.urlencoded({ extended: true })); // allow server to read URL-encoded form data


// basic route for testing
app.get('/', (req, res) => {  // '=>' this is called arrow function
  res.json({ message: 'Welcome to SmartEstate' });
});

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {} // '===' is a strict equality operator
  });
});

// starts the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
