import axios from 'axios'

 const api_url = 'http://localhost:4000/api/tasks'

// const api_url = 'https://in.fusiongrid.dev:4000/api/tasks';

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

const createTask = async(task)=>{
  try {
    const response = await fetch(api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to create task:', error);
    throw error
  }
  
}

const getUserTask = async()=>{
  const token = localStorage.getItem('token')

  const response = await axios.get(`${api_url}/user`,{
    headers: { Authorization: `Bearer ${token}` }
  })

  return response.data.map((task)=>({...task, can_edit: task.can_edit || false}))
}

const getAssignedUsers = async()=>{
  const res = await axios.get(`${api_url}/assignees`,{
    headers:{
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
  // console.log('Comment', JSON.stringify(newNote));
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

const createNoteReply = async (noteId, replyContent)=>{
  try {
    const res = await fetch(`${api_url}/${noteId}/reply`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({noteId, replyContent})
    })
    if(!res){
      throw new Error('Failed to create note reply')
    }

    return res.json();
  } catch (error) {
    console.log('Failed to create note reply')
    throw error;
  }
}

const markNoteAsCompleted = async (noteId, completed) => {
  console.log('Marking note as completed:', noteId, completed);
  try {
    const res = await fetch(`${api_url}/complete/${noteId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({completed})
    });
    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(errorDetails.error || 'Failed to mark note as completed');
    }
    return await res.json();
  } catch (error) {
    console.error('Error marking note as completed:', error);
    throw error;
  }
};

const repliedNotes = async(noteId)=>{
  try {
    const res = await fetch(`${api_url}/${noteId}/notesReply`,{
      method: 'GET',
      headers:{
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if(!res.ok){
      throw new Error('Failed to fetch notes')
    }
    return await res.json();
  } catch (error) {
    console.error('Failed to get note replied:', error.message);
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
    return await res.json();
  } catch (error) {
    console.error('Failed to get the notes:', error.message);
    throw error;
  }
}

const getCompletedNotes = async(taskId)=>{
  try {
    // console.log('Fetching completed notes for taskId:', taskId);
    const response = await fetch(`${api_url}/completed/${taskId}`,{
      method: 'GET',
      headers:{
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if(!response.ok){
      throw new Error('Failed to fetch notes')
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to get the notes:', error.message);
    throw error;
  }
}

const deleteNote = async(noteId)=>{

  console.log("note id is",noteId)
  try {
    const res = await fetch(`${api_url}/delete/${noteId}`,{
      method: 'DELETE',
      headers:{
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if(!res.ok){
      throw new Error(`Failed to delete note: ${res.statusText}`)
    }
    return await res.json();
  } catch (error) {
    console.error('Failed to delete note:', error.message)
    throw error; 
  }
}

const deleteNoteReply = async(replyId)=>{
  try {
    const res = await fetch(`${api_url}/deleteReply/${replyId}`,{
      method: 'DELETE',
      headers:{
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if(!res.ok){
      throw new Error(`Failed to delete note: ${res.statusText}`)
    }
    return await res.json();
  } catch (error) {
    console.error('Failed to delete note:', error.message)
    throw error; 
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
  getAssignedUsers,
  createNoteReply,
  markNoteAsCompleted,
  repliedNotes,
  getCompletedNotes,
  deleteNoteReply,
}

export default taskService