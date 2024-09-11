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
    //host: 'sql12.freemysqlhosting.net',
    user: 'web66_65011212021',       // Replace with your MySQL username
    password: '65011212021@csmsu', // Replace with your MySQL password
    database: 'web66_65011212021' // Replace with your MySQL database name
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

// เส้นทางใหม่สำหรับดึงโปรไฟล์ผู้ใช้
app.get('/getUserProfile/:member_id', (req, res) => {
    const memberId = req.params.member_id;
  
    const sqlSelect = "SELECT * FROM members WHERE member_id = ?";
    db.query(sqlSelect, [memberId], (err, results) => {
      if (err) {
        console.error('Error fetching user profile:', err);
        return res.status(500).send('Error fetching user profile');
      }
  
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(404).send('User not found');
      }
    });
  });  


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
            res.json({
                message: 'เข้าสู่ระบบสำเร็จ',
                data: results[0] // ส่งเฉพาะข้อมูลผู้ใช้ที่ตรงกัน
            });
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

    // แบ่งหมายเลขล็อตโต้ออกเป็นตัวเลขย่อย
    const searchTerms = lottoNumber.split('').map(num => `%${num}%`);
    
    // สร้างคำสั่ง SQL และ array สำหรับค่าพารามิเตอร์
    let sqlSearch = "SELECT * FROM lotto WHERE status = 1";
    let sqlParams = [];
    
    // เพิ่มเงื่อนไขการค้นหาให้กับคำสั่ง SQL
    if (searchTerms.length > 0) {
        sqlSearch += ' AND (' + searchTerms.map((_, i) => `lotto_number LIKE ?`).join(' AND ') + ')';
        sqlParams = searchTerms;
    }

    db.query(sqlSearch, sqlParams, (err, results) => {
        if (err) {
            console.error('Error searching for lotto number:', err);
            res.status(500).send('An error occurred while searching for the lotto number.');
        } else if (results.length > 0) {
            res.json(results); // ส่งผลลัพธ์ JSON 
        }
    });
});



//เลขลงตะกร้า
app.post('/Add_to_basket', (req, res) => {
    const { member_id, lotto_id, lotto_number } = req.body;

    const sqlInsert = "INSERT INTO basket (member_id, lotto_id, lotto_number, price) VALUES (?, ?, ?, 80)";

    db.query(sqlInsert, [member_id, lotto_id, lotto_number], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).send('An error occurred while adding to the basket.');
        } else {
            res.json({ message: 'Lotto added to basket successfully.',results});
        }
    });
});


//SELECT เลขในตะกร้า ของแต่ละคน 
app.get('/My_basket/:member_id', (req, res) => {
    const member_id = req.params.member_id; 
    const sqlSelect = `
        SELECT basket.*, lotto.status 
        FROM basket 
        JOIN lotto ON basket.lotto_id = lotto.lotto_id 
        WHERE basket.member_id = ? AND lotto.status = 1
    `;

    db.query(sqlSelect, [member_id], (err, results) => {
        if (err) {
            console.error('Error searching for basket:', err);
            res.status(500).send('An error occurred while searching for the basket.');
        } else if (results.length > 0) {
            res.json(results);
        } else {
            res.json({ message: 'Empty basket.' });
        }
    });
});


// SELECT เลขที่ซื้อแล้ว ของแต่ละคน 
app.get('/My_buyLotto/:member_id', (req, res) => {
    const member_id = req.params.member_id; 
    const sqlSelect = "SELECT * FROM buy WHERE member_id = ?"; 

    db.query(sqlSelect, [member_id], (err, results) => {
        if (err) {
            console.error('Error searching for basket:', err);
            res.status(500).send('An error occurred while searching for the basket.');
        } else if (results.length > 0) {
            res.json(results);
        } else {
            res.json({ message: 'Empty basket.' });
        }
    });
});

