const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const config = require('../config/config');
const db = mysql.createPool(config.db);
require('dotenv').config();

const createUser = async (username, password, role = 'user') => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db.execute(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
    [username, hashedPassword, role]
  );
  return result;
};

const findUserByUsername = async (username) => {
  const [rows] = await db.execute(
    'SELECT * FROM users WHERE username = ?', 
    [username]
  );
  console.log("rows",rows[0])
  return rows[0];
};

const findUserById = async (id) => {
  const [rows] = await db.execute(
    'SELECT * FROM users WHERE id = ?', 
    [id]
  );
  return rows[0];
};

const updatePassword = async (id, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const [result] = await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
  return result;
};


module.exports = {
  createUser,
  findUserByUsername,
  findUserById,
  updatePassword,
};
