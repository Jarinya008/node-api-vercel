const express = require('express');
const mysql = require('mysql2');

const app = express();
const cors = require("cors");
const corsConfig = {
    origin: "*",
    Credential: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
};
app.options("", cors(corsConfig));
app.use(cors(corsConfig));
app.use(express.json());
const PORT = 3306;

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
// app.post('/register', async (req, res) => {
//     const { username, password } = req.body; // Assuming you send username and password in the body

//     if (!username || !password) {
//         return res.status(400).send('Username and password are required');
//     }

//     try {
//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

//         // SQL query with placeholders
//         const sql = 'INSERT INTO members (username, password) VALUES (?, ?)';

//         // Execute the query with values
//         db.query(sql, [username, hashedPassword], (err, results) => {
//             if (err) {
//                 console.error('Error inserting data:', err);
//                 return res.status(500).send('An error occurred while inserting data.');
//             }

//             res.status(201).send('User registered successfully');
//         });
//     } catch (err) {
//         console.error('Error hashing password:', err);
//         res.status(500).send('An error occurred while processing the request.');
//     }
// });

app.post('/register/:name/:email/:username/:password/:phone/:money', (req, res) => {
    const { name, email, username, password, phone, money } = req.params; // Accessing all parameters from the URL

    // Check if any required field is missing
    if (!name || !email || !username || !password || !phone || !money) {
        return res.status(400).send('All fields (name, email, username, password, phone, money) are required');
    }

    // SQL query with placeholders
    const sql = 'INSERT INTO members (name, email, username, password, phone, money) VALUES (?, ?, ?, ?, ?, ?)';

    // Execute the query with values
    db.query(sql, [name, email, username, password, phone, money], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('An error occurred while inserting data.');
        }

        res.status(201).send('User registered successfully');
    });
});

module.exports = app;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
