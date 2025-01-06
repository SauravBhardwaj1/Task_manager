const express = require('express');
const router = express.Router();

const db = require('.../config/db')

router.post('/', authenticateToken, async(req,res)=>{

})

module.exports = router