require('dotenv').config();
const express= require('express')
const cors = require('cors')
const mysql = require('mysql2');
const config = require('./config/config');
const app = express()
const userRoutes = require('./routes/userRoute')
const taskRoutes = require('./routes/TaskRoute');
const bodyParser = require('body-parser');


const PORT =  process.env.PORT || 5000
app.use(cors())
app.use(express.json());
app.use(bodyParser.json());

const db = mysql.createConnection(config.db);

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
//   console.log('Connected to the database.');
  // Run the initialization script
  require('./config/db');
});


app.get('/', (req,res)=>{
    res.send("Welcome to the Task management application")
})


// Use routes
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, (req, res)=>{
    console.log(`Server is running on port ${PORT}`)
})

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});