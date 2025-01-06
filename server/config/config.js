require('dotenv').config();

module.exports = {
    db: {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'taskManagement',
    },
    jwtSecret: process.env.JWT_SECRET, 
  };
  