import React from 'react'
import '../styles/TaskHistory.css'

const TaskHistory = ({history}) => {

  return (
    <div className='task-history'>
        <h3>Task-history</h3>
        <ul>
            {history.map((entry, index)=>(
                <li key={index}>
                    <p>Edited by: {entry.edited_by}</p>
                    <p>Original Title: {entry.original_title}</p>
                    <p>Original Description: {entry.original_description}</p>
                    <p>Edited At: {entry.edited_at}</p>
                </li>
            ))}
        </ul>
    </div>
  )
}

export default TaskHistory