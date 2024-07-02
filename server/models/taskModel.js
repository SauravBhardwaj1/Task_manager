const db = require('../config/db');

const createTask = async(title, description, dueDate, priority, createdBy, editPermissions)=>{
    try {
        const result = await db.execute('INSERT INTO tasks (title, description, dueDate, priority, status, assigned_by, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                title || '',
                description || '',
                dueDate || new Date(),
                priority || 1,
                'Pending',
                createdBy,
                createdBy,
                editPermissions,
            ]
        )

        return result
    } catch (error) {
        console.error(error)
        throw error
    }
}

const getAllTasks = async(userId)=>{
    try {
        const [row] = await db.execute('SELECT * FROM tasks WHERE user_id =?', [userId])

        return row
    } catch (error) {
        console.error(error)
    }
}


const deleteTask = async(taskId)=>{
    try {
        await db.execute('DELETE FROM tasks WHERE task_id = ?', [taskId])
    } catch (error) {
        console.error(error)
    }
}

module.exports = {
    createTask,
    getAllTasks,
    deleteTask,
 
}