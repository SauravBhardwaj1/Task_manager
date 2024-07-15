import React, { useEffect, useState } from "react";
import authService from "../services/authService";
import {motion} from 'framer-motion'
import '../styles/EditTaskForm.css'

const EditTaskForm = ({ task, onSave, onClose, user }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo || []);
  const [users, setUsers] = useState([]);
  const [editPermissions, setEditPermissions] = useState(task.editPermissions || []);

  useEffect(() => {  
    fetchUsers();
  }, []);

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
      id:task.id,
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      assignedTo,
      editPermissions
    };

    onSave(updatedTask)
  };

  const handleAssignedToChanged = (e)=>{
    const options = e.target.options;
    const selectedValues = []

    for(const option of options){
      if(option.selected){
        selectedValues.push(option.value)
      }
    }
    setAssignedTo(selectedValues);
  } 

  const handlePermissionChanged = (userId)=>{
    setEditPermissions(prev => prev.includes(userId) ? prev.filter(id => id!== userId): [...prev, userId])
  }

  return (
    <motion.div
      className="edit-task-form"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
    >
    <h2>Edit Task</h2>
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
      </div>
      <div className="form-group">
        <label>Priority</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} required>
          <option value="">Select Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="form-group">
        <label>Due Date</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Assign To</label>
        <select multiple={true} value={assignedTo} onChange={handleAssignedToChanged}>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Edit Permissions</label>
        {users.map(user=>(
          <div key={user.id}>
            <label>
              <input 
                type="checkbox"
                value={user.id}
                checked={editPermissions.includes(user.id)}
                onChange={()=>handlePermissionChanged(user.id)} 
              />
              {user.username}
            </label>
          </div>
        ))}
      </div>
      <button type="submit">Save Changes</button>
      <button type="button" onClose={onClose}>Cancel</button>
    </form>
  </motion.div>
  );
};

export default EditTaskForm;
