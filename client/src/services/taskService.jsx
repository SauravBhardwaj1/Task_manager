const axios = require('axios')

const api_url = 'http://localhost:5000/api/tasks'

// Function to create all tasks
const createTask = async (task)=>{
    try {
        const res = await fetch(api_url,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.get('token')}`
            },
            body: JSON.stringify(task)
        })
        if(!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

        return await res.json()
       
    } catch (error) {
        console.log('Failed to create task')
    }
}

const getAllTask = async()=>{
    const token = localStorage.getItem('token');
    const response = await axios.get(api_url,{
      headers: { Authorization: `Bearer ${token}` },
    })
  
    return response.data
}

const getTaskById = async(id)=>{
    const token = localStorage.getItem('token');
    const response = await axios.get(`${api_url}/${id}`,{
      headers: { Authorization: `Bearer ${token}` }
    })
  
    return response.data
}

const getUserTask = async()=>{
    const token = localStorage.getItem('token')
  
    const response = await axios.get(`${api_url}/user`,{
      headers: { Authorization: `Bearer ${token}` }
    })
  
    return response.data.map((task)=>({...task, can_edit: task.can_edit || false}))
  }
  
  const getAssignedUsers = async(taskId)=>{
    const res = await axios.get(`${api_url}/${taskId}/assignees`,{
      headers:{
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if(!res.ok){
      throw new Error('Failed to get assigned users')
    }
    return res.json()
  }
  
  const getAssignedTask = async()=>{
    const token = localStorage.getItem('token')
  
    const response = await axios.get(`${api_url}/assigned`,{
      headers: { Authorization: `Bearer ${token}` }
    })
  
    return response.data.map(task => ({ ...task, can_edit: task.can_edit || false }))
  }
  
  const updateTask = async (taskId, updates) => {
  
    console.log("updateTask", updates)
    try {
      const response = await fetch(`${api_url}/${taskId}/permission`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      const result = await response.json();
      console.log('Task updated successfully:', result);
      // return result;
      
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
    
  };
  
  
  const getTaskhistory = async(taskId)=>{
    const token = localStorage.getItem('token');
  
    const response = await axios.get(`${api_url}/${taskId}/history`, {
      header: { Authorization: `Bearer ${token}` },
    })
  
    return response.data
  } 
  
  const deleteTask = async(taskId)=>{
    try {
      const response = await fetch(`${api_url}/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      return await response.text()
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error; 
    }
    
  }
  
  const updateTaskStatus = async (taskId, status) => {
    try {
      const response = await fetch(`${api_url}/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
      return await response.text();
    } catch (error) {
      console.error('Failed to update task status:', error);
      throw error;
    }
    
  };
  
  const createNote = async(taskId, newNote)=>{
    console.log('Comment', JSON.stringify(newNote));
    try {
      const res = await fetch(`${api_url}/${taskId}/create`, {
        method: 'POST',
        headers:{
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({newNote})
      })
      if(!res.ok){
        throw new Error('Failed to create note')
      }
  
      return res.json();
    } catch (error) {
      console.log('Failed to update note:', error);
      throw error; 
    }
  }
  
  const getNotes = async(taskId)=>{
    try {
     const res= await fetch(`${api_url}/${taskId}/notes`,{
        method: 'GET',
        headers:{
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if(!res.ok){
        throw new Error('Failed to fetch notes')
      }
      return res.json();
    } catch (error) {
      console.error('Failed to update task status:', error);
      throw error;
    }
  }
  
  const deleteNote = async(taskId)=>{
    try {
      const res = await fetch(`${api_url}/${taskId}`,{
        method: 'DELETE',
        headers:{
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if(!res.ok){
        throw new Error('Failed to delete task')
      }
      return res.json();
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }
  
  const taskService = {
    getAllTask,
    getTaskById,
    createTask,
    updateTask,
    getUserTask,
    getAssignedTask,
    getTaskhistory,
    deleteTask,
    updateTaskStatus,
    createNote,
    getNotes,
    deleteNote,
    getAssignedUsers
  }
  
  export default taskService