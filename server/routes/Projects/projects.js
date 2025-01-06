const express = require('express');
const router = express.Router();

const db = require('.../config/db')

// Route for creating a new Project
router.post('/', authenticateToken, async(req,res)=>{

})

module.exports = router