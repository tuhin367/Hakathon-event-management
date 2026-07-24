const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize the Express application
const app = express();

// Middleware setup
app.use(cors()); // Allows your vanilla JS frontend to communicate with this backend
app.use(express.json()); // Allows your server to read incoming JSON data

// A simple test route to verify the server is working
app.get('/', (req, res) => {
    res.send('EWU Event Manager Backend is running!');
});

// Define the port (it will look for a PORT in your .env file, or default to 3000)
const PORT = process.env.PORT || 3000;

// Start the server and listen for incoming requests
app.listen(PORT, () => {
    console.log(`Server is successfully running on http://localhost:${PORT}`);
});