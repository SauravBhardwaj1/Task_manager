import axios from 'axios';

const api_url = 'http://localhost:5000/api/users';


const register = async(username, password)=>{
   const response = await axios.post(`${api_url}/register`, {username, password})

   return response.data
}


const login = async(username, password)=>{
  const response = await axios.post(`${api_url}/login`, {username, password})

  if(response.data.token){
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('taskUser', JSON.stringify(response.data) )
  }

  return response.data
}

const getCurrentUser = async (token) => {
  const response = await axios.get(`${api_url}/me`, {
      headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getAllUsers = async()=>{
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${api_url}/all-users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

const logout = async()=>{
  localStorage.removeItem('user')
}

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  getAllUsers
}

export default authService;