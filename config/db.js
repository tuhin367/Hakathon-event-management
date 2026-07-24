const mysql = require('mysql2');
require('dotenv').config();

// Create the connection pool to your XAMPP MySQL database
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',      // XAMPP default username
    password: '',      // XAMPP default password is an empty string
    database: 'ewu_event_manager' // The name of the database you just created
});

// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the XAMPP database:', err.message);
    } else {
        console.log('Successfully connected to the XAMPP MySQL database!');
        connection.release();
    }
});

// Export the pool to use in your controllers
module.exports = pool.promise();