const express = require('express');
const bcrypt = require('bcryptjs');
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
    user: 'sql12729499',       // Replace with your MySQL username
    password: 'rfAwVfvkhI', // Replace with your MySQL password
    database: 'sql12729499' // Replace with your MySQL database name
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

app.post('/register', (req, res) => {
    const { name, email, username, password, phone, money } = req.body; // Accessing all parameters from the request body

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

app.post('/login', (req, res) => {
    const { username, password } = req.body; // การเข้าถึงพารามิเตอร์จาก request body

    // ตรวจสอบว่ามีฟิลด์ที่ต้องการหายไปหรือไม่
    if (!username || !password) {
        return res.status(400).send('กรุณากรอกข้อมูลให้ครบทุกช่อง (username และ password)');
    }

    // SQL query เพื่อทำการตรวจสอบผู้ใช้
    const sql = 'SELECT * FROM members WHERE username = ? AND password = ?';

    // การดำเนินการ query โดยใช้ค่า
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error('เกิดข้อผิดพลาดในการสอบถามข้อมูล:', err);
            return res.status(500).send('เกิดข้อผิดพลาดขณะสอบถามข้อมูล.');
        }

        if (results.length > 0) {
            res.status(200).send('เข้าสู่ระบบสำเร็จ');
        } else {
            res.status(401).send('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
    });
});

app.post('/forget_password', (req, res) => {
    const { username, email, phone, new_password } = req.body; // การเข้าถึงพารามิเตอร์จาก request body

    // ตรวจสอบว่ามีฟิลด์ที่ต้องการหายไปหรือไม่
    if (!username || !email || !phone || !new_password) {
        return res.status(400).send('กรุณากรอกข้อมูลให้ครบทุกช่อง (username และ password)');
    }

    // SQL query เพื่อทำการตรวจสอบผู้ใช้
    const sql = 'SELECT * FROM members WHERE username = ? AND email = ? AND phone = ?';

    // การดำเนินการ query โดยใช้ค่า
    db.query(sql, [username, email, phone], (err, results) => {
        if (err) {
            console.error('เกิดข้อผิดพลาดในการสอบถามข้อมูล:', err);
            return res.status(500).send('เกิดข้อผิดพลาดขณะสอบถามข้อมูล.');
        }

        if (results.length > 0) {
            const sql = 'UPDATE members SET password = ?';
            db.query(sql, [new_password], (err, results) => {
                if (err) {
                    console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล:', err);
                    return res.status(500).send('เกิดข้อผิดพลาดขณะอัปเดตข้อมูล.');
                }
        
                if (results.affectedRows > 0) {
                    res.status(200).send('อัปเดตรหัสผ่านสำเร็จ');
                } else {
                    res.status(404).send('ไม่พบผู้ใช้ที่ต้องการอัปเดต');
                }
            });
        } else {
            res.status(401).send('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
    });
});

//แรมด้อม เลข 6 หลัก มา 100 ชุด ex. /randomLotto?count=50
//random lotto
// app.get('/randomLotto', (req, res) => {
//     const numberOfSets = parseInt(req.query.count) || 100; //รับค่าว่าจะสุ่มเลขกี่ชุด //ค่าเริ่มต้น 100
//     const sqlSelect = "SELECT lotto_number FROM lotto";
//     const sqlInsert = "INSERT INTO lotto (lotto_number) VALUES ? ";
    
//     // Step 1: ดึงข้อมูลที่มียุแล้วในตารางออกมา
//     db.query(sqlSelect, (err, results) => {
//         if (err) {
//             console.error('Error fetching data:', err);
//             res.status(500).send('An error occurred while fetching data.');
//         } else {
//             const existingNumbers = new Set(results.map(row => row.lotto_number));
//             const lottoNumbers = new Set();

//             // Step 2: สุ่มเลข 6 หลัก
//             while (lottoNumbers.size < numberOfSets) {
//                 const randomNumber = Math.floor(100000 + Math.random() * 900000).toString();
                
//                 // Step 3: เช็คว่าเลขที่สุ่มได้ ซ้ำกับอันเดิมม้้ย (แล้วเก็บใน lottoNumbers)
//                 if (!existingNumbers.has(randomNumber)) {
//                     lottoNumbers.add(randomNumber);
//                 }
//             }

//             const lottoArray = Array.from(lottoNumbers).map(number => [number]);

//             // Step 4: Insert 
//             db.query(sqlInsert, [lottoArray], (err, insertResults) => {
//                 if (err) {
//                     console.error('Error inserting data:', err);
//                     res.status(500).send('An error occurred while inserting data.');
//                 } else {
//                     res.json({ message: 'Lotto numbers generated and stored successfully.', insertedCount: insertResults.affectedRows });
//                 }
//             });
//         }
//     });
// });


app.get('/randomLotto', (req, res) => {
    const numberOfSets = parseInt(req.query.count) || 100; // จำนวนชุดที่ต้องการสุ่ม (ค่าเริ่มต้นคือ 100)
    const sqlSelect = "SELECT lotto_number FROM lotto"; // คำสั่ง SQL สำหรับดึงเลขที่มีอยู่
    const sqlInsert = "INSERT INTO lotto (lotto_number) VALUES ?"; // คำสั่ง SQL สำหรับแทรกข้อมูล

    // Step 1: สุ่มเลข 6 หลัก
    const lottoNumbers = new Set();

    while (lottoNumbers.size < numberOfSets) {
        const randomNumber = Math.floor(100000 + Math.random() * 900000).toString();

        // ตรวจสอบว่าเลขนี้ซ้ำกับเลขที่มีอยู่หรือไม่
        lottoNumbers.add(randomNumber);
    }

    const lottoArray = Array.from(lottoNumbers).map(number => [number]);

    // Step 2: บันทึกเลขที่สุ่มได้ลงในตาราง
    db.query(sqlInsert, [lottoArray], (err, insertResults) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('An error occurred while inserting data.');
        }

        res.json({ message: 'Lotto numbers generated and stored successfully.', insertedCount: insertResults.affectedRows });
    });
});




//ค้นหาlotto
//ex. /searchLotto?number=123
app.get('/searchLotto', (req, res) => {
    const lottoNumber = req.query.number || ''; // รับหมายเลขล็อตโต้ที่ต้องการค้นหาจาก query parameter (ค่าเริ่มต้นเป็น empty string)
    const sqlSearch = "SELECT * FROM lotto WHERE lotto_number LIKE ? AND status = 1";

    const searchPattern = `%${lottoNumber}%`;

    db.query(sqlSearch, [searchPattern], (err, results) => {
        if (err) {
            console.error('Error searching for lotto number:', err);
            res.status(500).send('An error occurred while searching for the lotto number.');
        } else if (results.length > 0) {
            res.json({ message: 'Lotto numbers found.', data: results });
        } else {
            res.json({ message: 'No matching lotto numbers found.' });
        }
    });
});

//เลขลงตะกร้า
app.post('/Add_to_basket', (req, res) => {
    const { member_id, lotto_id, lotto_number } = req.body;

    const sqlInsert = "INSERT INTO basket (member_id, lotto_id, lotto_number, price) VALUES (?, ?, ?, 500)";

    db.query(sqlInsert, [member_id, lotto_id, lotto_number], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).send('An error occurred while adding to the basket.');
        } else {
            res.json({ message: 'Lotto added to basket successfully.', basketId: results.insertId });
        }
    });
});


//SELECT เลขในตะกร้า ของแต่ละคน 
app.get('/My_basket/:member_id', (req, res) => {
    const member_id = req.params.member_id; 
    const sqlSelect = "SELECT * FROM basket WHERE member_id = ?"; 

    db.query(sqlSelect, [member_id], (err, results) => {
        if (err) {
            console.error('Error searching for basket:', err);
            res.status(500).send('An error occurred while searching for the basket.');
        } else if (results.length > 0) {
            res.json({ message: 'All Lotto numbers in the basket.', data: results });
        } else {
            res.json({ message: 'Empty basket.' });
        }
    });
});

app.get('/get_Lotto', (req, res) => {
    const sql = 'SELECT * FROM lotto'; // Replace 'users' with your table name
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
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
