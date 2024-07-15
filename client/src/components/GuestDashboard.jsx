import React from 'react';
import { motion } from 'framer-motion';
import '../styles/GuestDashboard.css';

const GuestDashboard = () => {
  return (
    <motion.div
      className="guest-dashboard"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
    >
      <h2>Welcome to the Task Manager 📝</h2>
      <div className="content">
        <div className="text-content">
          <p>This application helps you manage your tasks efficiently.</p>
          <p>Features include:</p>
          <ul>
            <li>Creating and managing tasks</li>
            <li>Assigning tasks to team members</li>
            <li>Tracking the progress of tasks</li>
            <li>Editing and updating tasks</li>
            <li>Viewing task history</li>
          </ul>

          <h2>Please <a href="/login">Login</a> to start managing your tasks.</h2>
        </div>
        <div className="image-content">
          <img src="https://ubsapp.com/wp-content/uploads/2021/12/Benefit-of-task-management-tools-1024x747.jpg" alt="Task Management" />
        </div>
      </div>
    </motion.div>
  );
};

export default GuestDashboard;