// app.post('/buy', (req, res) => {
//     const { name, lotto_number } = req.body;
//     const sqlMem = "SELECT member_id,money FROM members WHERE name = ?";
//     db.query(sqlMem, [name], (err, results) => {
//         if (err) {
//             console.error('Error searching for member:', err);
//             res.status(500).send('An error occurred while searching for the member.');
//         } else if (results.length > 0) {
//             const sqllotto = "SELECT lotto_id,lotto_number FROM lotto WHERE lotto_number = ?";
//             db.query(sqllotto, [lotto_number], (err, results) => {
//                 if (err) {
//                     console.error('Error searching for lotto:', err);
//                     res.status(500).send('An error occurred while searching for the lotto.');
//                 } else if (results.length > 0) {
//                     const sqlmoney = "SELECT lotto_id,lotto_number FROM lotto WHERE lotto_number = ?";
//                     db.query(sqllotto, [lotto_number], (err, results) => {
//                         if (err) {
//                             console.error('Error searching for lotto:', err);
//                             res.status(500).send('An error occurred while searching for the lotto.');
//                         } else if (results.length > 0) {
//                             res.json({ message: 'All Lotto numbers in the lotto.', data: results });
//                         } else {
//                             res.json({ message: 'Empty lotto.' });
//                         }
//                     });
//                 } else {
//                     res.json({ message: 'Empty lotto.' });
//                 }
//             });
//         } else {
//             res.json({ message: 'Empty basket.' });
//         }
//     });

// });


app.post('/buy', (req, res) => {
    const { member_id, lotto_id } = req.body;

    // ตรวจสอบสมาชิก และ select เอาเงินสมาชิกออกมา
    const sqlMem = "SELECT member_id, money FROM members WHERE member_id = ?";
    db.query(sqlMem, [member_id], (err, memberResults) => {
        if (err) {
            console.error('Error searching for member:', err);
            return res.status(500).send('An error occurred while searching for the member.');
        }

        if (memberResults.length > 0) {
            const member = memberResults[0];
            const memberMoney = member.money;
            const lottoPrice = 80; // ตั้งราคาเป็น 80 บาทตามที่กำหนด

            console.log(memberMoney);
            console.log(lottoPrice);

            // เปรียบเทียบเงินกับราคา
            if (memberMoney >= lottoPrice) {
                // เงินเพียงพอ ทำการซื้อ
                // ตรวจสอบข้อมูลล็อตเตอรี่
                const sqlLotto = "SELECT lotto_number FROM basket WHERE lotto_id = ? AND member_id = ?";
                db.query(sqlLotto, [lotto_id,member_id], (err, lottoResults) => {
                    if (err) {
                        console.error('Error searching for lotto number:', err);
                        return res.status(500).send('An error occurred while searching for the lotto number.');
                    }

                    if (lottoResults.length > 0) {
                        const lotto = lottoResults[0].lotto_number;

                        // คำสั่ง SQL สำหรับการซื้อ
                        const sqlInsert = "INSERT INTO buy (member_id, lotto_id, lotto_number, price, date_buy) VALUES (?, ?, ?, ?, NOW())";
                        db.query(sqlInsert, [member_id, lotto_id, lotto, lottoPrice], (err, insertResults) => {
                            if (err) {
                                console.error('Error inserting buy record:', err);
                                return res.status(500).send('An error occurred while processing the purchase.');
                            }

                            // ลดเงินของสมาชิก 80 บาท
                            const sqlUpdateMoney = "UPDATE members SET money = money - ? WHERE member_id = ?";
                            db.query(sqlUpdateMoney, [lottoPrice, member_id], (err, updateResults) => {
                                if (err) {
                                    console.error('Error updating member money:', err);
                                    return res.status(500).send('An error occurred while updating the member\'s money.');
                                }

                                // ลบข้อมูลล็อตเตอรี่จากตาราง basket
                                const sqlDeleteBasket = "DELETE FROM basket WHERE member_id = ? AND lotto_id = ?";
                                db.query(sqlDeleteBasket, [member_id, lotto_id], (err, deleteResults) => {
                                    if (err) {
                                        console.error('Error deleting from basket:', err);
                                        return res.status(500).send('An error occurred while deleting the item from basket.');
                                    }

                                    // อัพเดทสถานะล็อตโต้เป็น 0
                                    const sqlUpdateStatus = "UPDATE lotto SET status = 0 WHERE lotto_id = ?";
                                    db.query(sqlUpdateStatus, [lotto_id], (err, upResults) => {
                                        if (err) {
                                            console.error('Error updating lotto status:', err);
                                            return res.status(500).send('An error occurred while updating the lotto status.');
                                        }

                                        res.json({ message: 'successful' });
                                    });
                                });
                            });
                        });
                    } else {
                        res.status(404).send('Lotto number not found.');
                    }
                });
            } else {
                res.status(400).send('Insufficient funds.');
            }
        } else {
            res.status(404).send('Member not found.');
        }
    });
});


