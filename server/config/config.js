require('dotenv').config();

module.exports = {
    db:{
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'task_management',
      },
      jwtSecret: process.env.JWT_SECRET, 
}