import React from 'react'
import '../styles/TaskHistory.css'

const TaskHistory = ({history}) => {
  return (
    <div>
      <h3>Task History</h3>
      <ul>
        {history.map((entry, index)=>(
          <li key={index}>
            <p>Edited by: {entry.edited_by}</p>
            <p>Original Title: {entry.Original_task}</p>
            <p>Original Description: {entry.Original_description}</p>
            <p>Edited At: {entry.edited_at}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TaskHistory