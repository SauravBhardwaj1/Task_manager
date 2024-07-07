const express = require('express')
require('dotenv').config()
const app = express()
const cors = require('cors')
const mysql = require('mysql2')
const PORT = process.env.PORT || 5000
const bodyParser = require('body-parser')
const config = require('./config/config')
const userRoutes = require('./routes/userRoute')
const taskRoutes = require('./routes/taskRoute')

app.use(cors())
app.use(express.json())
app.use(bodyParser.json())

const db = mysql.createConnection(config.db)


db.connect((err)=>{
    if(err){
        console.error('Database connection failes',err.message)
        return
    }

    require('./config/db')
})
app.get('/', function(req,res){
    res.send('Welcome to the Task Manager application')
})

app.use('/api/tasks', taskRoutes)
app.use('/api/users', userRoutes)

app.listen(PORT, (req,res)=>{
    console.log(`Server is running on port ${PORT}`)
})