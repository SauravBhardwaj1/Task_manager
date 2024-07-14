const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const config = require('../config/config');
const db = mysql.createPool(config.db);
require('dotenv').config();

const createUser = async (username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
  return result;
};

const findUserByUsername = async (username) => {
  const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0];
};

const findUserById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

module.exports = {
  createUser,
  findUserByUsername,
  findUserById,
};
