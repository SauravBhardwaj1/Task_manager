import React from 'react';
import TaskList from './TaskList';
import '../styles/InProgressTask.css'

const InProgressTasks = ({ tasks, onEditClick, onDeleteClick, onStatusChange }) => {
  const inProgressTasks = tasks.filter((task) => task.status === 'In Progress');

  return (
    <div className="in-progress-tasks">
      {!inProgressTasks.length && (
          <h2>No In-Progress Tasks</h2>
        )}
      <TaskList tasks={inProgressTasks} onEditClick={onEditClick} onDeleteClick={onDeleteClick} onStatusChange={onStatusChange} />
    </div>
  );
};

export default InProgressTasks;