import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "../styles/TaskForm.css";
import authService from "../services/authService";

const TaskForm = ({ onTaskCreated, onClose, user }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);
  const [editPermissions, setEditPermissions] = useState([user.id]);
  const [users, setUsers] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const users = await authService.getAllUsers();
      setUsers(users);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      // console.log("Form submitted with dueDate:", dueDate);
      const newTask = {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        assignedTo:[...new Set(assignedTo)],
        editPermissions:[...new Set([user.id, ...assignedTo])],
      };

      // console.log("Task being sent to backend:", newTask)
      onTaskCreated(newTask);
      onClose();

      setTitle("");
      setDescription("");
      setPriority("low");
      setDueDate("");
      setAssignedTo([]);
      setEditPermissions([]); 

      alert("Task created successfully!");
      setSuccessMessage("Task created successfully!");
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task");
    }
  };

  // const handleAssignedToChanged = (userId)=>{
  //   // const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value)
  //   setAssignedTo((prevAssignedTo) =>
  //     prevAssignedTo.includes(userId)
  //       ? prevAssignedTo.filter((id) => id !== userId)
  //       : [...prevAssignedTo, userId]
  //   );
  //   // console.log("assigned", selectedOptions)
  // }

  // const handlePermissionChange = (userId)=>{
  //   setEditPermissions(prev=> prev.includes(userId) ? prev.filter(id => id!== userId) : [...prev, userId]);
  // }
  const toggleUserSelection = (userId, setter, state) => {
    const updateState = [...new Set(state.includes(userId) ? 
      state.filter((id)=> id !== userId) : [...state, userId])]

      setter(updateState)
    // setter(state.includes(userId) ? state.filter((id) => id !== userId) : [...state, userId]);
  };



  return (
    <motion.div
      className="task-form"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
    >
      <h2 style={{color:'#ff9900'}}>Create New Task</h2>
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
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
            value={dueDate || ""}
            onChange={(e) => setDueDate(e.target.value)}
            
          />
        </div>
        <div className="form-group">
          <label>Assign To</label>
          <div className="assign-container"> 
          {users.map((user) => (
              <div key={user.id} className="assign-item">
                <label htmlFor="">
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
        <button type="close-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit">Create Task</button>
        </div>
      </form>
    </motion.div>
  );
};

export default TaskForm;
