const db = require('../config/db');

const createTask = async(title, description, dueDate, priority, createdBy, editPermissions)=>{
    try {
        const [result] = await db.execute('INSERT INTO tasks (title, description, due_date, priority, status, assigned_by, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                title || '',
                description || '',
                dueDate || null,
                priority || 'low',
                'Pending',
                createdBy,
                createdBy,
            ]
        )

        const taskId = result.insertId

        console.log("Task created successfully with ID:", taskId);
        return taskId
    } catch (error) {
        console.error(error)
        throw error
    }
}

// Function to create a new Note
const createNotes = async(taskId, userId, note)=>{
    try {
        await db.execute('INSERT INTO notes (task_id, user_id, note)',[taskId, userId, note])
    } catch (error) {
        console.error(error)
        throw error        
    }
}

// Function to get all notes by a task
const getNoteById = async(taskId)=>{
    try {
        const [res] = await db.execute('SELECT * FROM notes WHERE task_id = ?',[taskId])

        return res
    } catch (error) {
        console.error(error)        
    }   
}

// Function to delete a note
const deleteNote = async (noteId) => {
    const query = 'DELETE FROM notes WHERE id = ?';
    await db.promise().execute(query, [noteId]);
};

const getAllTasks = async () => {
    try {
      const [rows] = await db.execute(`
        SELECT
          t.*,
          u1.username AS created_by_username,
          GROUP_CONCAT(DISTINCT u2.username) AS assigned_to_usernames,
          GROUP_CONCAT(DISTINCT tp.user_id) AS edit_permissions
        FROM tasks t
        LEFT JOIN users u1 ON t.created_by = u1.id
        LEFT JOIN task_assignees ta ON t.id = ta.task_id
        LEFT JOIN users u2 ON ta.user_id = u2.id
        LEFT JOIN task_permissions tp ON t.id = tp.task_id
        GROUP BY t.id
      `);
      return rows;
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      throw error;
    }
  };

const getTaskById = async(taskId)=>{
    try {
        const [rows] = await db.execute(`
            Select t.* ,
                u.username AS assigned_by_username,
                GROUP_CONCAT(u2.username) AS assigned_to_usernames
            FROM tasks t
            JOIN users u1 ON t.created_by = u1.id
            LEFT JOIN task_assignees ta ON t.id = ta.task_id
            LEFT JOIN users u2 ON ta.user_id = u2.id
            WHERE t.id = ?
            GROUP BY t.id
            `, [taskId])

            if(rows.length === 0) return null;

            return rows[0]
    } catch (error) {
        console.error('Failed to get task by ID',error)
        throw error
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
    getTaskById,
    createNotes,
    getNoteById,
    deleteNote
}