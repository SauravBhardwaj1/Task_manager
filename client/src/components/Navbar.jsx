import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = ({user, onLogout}) => {

  const navigate = useNavigate()

  const handleLogout = ()=>{
    localStorage.removeItem('token')
    onLogout()
    navigate('/login')
  }

  return (
    <nav className='navbar'>
      <Link to="/" className="navbar-brand">Task Manager</Link>
      <div classname='navbar-menu'>
       {
        user? (
          <>
            <span className='navbar-user'>😊 Welcome, {user.username}</span>
            <button className='navbar-logout' onClick={handleLogout}>Logout</button>
          </>
        ):(
          <>
          <Link to='/login' className="navbar-login">Login</Link>
          <Link to='/register' className="navbar-login">Register</Link>
          </>
          
        )
       }
      </div>
    </nav>
  )
}

export default Navbar