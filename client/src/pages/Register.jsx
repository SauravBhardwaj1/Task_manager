import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import authService from '../services/authService'
import { motion } from 'framer-motion';
import '../styles/Auth.css'

const Register = () => {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const navigate = useNavigate();

  const handleSubmit = async (e)=>{
    e.preventDefault()
    try {
      await authService.register(username, password)
      alert("Registered successful");
      navigate('/login')
    } catch (error) {
      console.log(error.message)
      alert('Register failed: ' + error)
    }
  }
  return (
    <motion.div className='auth-container'
      initial={{ opacity:0, y: -50}}
      animate={{ opacity:1, y: 0}}
      exit={{ opacity:0, y: 50 }}
    >
      <form onSubmit={handleSubmit} className='auth-form'>
        <h2>Register</h2>
        <input type="text" placeholder='Username' value={username} onChange={(e)=> setUsername(e.target.value)} required />
        <input type="password" placeholder='Password' value={password} onChange={(e)=> setPassword(e.target.value)} required />
        <button type='submit'>Register</button>
      </form>
    </motion.div>
  )
}

export default Register;