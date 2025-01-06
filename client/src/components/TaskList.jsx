import React, { useCallback, useEffect, useRef, useState } from 'react'
import {motion} from 'framer-motion'
import '../styles/TaskList.css'
import authService from '../services/authService'
import Notes from './Notes'
import taskService from '../services/taskService'

const TaskList = ({ tasks, onEditClick, onDeleteClick,onStatusChange, currentUser,showAssignedTo=false, showAssignedBy=false }) => {

  const [usernames, setUsernames] = useState({})
  const [expandedTaskId, setExpandedTaskId] = useState(null)
  const [repliedNoteNotification, setRepliedNoteNotification] = useState(()=>{
    const savedNotifications = localStorage.getItem('repliedNoteNotification');
    return savedNotifications ? JSON.parse(savedNotifications) : {};
  })

  const isOverdue = (dueDate, status)=>{
    const currentDate = new Date();
    return dueDate && new Date(dueDate) < currentDate && status !== 'Completed'
  }

  const toggleExpand = useCallback((taskId)=>{
    setExpandedTaskId((prevId)=> prevId === taskId ? null : taskId) 
  },[])

  const handleRepliedNotifications = useCallback((noteId, hasNewReplies)=>{
    setRepliedNoteNotification((prev)=>{
      const updatedNotifications = {...prev}
      
      if(hasNewReplies){
        updatedNotifications[noteId] = true;
      }else{
        delete updatedNotifications[noteId];
      }

      localStorage.setItem('repliedNoteNotification', JSON.stringify(updatedNotifications));
      return updatedNotifications
    })
  }, [])

  const deduplicateTasks = (tasks) => {
    const taskMap = new Map();
    tasks.forEach((task) => taskMap.set(task.id, task));
    return Array.from(taskMap.values());
  };
  

  useEffect(()=>{ 
    const fetchUsernames = async()=>{
      try {
        const users = await authService.getAllUsers()
        const usernameMap = users.reduce((acc, user) => {
          acc[user.id] = user.username;
          return acc;
        }, {});
        setUsernames(usernameMap)
      } catch (error) {
        console.log("Failed to fetch usernames", error)        
      }
    }
    fetchUsernames();
  },[])

  const sortedTasks = deduplicateTasks([...tasks]).sort(
    (a, b) => new Date(b.created_at || b.updated_at) - new Date(a.created_at || a.updated_at)
  );

  // console.log("Sorted tasks:", sortedTasks);
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
        sortedTasks?.map((task)=>{
          const assignedToUsers = task.assigned_to_usernames || "Not Assigned";
          const overdue = isOverdue(task.due_date, task.status)

          return (
            <React.Fragment key={task.id}>
              <li  
                className={`task-item ${task.priority} ${task.status.replace(/\s+/g, '')}
                  
                ${expandedTaskId === task.id ? 'expanded' : ''}`} 
                style={{
                  backgroundColor: 'grey',
                  padding: '10px',
                  borderRadius: '10px',
                  width: '100%',
                  marginBottom: '20px',
                  cursor:'pointer',
                  boxShadow: 'rgb(38, 57, 77) 0px 20px 30px -10px',
                  transition: 'transform 0.5s ease, max-height 0.3s ease',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent:'space-between', 
                }}
                onClick={()=> toggleExpand(task.id)}
                >
                  <div className="task-info">
                    
                    <div className="task-meta-info">
                      {showAssignedTo && <span className="task-assigned-to">Assigned To: {assignedToUsers}</span>}
                      {showAssignedBy && <span className="task-assigned-by">Assigned By: {usernames[task.assigned_by]}</span>}
                      <span style={{backgroundColor: overdue? 'red' : '#f5a42a'}} className="task-due-date">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"} {overdue && <span> - Due date is over</span>}</span>
                      <span className={`task-priority ${task.priority}`}>Priority: {task.priority}</span>
                      <span className="task-status">
                         Status: {""}
                         <select value={task.status} onChange={(e) => onStatusChange(task.id, e.target.value)}>
                           <option value="Pending">Pending</option>
                           <option value="In Progress">In-Progress</option>
                           <option value="Completed">Completed</option>
                         </select>
                       </span>
                       <div className="task-actions">
                       {task.can_edit === 1 && <button onClick={() => onEditClick(task)}>Edit</button>}
                       {currentUser && (task.created_by === currentUser.id || task.can_edit) && (
                         <button onClick={() => onDeleteClick(task.id)}>Delete</button>
                       )}
                     </div>
                    </div>
                    <h4>Title: {task.title}</h4>
                    {task.description.length ? (
                      <p>Task-{task.description}</p>
                    ): null}                 
                    {expandedTaskId === task.id &&(
                     <div className="task-details" onClick={(e)=>e.stopPropagation()}>
                     {/* <div className="task-meta">
                       
                       <span className="task-status">
                         Status:
                         <select value={task.status} onChange={(e) => onStatusChange(task.id, e.target.value)}>
                           <option value="Pending">Pending</option>
                           <option value="In Progress">In-Progress</option>
                           <option value="Completed">Completed</option>
                         </select>
                       </span>
                       <div className="task-actions">
                       {task.can_edit === 1 && <button onClick={() => onEditClick(task)}>Edit</button>}
                       {currentUser && (task.created_by === currentUser.id || task.can_edit) && (
                         <button onClick={() => onDeleteClick(task.id)}>Delete</button>
                       )}
                     </div>
                     </div> */}
                     {task.edited_by && (
                       <p className="edit-info">Edited by {usernames[task.edited_by]} on {new Date(task.edited_at).toLocaleString()}</p>
                     )}
                     
                     
                     <Notes key={`notes-${task.id}`} taskId={task.id} currentUser={currentUser} repliedNoteNotification={repliedNoteNotification} onRepliedNoteNotification={handleRepliedNotifications}/>
                   </div>

                 )}
               </div>
                    
                </li>
                </React.Fragment>
          )
          
        })
      }

    </motion.div>
  )
}

export default TaskList