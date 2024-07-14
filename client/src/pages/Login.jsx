import React, { useState } from 'react'
import authService from '../services/authService'
import { useNavigate } from 'react-router-dom'
import {motion} from 'framer-motion'
import '../styles/Auth.css'

const Login = ({setUser}) => {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async(e)=>{
    e.preventDefault()
    try {
      const loginRes = await authService.login(username, password)
      const token = loginRes.token
      const currentUser = await authService.getCurrentUser(token)
      setUser(currentUser)
      alert('Login successfull')
      navigate("/")
    } catch (error) {
      console.log("Failed to login", error.message)
      alert('Invalid credentials')
    }
  }

  return (
    <div className='auth'>
      <motion.div
        className='auth-container'
        initial={{opacity: 0, y:-50}}
        animate={{opacity:1, y: 0}}
        exit={{opacity:0, y:50}}>
              
          <form onSubmit={handleSubmit} className='auth-form' >
            <h2>Login</h2>
            <input type="text" placeholder='Enter username' value={username} onChange={(e)=> setUsername(e.target.value)} required/>
            <input type={showPassword ? 'text' : 'password'} placeholder='Enter password' value={password} onChange={(e)=> setPassword(e.target.value)} required />
            <p class='btn btn-outline-secondary' type="button" onClick={()=>setShowPassword(!showPassword)}> <i class='fa fa-eye'></i> </p>

            <button type='submit'>Login</button>
          </form>
      </motion.div>
    </div>
  )
}

export default Login