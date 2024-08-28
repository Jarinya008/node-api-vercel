const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 4000;

// MySQL database connection configuration
const db = mysql.createConnection({
    host: 'sql12.freemysqlhosting.net',
    user: 'sql12728321',       // Replace with your MySQL username
    password: 'ZwNyfyG6QP', // Replace with your MySQL password
    database: 'sql12728321' // Replace with your MySQL database name
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Could not connect to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/about', (req, res) => {
    res.send('This is my about route');
});

// New route to fetch data from MySQL
app.get('/users', (req, res) => {
    const sql = 'SELECT * FROM members'; // Replace 'users' with your table name
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).send('An error occurred while fetching data.');
        } else {
            res.json(results); // Send the results as a JSON response
        }
    });
});

module.exports = app;
