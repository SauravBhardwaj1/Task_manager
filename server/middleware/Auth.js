const jwt = require('jsonwebtoken');
require('dotenv').config

const authenticateToken = async(req,res,next)=>{
    const authHeader = req.header['authorization'];
    const token = authHeader && authHeader.split(' ')[1]
     
    if(token == null) return res.sendStatus(401)

    jwt.verify( token, process.env.JWT_SECRET, (err, user)=>{
        if(err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

module.exports = authenticateToken;