import React from 'react'
import '../styles/Sidebar.css'

const Sidebar = ({ user }) => {

    const username = user? user.username : 'Guest';

  return (
    <div className='sidebar'>
      
        <h2>Welcome, {username}</h2>
        <p>This is task management 📝application. You can manage your tasks efficiently and track your progess.</p>
        
        <ul>
           <li>👉Create task</li>
           <li>👉Assign task</li>
           <li>👉Track task progress</li>
           <li>👉Edit and update tasks</li>
           <li>👉View task history</li>
        </ul>
    </div>
  )
}

export default Sidebar