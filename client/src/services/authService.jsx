const axios = require('axios')

const api_url = 'http://localhost:8000/api/users'

const register = async(username, password)=>{
    const res = await axios.post(`${api_url}/register`, {username, password})

    return res.data
}

const login = async(username, password)=>{
    const res = await axios.post(`${api_url}/login`, {username, password})

    if(res.data.token){
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('taskUser', JSON.stringify(res.data))
    }

    return res.data
}

const getCurrentUser = async(token)=>{
    const res = await axios.get(`${api_url}/me`,{
        headers:{ Authorization: `Bearer ${token}`}
    })

    return res.data
}

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

const  authService = {
    register,
    login,
    logout: () => localStorage.removeItem('token'),  // Logout function to remove token from local storage.
    getCurrentUser,
    getAllUsers
}

export default authService;