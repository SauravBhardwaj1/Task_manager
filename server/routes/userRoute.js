require('dotenv').config();
const express = require('express')
const { createUser, findUserByUsername, updatePassword } = require('../models/userModel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const router = express.Router()
const mysql = require('mysql2/promise');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/Auth');

router.post('/register', async(req,res)=>{
    const {username, password} = req.body
    try {
        await createUser(username, password)
        res.status(201).json({message: 'User created successfully'})
    } catch (error) {
        console.error("Failed to create user",error.message)
    }
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await findUserByUsername(username);
      if (!user) return res.status(400).send('Cannot find user');
  
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(403).send('Invalid credentials');
  
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log("token: " + token);
      res.json({ token, user });
    } catch (err) {
      console.error('Server error during login:', err);
        res.status(500).send('Server error');
    }
  });

router.get('/me', authenticateToken, async(req,res)=>{
    const userId = req.user.id
    try {
        const [userId] = await db.execute('SELECT id, username FROM users WHERE user_id = ' , [userId])
        if(user.length ===0){
            return res.status(404).json({message: 'User not found'})
        }

        res.status(200).json(user[0])
    } catch (error) {
        console.error("",error.message)
        throw new Error(error.message)
    }
})

router.get('/all-users',authenticateToken, async(req,res)=>{
    try {
        const [user] = await db.execute('SELECT id, username FROM users')
        res.status(200).json(user)
    } catch (error) {
        console.log("Failed to fetch all users", error.message)
        res.status(500).json({ error: 'Failed to fetch users' });
    }
})

module.exports = router