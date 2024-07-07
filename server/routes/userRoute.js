const express = require('express')
const { createUser, findUserByUsername } = require('../models/userModel')
const { authenticateToken } = require('../middleware/Auth')

const router = express.Router()

router.post('/register', async(req,res)=>{
    const {username, password} = req.body
    try {
        await createUser(username, password)
        res.status(201).json({message: 'User created successfully'})
    } catch (error) {
        console.error("Failed to create user",error.message)
    }
})

router.post('/login', async(req,res)=>{
    const {username, password} = req.body
    try {
        const user = await findUserByUsername(username)
        if(!user) return res.status(401).json({message: 'Invalid username'})

        const validPassword = await bcrypt.compare(password, user.password)
        if(!validPassword) return res.status(401).json({message: 'Invalid password'})

        const token = jwt.sign({ id:user.id, role: user.role}, process.env.JWT_SECRET, { expiresIn: '1h'})
        console.log("token",token)
        res.status(200).json({token, user})
    } catch (error) {
        console.error('Failed to login', error.message)
    }
})

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