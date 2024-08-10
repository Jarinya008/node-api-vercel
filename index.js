const express = require('express')
const app = express()
const PORT = 4000

app.listen(PORT, () => {
    console.log('Hello World ${PORT}')
})

app.get('/',(req,res) => {
    res.send('this is my api running...')
})

app.get('/about',(req,res) => {
    res.send('this is my about route')
})

module.exports = app