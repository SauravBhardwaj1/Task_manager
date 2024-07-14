
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import './styles/App.css';
import DashBoard from './pages/DashBoard';
import { useEffect, useState } from 'react';
import authService from './services/authService';
import Navbar from './components/Navbar';
import {AnimatePresence} from 'framer-motion'
import Login from './pages/Login';
import PrivateRoute from './HOF/PrivateRoute';
import GuestDashboard from './components/GuestDashboard';
import Register from './pages/Register';

function App() {

  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    const fetchUser = async()=>{
      const token = localStorage.getItem('token')

      if(token){
        try {
          const res = await authService.getCurrentUser()
          setUser(res)
        } catch (error) {
          console.log('Failed to fetch user: ' + error)
        }
      }
    }  

    fetchUser()
  },[user])

  useEffect(()=>{
    if(user){
      navigate('/dashboard')
    }
  },[user, navigate])

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <div className="App">
      <Navbar user={user} onLogout={handleLogout} />
      <AnimatePresence mode='wait'>
        <Routes>
          <Route  path='/login' element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
          <Route path='/dashboard' element={<PrivateRoute user={user} />}>
            <Route path='' element={<DashBoard user={user} />} />
          </Route>
          <Route path="/" Component={GuestDashboard} />
          <Route path="/register" element={<Register onRegister={setUser} />} /> 
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
