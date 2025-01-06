require('dotenv').config();
const express = require('express')
const { createUser, findUserByUsername, updatePassword } = require('../models/userModel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router()
const mysql = require('mysql2/promise');
const db = require('../config/db')


router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    try {
      await createUser(username, password, role);
      res.status(201).send('User registered');
    } catch (err) {
      res.status(400).send('Error registering user');
    }
  });
  
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await findUserByUsername(username);
      if (!user) return res.status(400).send('Cannot find user');
  
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(403).send('Invalid credentials');
  
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
      console.log("token: " + token);
      res.json({ token, user });
    } catch (err) {
      console.error('Server error during login:', err);
        res.status(500).send('Server error');
    }
  });

router.post('/reset-password', authenticateToken, async (req, res) => {
    const { newPassword } = req.body;
    const userId = req.user.id;
    try {
        await updatePassword(userId, newPassword);
        res.send('Password updated');
    } catch (err) {
        res.status(400).send('Error updating password');
    }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
      const userId = req.user.id;
      const [user] = await db.execute('SELECT id, username FROM users WHERE id = ?', [userId]);

      if (user.length === 0) {
          return res.status(404).json({ message: 'User not found' });
      }
      console.log("userCurrent", user[0])
      res.status(200).json(user[0]);
  } catch (error) {
      console.error('Failed to fetch user details:', error);
      res.status(500).json({ message: 'Failed to fetch user details' });
  }
});

router.get('/all-users', authenticateToken, async(req,res)=>{
  try {
    const [users] = await db.execute('SELECT id, username FROM users');
    res.status(200).json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


module.exports = router