//lotto ทั้งหมด
app.get('/get_Lotto', (req, res) => {
    const sql = 'SELECT * FROM lotto'; // ดึงข้อมูลทั้งหมดจากตาราง lotto
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).send('An error occurred while fetching data.'); // แจ้ง error กรณีเกิดปัญหา
        } else {
            res.json(results); // ส่งผลลัพธ์กลับในรูปแบบ JSON
        }
    });
});


//lottoที่ยังไม่ขาย
app.get('/get_Lotto_status1', (req, res) => {
    const sql = 'SELECT * FROM lotto where status = 1'; // ดึงข้อมูลทั้งหมดจากตาราง lotto
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).send('An error occurred while fetching data.'); // แจ้ง error กรณีเกิดปัญหา
        } else {
            res.json(results); // ส่งผลลัพธ์กลับในรูปแบบ JSON
        }
    });
});

//ลบ lotto ออกจากตระกร้า
app.delete('/removeLottoFromBasket', (req, res) => {
    const { lotto_id, member_id } = req.body; // รับข้อมูลจาก body ของคำขอ

    if (!lotto_id || !member_id) {
        return res.status(400).send('หมายเลขล็อตโต้และ member ID ต้องถูกระบุ');
    }

    // คำสั่ง SQL สำหรับลบล็อตโต้จากตะกร้า
    const sqlDelete = "DELETE FROM basket WHERE lotto_id = ? AND member_id = ?";

    db.query(sqlDelete, [lotto_id, member_id], (err, results) => {
        if (err) {
            console.error('Error removing lotto from basket:', err);
            return res.status(500).send('เกิดข้อผิดพลาดในการลบล็อตโต้จากตะกร้า');
        }

        // ตรวจสอบว่ามีการลบแถวหรือไม่
        if (results.affectedRows > 0) {
            res.send('ล็อตโต้ถูกลบออกจากตะกร้าเรียบร้อยแล้ว');
        } else {
            res.status(404).send('ไม่พบล็อตโต้ในตะกร้าสำหรับสมาชิกที่ระบุ');
        }
    });
});

//เติมเงิน
app.post('/addWallet', (req, res) => {
    const { member_id, amount } = req.body;

    // ตรวจสอบว่ามีข้อมูลที่ต้องการครบหรือไม่
    if (!member_id || !amount) {
        return res.status(400).send('Member ID และจำนวนเงินต้องถูกระบุ');
    }

    // select เงินเดิม
    const sqlSelect = "SELECT money FROM members WHERE member_id = ?";
    db.query(sqlSelect, [member_id], (err, memberResults) => {
        if (err) {
            console.error('Error selecting member money:', err);
            return res.status(500).send('เกิดข้อผิดพลาดในการค้นหายอดเงินของสมาชิก');
        }

        if (memberResults.length > 0) {
            const currentMoney = memberResults[0].money;

            // บวกจำนวนเงินใหม่
            const updatedMoney = currentMoney + amount;

            //อัปเดทยอดเงินของสมาชิก
            const sqlUpdate = "UPDATE members SET money = ? WHERE member_id = ?";
            db.query(sqlUpdate, [updatedMoney, member_id], (err, updateResults) => {
                if (err) {
                    console.error('Error updating member money:', err);
                    return res.status(500).send('เกิดข้อผิดพลาดในการอัปเดทยอดเงินของสมาชิก');
                }

                res.json({ message: 'ยอดเงินถูกเพิ่มเรียบร้อยแล้ว', updatedMoney });
            });
        } else {
            res.status(404).send('ไม่พบสมาชิกที่ระบุ');
        }
    });
});


