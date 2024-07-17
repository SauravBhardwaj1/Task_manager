import React from 'react'
import TaskList from './TaskList'

const CompletedTask = ({tasks, onStatusChange}) => {

  const completedTasks = tasks.filter(task => task.status === 'completed')
  return (
    <div>
      <h2>Completed Tasks</h2>
      <TaskList tasks={completedTasks} onStatusChange={onStatusChange}/>
    </div>
  )
}

export default CompletedTask