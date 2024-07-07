const db = require('../config/db');

const createTask = async(title, description, dueDate, priority, createdBy, editPermissions)=>{
    try {
        const [result] = await db.execute('INSERT INTO tasks (title, description, priority, status, due_date, created_by, assigned_by ) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                title || '',
                description || '',
                priority || 'low',
                'pending',
                dueDate || null,                
                createdBy,
                createdBy,
            ]
        )

        const taskId = result.insertId

        if(assignedTo && assignedTo.length){
            for(const userId of assignedTo){
                await db.execute('INSERT INTO task_assignees (user_id, task_id) VALUES (?, ?)', [userId, taskId])

                const can_edit = editPermissions.includes(userId)
                await setTaskEditPermission(taskId, userId, can_edit)
            }
        }

        console.log("Task created successfully with ID:", taskId);
        return taskId
    } catch (error) {
        console.error(error)
        throw error
    }
}

// Function to create a new Note
const createNotes = async(taskId, userId, content, username)=>{
    try {
        await db.execute('INSERT INTO notes (task_id, user_id, note, created_by) VALUES(?, ?, ?, ?)',[taskId, userId, content, username])
    } catch (error) {
        console.error(error)
        throw error        
    }
}

const getUsernameById = async(userId)=>{
    const query = 'SELECT username FROM users WHERE id = ?';
    const [rows] = await db.execute(query, [userId]);
    if (rows.length > 0) {
      return rows[0].username;
    } else {
      throw new Error('User not found');
    }
  
}

// Function to get all notes by a task
const getNotesById = async (taskId) => {
    if (!taskId) {
      throw new Error('Task ID is required');
    }
    const query = `
      SELECT n.*, u.username AS created_by
      FROM notes n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE task_id = ?
      ORDER BY created_at DESC
    `;
    console.log('query', query);
    const [rows] = await db.execute(query, [taskId]);
    console.log('rows', rows);
    return rows;
  };

// Function to delete a note
const deleteNote = async (noteId) => {
    const query = 'DELETE FROM notes WHERE id = ?';
    await db.promise().execute(query, [noteId]);
};

const getAllTasks = async () => {
    const [rows] = await db.execute(`
      SELECT t.*, 
             u1.username AS created_by_username, 
             GROUP_CONCAT(DISTINCT u2.id) AS assigned_to_user_ids, -- Changed this line
             GROUP_CONCAT(DISTINCT tp.user_id) AS edit_permissions
      FROM tasks t 
      LEFT JOIN users u1 ON t.created_by = u1.id 
      LEFT JOIN task_assignees ta ON t.id = ta.task_id
      LEFT JOIN users u2 ON ta.user_id = u2.id
      LEFT JOIN task_permissions tp ON t.id = tp.task_id
      WHERE t.deleted = 0
      GROUP BY t.id
    `);
    console.log("Tasks fetched:", rows); 
    return rows.map(row => ({
      ...row,
      assigned_to_user_ids: row.assigned_to_user_ids ? row.assigned_to_user_ids.split(',') : []
    }));
  };

const getUserTask = async(userId)=>{
    const [rows] = await db.execute(`
        SELECT t.*,
            u.username AS created_by_username,
            GROUP_CONCAT(u2.username SEPARATOR ', ') AS assigned_to_usernames,
            u3.username AS assigned_to_username,
            tp.can_edit,
            th.edited_by,
            u4.username AS edited_by_username,
            th.edited_at
        FROM tasks t
        LEFT JOIN users u1 ON t.created_by = u1.id
        LEFT JOIN task_assignees ta ON t.id = ta.task_id
        LEFT JOIN users u1 ON t.created_by = u1.id
    LEFT JOIN task_assignees ta ON t.id = ta.task_id
    LEFT JOIN users u2 ON ta.user_id = u2.id
    LEFT JOIN users u3 ON t.assigned_by = u3.id
    LEFT JOIN task_permissions tp ON t.id = tp.task_id AND tp.user_id =?
    LEFT JOIN task_history th ON t.id = th.task_id
    LEFT JOIN users u4 ON th.edited_by = u4.id
    WHERE t.created_by = ?
    AND t.deleted = 0
    GROUP BY t.id`,
    [userId, userId]
    );

    return rows
}

