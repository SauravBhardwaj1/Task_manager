import React from 'react'
import TaskList from './TaskList'
import '../styles/InProgressTask.css'

const InProgressTask = ({tasks, onEditClick, onDeleteClick, onStatusChange}) => {

  const inProgressTasks = tasks.filter(task => task.status === 'In Progress')
  return (
    <div className='in-progress-tasks'>
      <h2>In-Progress tasks</h2>
      <TaskList tasks={inProgressTasks} onEditClick={onEditClick} onDeleteClick={onDeleteClick} onStatusChange={onStatusChange}/>
    </div>
  )
}

export default InProgressTask