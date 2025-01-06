const config = require('./config');
const mysql = require('mysql2/promise');

// const connection = mysql.createConnection({
//     host: config.db.host,
//     user: config.db.user,
//     password: config.db.password,
//     database: config.db.database,
//   });

const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});



  module.exports = pool;