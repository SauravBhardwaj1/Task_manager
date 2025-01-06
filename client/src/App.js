import './styles/App.css';
import Navbar from './components/Navbar';
import {Navigate, Route, Routes, useNavigate} from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import {AnimatePresence} from 'framer-motion'
import Register from './pages/Register';
import Login from './pages/Login';
import { useEffect, useState } from 'react';
import authService from './services/authService';
import ProtectedRoute from './HOF/ProtectedRoute';
import GuestDashboard from './components/GuestDashboard';

function App() {

  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    const fetchUser = async()=>{
      const token = localStorage.getItem('token')
      if(token){
        try {
          const response = await authService.getCurrentUser(token)
          console.log("response", response)
          setUser(response)
        } catch (error) {
            console.error('Failed to fetch user:', error);
            // localStorage.removeItem('token');
        }
      }
      
    }
    fetchUser();
  },[])

  useEffect(() => {
    if (user) {
      navigate('/dashboard'); 
    }
  }, [user, navigate]);


  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    navigate('/');
  };
  return (
    <div className="App">
      <Navbar user={user} onLogout={handleLogout} />
      <AnimatePresence mode='wait'>
        <Routes>
          <Route path="/" Component={GuestDashboard } />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
            <Route path="/dashboard" element={<ProtectedRoute user={user} />}>
              <Route path="" element={<Dashboard user={user} />} />
            </Route>
            <Route path="/register" element={<Register onRegister={setUser} />} />
             
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
