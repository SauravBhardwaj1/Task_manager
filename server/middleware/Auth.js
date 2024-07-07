const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');
require('dotenv').config

const authenticateToken = async(req,res,next)=>{
    const authHeader = req.header['authorization'];
    const token = authHeader && authHeader.split(' ')[1]
     
    if(token == null) return res.sendStatus(401)

    jwt.verify( token, jwtSecret, (err, user)=>{
        if (err) {
            console.error('JWT verification error:', err);
            return res.status(403).json({ error: 'Invalid token' });
          }
          req.user = user;
          next();
    })
}

module.exports = {authenticateToken};