//ถอนเงิน 
app.post('/Withdraw_money', (req, res) => {
    const { member_id, amount } = req.body;

    // ตรวจสอบว่ามีข้อมูลที่ต้องการครบหรือไม่
    if (!member_id || !amount) {
        return res.status(400).send('Member ID และจำนวนเงินต้องถูกระบุ');
    }

    // select เงินเดิม
    const sqlSelect = "SELECT money FROM members WHERE member_id = ?";
    db.query(sqlSelect, [member_id], (err, memberResults) => {
        if (err) {
            console.error('Error selecting member money:', err);
            return res.status(500).send('เกิดข้อผิดพลาดในการค้นหายอดเงินของสมาชิก');
        }

        if (memberResults.length > 0) {
            const currentMoney = memberResults[0].money;
            
            // ถ้าเงินมี >= 100 ค่อยถอนได้
            if (currentMoney >= 100 && amount <= currentMoney) {
                // หักเงินออก
                const updatedMoney = currentMoney - amount;
                
                // อัปเดทยอดเงินของสมาชิก
                const sqlUpdate = "UPDATE members SET money = ? WHERE member_id = ?";
                db.query(sqlUpdate, [updatedMoney, member_id], (err, updateResults) => {
                    if (err) {
                        console.error('Error updating member money:', err);
                        return res.status(500).send('เกิดข้อผิดพลาดในการอัปเดทยอดเงินของสมาชิก');
                    }
                    res.json({ message: 'ยอดเงินถูกอัปเดตเรียบร้อยแล้ว', updatedMoney });
                });
            } else {
                res.status(400).send('จำนวนเงินที่ถอนต้องมากกว่าหรือเท่ากับ 100 และน้อยกว่าหรือเท่ากับยอดเงินที่มี');
            }
        } else {
            res.status(404).send('ไม่พบสมาชิกที่ระบุ');
        }
    });
});


const round = 1;
//สุ่มรางวัลจากทั้งหมด
// app.post('/award_lotto_all', (req, res) => {
//     //const { prize_order, price } = req.body;
//     const sqlCountRows = "COUNT(*) FROM reward";
//     db.query(sqlCountRows, (err, resultsRow) => {
//         if (err) {
//             console.error('Error fetching data:', err);
//             res.status(500).send('An error occurred while fetching data.');
//         } else {
//             if (resultsRow.length > 0) {
//                 res.json(results[0]); // ส่งค่า lotto_id ที่สุ่มได้
//             } else {
//                 const sql = `
//                 SELECT * 
//                 FROM lotto 
//                 WHERE lotto_id NOT IN (SELECT lotto_id FROM reward)
//                 ORDER BY RAND() 
//                 LIMIT 1`; // สุ่ม 1 ค่า
//             db.query(sql, (err, results) => {
//                 if (err) {
//                     console.error('Error fetching data:', err);
//                     res.status(500).send('An error occurred while fetching data.');
//                 } else {
//                     if (results.length > 0) {
//                         res.json(results[0]); // ส่งค่า lotto_id ที่สุ่มได้
//                     } else {
//                         res.status(404).send('No eligible lotto_id found.');
//                     }
//                 }
//             });
//             }
//         }
//     });

// });



app.post('/award_lotto_all', (req, res) => {
    const sqlCountRows = "SELECT COUNT(*) as rowCount FROM reward";
    db.query(sqlCountRows, (err, resultsRow) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).send('An error occurred while fetching data1.');
        } else {
            // ตรวจสอบผลลัพธ์ที่ได้จากการนับแถว
            const rowCount = resultsRow[0].rowCount;
            if (rowCount > 0) {
                res.json({ message: `There are ${rowCount} rewards in the database.` });
            } else {
                const sql = "SELECT * FROM lotto WHERE lotto_id NOT IN (SELECT lotto_id FROM reward)ORDER BY RAND()LIMIT 1"; // สุ่ม 1 ค่า
                db.query(sql, (err, results) => {
                    if (err) {
                        console.error('Error fetching data:', err);
                        res.status(500).send('An error occurred while fetching data2.');
                    } else {
                        if (results.length > 0) {
                            res.json(results[0]); // ส่งค่า lotto_id ที่สุ่มได้
                        } else {
                            res.status(404).send('No eligible lotto_id found.');
                        }
                    }
                });
            }
        }
    });
});






module.exports = app;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
