import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { motion } from "framer-motion";
import "../styles/Auth.css";

const Login = ({setUser}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false)


  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loginResponse = await authService.login(username, password);
      const token = loginResponse.token;
      const currentUser = await authService.getCurrentUser(token);
      setUser(currentUser);
      alert("Login successful");
      navigate("/");
    } catch (error) {
      alert("Invalid Credentials");
    }
  };
  return (
    <div className="auth">
    <motion.div
      className="auth-container"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login</h2>
          <input
            type="text"
            value={username}
            placeholder="Enter username"
            onChange={(e) => setUsername(e.target.value)}
            required
          />      
      
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
           
            <p class="btn btn-outline-secondary" type="button" onClick={()=> setShowPassword(!showPassword)}> <i class="fa fa-eye"></i></p>
        
        
        <button type="submit">Login</button>
      </form>
    </motion.div>
    </div>
  );
};

export default Login;
