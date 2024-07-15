import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "../styles/TaskForm.css";
import authService from "../services/authService";

const TaskForm = ({ onTaskCreated, onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);
  const [editPermissions, setEditPermissions] = useState([]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description) {
      alert("Title and Description are required");
      return;
    }

    try {
      const newTask = {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        assignedTo,
        editPermissions,
      };
      onTaskCreated(newTask);

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

  const handleAssignedToChanged = (e)=>{
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value)
    setAssignedTo(selectedOptions); 
    console.log("assigned", selectedOptions)
  }

  const handlePermissionChange = (userId)=>{
    setEditPermissions(prev=> prev.includes(userId) ? prev.filter(id => id!== userId) : [...prev, userId]);
  }

  return (
    <motion.div
      className="task-form"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
    >
      <h2>Create New Task</h2>
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
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label>Priority</label>
          <select
            value={priority || ""}
            onChange={(e) => setPriority(e.target.value)}
            required
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
            required
          />
        </div>
        <div className="form-group">
          <label>Assign To</label>
          <select
            multiple={true}
            value={assignedTo || ""}
            onChange={handleAssignedToChanged}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
            <label>Edit Permissions</label>
            {users.map((user)=>(
              <div key={user.id}>
                <label>
                  <input 
                    type="checkbox" 
                    value={user.id} 
                    checked={editPermissions.includes(user.id)} 
                    onChange={()=> handlePermissionChange(user.id)}
                  />
                  {user.username}
                </label>
              </div>
            ))}
        </div>
        <button type="submit">Create Task</button>
      </form>
    </motion.div>
  );
};

export default TaskForm;
