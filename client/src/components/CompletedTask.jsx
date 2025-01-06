import React from 'react'
import TaskList from './TaskList'

const CompletedTasks = ({ tasks, onDeleteClick, onStatusChange }) => {

    const completedTask = tasks.filter((task)=> task.status === 'Completed')
  return (
    <div>
        {!completedTask.length && (
          <h2>No Completed Tasks</h2>
        )}
        <TaskList tasks={completedTask}  onStatusChange={onStatusChange} />
    </div>
  )
}

export default CompletedTasks