const getAssignedTasks = async(userId, taskId)=>{
    const [rows] = await db.execute(
        `
        SELECT t.*, 
            u1.username as created_by_username, 
            GROUP_CONCAT(u2.username SEPARATOR ", ") AS assigned_to_usernames, 
            u3.username as assigned_to_username, 
            tp.can_edit, 
            th.edited_by, 
            u4.username as edited_by_username, 
            th.edited_at
            
        FROM tasks t
        LEFT JOIN users u1 ON t.created_by = u1.id
        LEFT JOIN task_assignees ta ON t.id = ta.task_id
        LEFT JOIN users u2 ON ta.user_id = u2.id
        LEFT JOIN users u3 ON t.assigned_by = u3.id 
        LEFT JOIN task_permissions tp ON t.id = tp.task_id AND tp.user_id = ?
        LEFT JOIN task_history th ON t.id = th.task_id
        LEFT JOIN users u4 ON th.edited_by = u4.id
        WHERE ta.user_id = ? 
        AND t.deleted = 0
        GROUP BY t.id`,
        [userId, userId]
      );
      return rows;
}

const updateTask = async(taskId, updates, editedBy)=>{
    try {
        const {assignedTo, editPermissions, ...otherUpdates} = updates

        const fields = Object.keys(otherUpdates)
        const values = Object.values(otherUpdates)
        const setClause = fields.map((field)=> `${field} = ?`).join(", ");

        // For inserting the updated tasks table 
        await db.execute(`UPDATE  tasks SET ${setClause} WHERE id = ?`,
            [...values, taskId]
        )
        if (assignedTo && assignedTo.length) {
            await db.execute("DELETE FROM task_assignees WHERE task_id = ?", [
              taskId,
            ]);
            await db.execute("DELETE FROM task_permissions WHERE task_id = ?", [
              taskId,
            ]);
      
            for (const userId of assignedTo) {
              await db.execute(
                "INSERT INTO task_assignees(task_id, user_id) VALUES (?, ?)",
                [taskId, userId]
              );
              await setTaskEditPermission(
                taskId,
                userId,
                editPermissions.includes(parseInt(userId))
              );
            }
          }
          // Inserting into the task_history
          const originalTask = await getTaskById(taskId);
      
          await db.execute(
            "INSERT INTO task_history (task_id, edited_by, original_title, original_description) VALUES (?, ?, ?, ?)",
            [taskId, editedBy, originalTask.title, originalTask.description]
          );
          console.log("Task updated successfully");
        } catch (error) {
          console.error("Failed to update task", error);
          throw error;
        }
}

const updateTaskStatus = async (taskId, status) => {
    try {
      const [result] = await db.execute(
        "UPDATE tasks SET status = ? WHERE id=?",
        [status, taskId]
      );
      return result;
    } catch (error) {
      console.error("Failed to update task status", error);
      throw error;
    }
  };

  const getTaskById = async (taskId) => {
    try {
      const query = `
        SELECT 
          t.*, 
          u1.username AS created_by_username,
          GROUP_CONCAT(u2.id) AS assigned_to_user_ids -- Changed this line
        FROM tasks t
        LEFT JOIN users u1 ON t.created_by = u1.id
        LEFT JOIN task_assignees ta ON t.id = ta.task_id
        LEFT JOIN users u2 ON ta.user_id = u2.id
        WHERE t.id = ? AND t.deleted = 0
        GROUP BY t.id, u1.username
      `;
      const [rows] = await db.execute(query, [taskId]);
  
      if (rows.length === 0) return null;
      console.log("Task fetched by ID:", rows[0]); 
      return {
        ...rows[0],
        assigned_to_user_ids: rows[0].assigned_to_user_ids ? rows[0].assigned_to_user_ids.split(',') : []
      };
    } catch (error) {
      console.error("Failed to get task by ID", error);
      throw error;
    }
  };

const setTaskEditPermission = async(taskId, userId, canEdit)=>{
    if(!userId) return;
    try {
        await db.execute('INSERT INTO task_permissions (task_id, user_id, can_edit) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE can_edit = ?',
            [taskId, userId, canEdit, canEdit])
        
    } catch (error) {
        console.error('Failed to set permission for edit', error)
        throw error;
    }
}

const getTaskEditPermission= async(userId, taskId)=>{
    try {
        const [res] = await db.execute('SELECT can_edit FROM task_permissions where task_id = ? AND user_id = ?',
            [taskId, userId]
        )
        return rows.length ? row[0].can_edit : false
    } catch (error) {
        console.error(error)
    }
}

const getTaskHistory = async (taskId) => {
    const [rows] = await db.execute(
      `SELECT th.*, u.username, AS edited_by_username FROM task_history th
      LEFT JOIN users u ON th.edited_by = u.id
      WHERE th.task_id = ?
      ORDER BY th.edited_at DESC`,
      [taskId]
    );
  
    return rows;
  };
  
  
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
    getNotesById,
    deleteNote,
    setTaskEditPermission,
    getTaskEditPermission,
    updateTask,
    updateTaskStatus,
    getUserTask,
    getAssignedTasks,
    getTaskHistory,
    getUsernameById
}