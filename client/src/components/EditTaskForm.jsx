import React, { useEffect, useState } from "react";
import authService from "../services/authService";
import {motion} from 'framer-motion'
import '../styles/EditTaskForm.css'

const EditTaskForm = ({ task, onSave, onClose, user }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [assignedTo, setAssignedTo] = useState([]);
  const [users, setUsers] = useState([]);
  const [editPermissions, setEditPermissions] = useState([]);

  useEffect(() => { 
    fetchUsers(); 
   
    const assignedUserIds = task.assignedTo || 
    (task.assigned_to_user_ids ? [...new Set(task.assigned_to_user_ids.split(',').map(Number))] : []);

    setAssignedTo(assignedUserIds);
    console.log("AssignedTo state updated:", assignedUserIds);
    setEditPermissions(task.editPermissions?.length ? task.editPermissions : [user.id])
  }, [task]);

  const fetchUsers = async () => {
  try {
    const users = await authService.getAllUsers();
    setUsers(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedTask = {
      id: task.id,
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      assignedTo: [...new Set(assignedTo)],
      editPermissions: [...new Set(editPermissions)]
    };

    // console.log("updatedTask", updatedTask);
    onSave(updatedTask)
  };

  // const handleAssignedToChanged = (e)=>{
  //   const options = e.target.options;
  //   const selectedValues = []

  //   for(const option of options){
  //     if(option.selected){
  //       selectedValues.push(option.value)
  //     }
  //   }
  //   setAssignedTo(selectedValues);
  // } 

  // const handlePermissionChange = (userId)=>{
  //   setEditPermissions(prev => prev.includes(userId) ? prev.filter(id => id!== userId): [...prev, userId])
  // }

  const toggleUserSelection = (userId, setter, state) => {
    const updateState = [...new Set(state.includes(userId) ? 
      state.filter((id)=> id !== userId) : [...state, userId])]

      setter(updateState)
    // setter(state.includes(userId) ? state.filter((id) => id !== userId) : [...state, userId]);
  };

  return (
    <motion.div
      className="edit-task-form"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
    >
    <h2 style={{color:'#ff9900'}}>Edit Task</h2>
    <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            
          ></textarea>
        </div>
        <div className="form-group">
          <label>Priority</label>
          <select
            value={priority || ""}
            onChange={(e) => setPriority(e.target.value)}
            
          >
            <option value="">Select Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="form-group">
          <label>Due Date</label>
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            
          />
        </div>
        <div className="form-group">
          <label>Assign Users:</label>
          <div className="assign-container"> 
          {users.map((user) => (
              <div key={user.id} className="assign-item">
                <label>
                  <input 
                    type="checkbox"
                    value={user.id}
                    checked={assignedTo.includes(user.id)}
                    onChange={()=> toggleUserSelection(user.id, setAssignedTo, assignedTo)}
                    // onChange={()=>handleAssignedToChanged(user.id)}
                   />
                   {user.username}
                </label>             
              </div>
            ))}
          </div>
        </div>
        <div className="form-group">
            <label>Edit Permissions</label>
            <div className="permissions-container">
              {users.map((user)=>(
                <div key={user.id} className="permission-item">
                  <label>
                    <input 
                      type="checkbox" 
                      value={user.id} 
                      checked={editPermissions.includes(user.id)} 
                      onChange={()=> toggleUserSelection(user.id, setEditPermissions, editPermissions)}
                      // onChange={()=> handlePermissionChange(user.id)}
                    />
                    {user.username}
                  </label>
                </div>
              ))}
            </div>
           
        </div>
        <div className="form-actions">
          <button type="submit">Submit Edit Task</button>
          <button type="close-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
  </motion.div>
  );
};

export default EditTaskForm;
