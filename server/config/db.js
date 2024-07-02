const mysql = require('mysql2');


const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'task_management'
})

module.exports = pool.promise();