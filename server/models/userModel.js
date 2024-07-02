const db = require('../config/db');

const loginUser = async(userId)=>{
    const result = await db.execute('SELECT * FROM users WHERE user_id = ?', [userId] )

    return result
}

const registerUser = async(username, password)=>{
   const result=  await db.execute('INSERT INTO users (username, password) VALUES(?, ?)', [username, password])

   return result
}

const getUserDetails = async(userId)=>{
    const [rows] = await db.execute('SELECT * FROM users WHERE user_id = ?',[userId])

    return rows[0]
}


module.exports = {
    loginUser,
    registerUser,
    getUserDetails,
 
}