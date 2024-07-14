import React, { useEffect, useState } from 'react'
import {motion} from 'framer-motion'
import '../styles/TaskList.css'
import authService from '../services/authService'
import Notes from './Notes'
import taskService from '../services/taskService'

const TaskList = ({ tasks, onEditClick, onDeleteClick,onStatusChange, currentUser,showAssignedTo=false, showAssignedBy=false }) => {

  const [usernames, setUsernames] = useState({})
  const [expandedTaskId, setExpandedTaskId] = useState(null)
  const [assignedUsers, setAssignedUsers] = useState({});
  console.log("asisi", assignedUsers)

  const toggleExpand = (taskId)=>{
    console.log("Toggling expand for taskId:", taskId);
    setExpandedTaskId(expandedTaskId ===taskId ? null : taskId) 
    fetchAssignedUsers(taskId)
  }

  useEffect(()=>{ 
    const fetchUsernames = async()=>{
      try {
        const users = await authService.getAllUsers()
        const usernameMap = {}
        users.forEach((user)=>{
          usernameMap[user.id] = user.username
        })
        setUsernames(usernameMap)
      } catch (error) {
        console.log("Failed to fetch usernames", error)        
      }
    }
    fetchUsernames();
  },[])

  const fetchAssignedUsers = async (taskId) => {
    try {
      const users = await taskService.getTaskAssignees(taskId);
      setAssignedUsers((prevState) => ({ ...prevState, [taskId]: users }));
    } catch (error) {
      console.log("Failed to fetch assigned users", error);
    }
  };

  // console.log("usernames", usernames)

  if (!Array.isArray(tasks)) {
    return <div>No tasks available</div>;
  }
// console.log("tasks", tasks);
  return (
    <motion.div className='task-list'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {
        tasks?.map((task)=>{
          const assignedToUsers = assignedUsers[task.id] || [];
          console.log('Rendering task with ID', assignedToUsers)
          return (
              <li 
                key={task.id} 
                className={`task-item ${task.priority} ${expandedTaskId === task.id ? 'expanded' : ''}`} 
                style={{
                  backgroundColor: 'grey',
                  padding: '10px',
                  borderRadius: '10px',
                  width: '100%',
                  marginBottom: '20px',
                  cursor:'pointer',
                  boxShadow: 'rgb(38, 57, 77) 0px 20px 30px -10px',
                  transition: 'transform 0.3s ease, max-height 0.5s ease',
                  overflow: 'hidden',
                  
                }}
                onClick={()=> toggleExpand(task.id)}
                >
                  <div className="task-info">
                    <h4>Title: {task.title}</h4>
                    <p>Task-{task.description}</p>
                    {expandedTaskId === task.id &&(
                     <div className="task-details" onClick={(e)=>e.stopPropagation()}>
                     <div className="task-meta">
                       <span className={`task-priority ${task.priority}`}>Priority: {task.priority}</span>
                       <span className="task-status">
                         Status:
                         <select value={task.status} onChange={(e) => onStatusChange(task.id, e.target.value)}>
                           <option value="Pending">Pending</option>
                           <option value="In Progress">In-Progress</option>
                           <option value="Completed">Completed</option>
                         </select>
                       </span>
                       <span className="task-due-date">Due: {new Date(task.due_date).toLocaleDateString()}</span>
                       {showAssignedTo && <span className="task-assigned-to">Assigned to: {assignedToUsers.map(user => usernames[user.user_id]).join(', ') || 'Not Assigned'}</span>}
                       {showAssignedBy && <span className="task-assigned-by">Assigned by: {usernames[task.assigned_by]}</span>}
                     </div>
                     {task.edited_by && (
                       <p className="edit-info">Edited by {usernames[task.edited_by]} on {new Date(task.edited_at).toLocaleString()}</p>
                     )}
                     
                     <div className="task-actions">
                       {task.can_edit === 1 && <button onClick={() => onEditClick(task)}>Edit</button>}
                       {currentUser && (task.created_by === currentUser.id || task.can_edit) && (
                         <button onClick={() => onDeleteClick(task.id)}>Delete</button>
                       )}
                     </div>
                     <Notes taskId={task.id} currentUser={currentUser} />
                   </div>

                 )}
               </div>
                    
                </li>
          )
          
        })
      }

    </motion.div>
  )
}

export default TaskList