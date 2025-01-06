const db = require("../config/db");

const createTask = async (
  title,
  description,
  priority,
  dueDate,
  assignedTo,
  createdBy,
  editPermissions
) => {
  try {
    console.log("Creating task with:", {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      createdBy,
      editPermissions,
    });

    const [result] = await db.execute(
      "INSERT INTO tasks (title, description, priority, status, due_date, created_by, assigned_by) VALUES (?, ?, ?, ?, ?, ?,?)",
      [
        title || "",
        description || "",
        priority || "low",
        "pending",
        dueDate || null,
        createdBy,
        createdBy,
      ]
    );

    // Grant permission to the assigned user
    const taskId = result.insertId;

    if (assignedTo && assignedTo.length) {
      for (const userId of assignedTo) {
        await db.execute(
          "INSERT INTO task_assignees (task_id, user_id) VALUES (?, ?)",
          [taskId, userId]
        );
        const canEdit = editPermissions.includes(parseInt(userId));
    
        await setTaskEditPermission(taskId, userId, canEdit);
        // console.log("canEdit: " + canEdit);
      }
    }
    // Always ensure creator has edit permissions
    await setTaskEditPermission(taskId, createdBy, true);
    console.log("Task created successfully with ID:", taskId);
    return taskId;
  } catch (error) {
    console.error("Failed to create task:", error);
    throw error;
  }
};

// Function to create new Notes
const createNotes = async (taskId, userId, content, username)=>{
  
  const query = 'INSERT INTO notes (task_id, user_id, note, created_by) VALUES (?, ?, ?, ?)';
  await db.execute(query, [taskId, userId, content, username]);
}

// Function to create a reply for a note
const createReplyNote = async(noteId, userId, content, username)=>{
  const query = 'INSERT INTO note_replies (note_id, user_id, reply, created_by) VALUES (?, ?, ?, ?)';

  await db.execute(query, [noteId, userId, content, username])
};


//Function to fetch replies for a note
const getNoteRepliesByNoteId = async (noteId)=>{
  const query = `SELECT r.*, u.username FROM note_replies r LEFT JOIN users u ON r.user_id = u.id WHERE r.note_id = ? ORDER BY r.created_at ASC`;

  const [rows] = await db.execute(query, [noteId]);
  return rows;
}

//Funtion to get Notes by ID
const getNotesById = async(taskId)=>{
  if (!taskId) {
    throw new Error('Task ID is required');
}
  const query= `
    SELECT n.*, 
      u.username AS created_by
      FROM notes n 
      LEFT JOIN users u ON n.user_id = u.id 
      WHERE task_id = ? 
      ORDER BY created_at DESC`
    // console.log("query",query);
  
  const [notes] = await db.execute(query, [taskId]);

  return notes;
}

// Function to mark the note completed successfully
const markNoteAsCompleted = async(noteId, completed)=>{
  
  const query = 'UPDATE notes SET completed = ? WHERE id = ?';
  await db.execute(query, [completed ? 1 : 0, noteId]);
}

//Function to get all completed notes by ID
const getCompletedNotes = async(taskId)=>{
  const query = `SELECT n.*, u.username AS created_by
  FROM notes n
  LEFT JOIN users u ON n.user_id = u.id
  WHERE task_id = ? AND completed = 1
  ORDER BY created_at DESC`;

  const [completedNotes] = await db.execute(query, [taskId]);
  return completedNotes;
}

//Function to delete a note
const deleteNote = async(noteId)=>{
  const query = 'DELETE FROM notes WHERE id = ?';
  try {
    await db.execute(query, [noteId]); // Use parameterized queries for safety
  } catch (error) {
    throw new Error('Database delete operation failed');
  }
}

//Function to delete note reply
const deleteNoteReply = async(replyId)=>{
  const query = 'DELETE FROM note_replies WHERE id = ?'

  try {
    await db.execute(query, [replyId]); 
  } catch (error) {
    throw new Error('Database delete operation failed');
  }
}

//Function to get a username by ID
const getUsernameById = async(userId)=>{
  const [rows] = await db.execute('SELECT username FROM users WHERE id = ?', [userId]);

  if(!rows.length){
    throw new Error('User not found');
  }
  // console.log("row of user",username[0][0].username)
  
  return rows[0].username;
}

//Function to get all tasks
const getAllTasks = async () => {
  const [rows] = await db.execute(`
    SELECT t.*, 
           u1.username AS created_by_username,
           GROUP_CONCAT(DISTINCT u2.username) AS assigned_to_usernames,
           GROUP_CONCAT(DISTINCT tp.user_id) AS edit_permissions
    FROM tasks t 
    LEFT JOIN users u1 ON t.created_by = u1.id 
    LEFT JOIN task_assignees ta ON t.id = ta.task_id
    LEFT JOIN users u2 ON ta.user_id = u2.id
    LEFT JOIN task_permissions tp ON t.id = tp.task_id
    WHERE t.deleted = 0
    GROUP BY t.id
  `);
  // console.log("Tasks fetched: " + rows)

  return rows.map(row=>({
    ...row,
    assigned_to_usernames: row.assigned_to_usernames ? row.assigned_to_usernames.split(',') : [],
    edit_permissions: row.edit_permissions ? row.edit_permissions.split(',').map(Number) : []
  }));
};

//Function to get Users task
const getUserTask = async (userId) => {
  const [rows] = await db.execute(
    `
    SELECT t.*,
        u1.username as created_by_username,
        GROUP_CONCAT(DISTINCT u2.username SEPARATOR ', ') AS assigned_to_usernames, 
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
    LEFT JOIN task_permissions tp ON t.id = tp.task_id AND tp.user_id =?
    LEFT JOIN task_history th ON t.id = th.task_id
    LEFT JOIN users u4 ON th.edited_by = u4.id
    WHERE t.created_by = ?
    AND t.deleted = 0
    GROUP BY t.id`,
    [userId, userId]
  );
  return rows;
};

// Function to get assigned tasks
const getAssignedTasks = async (userId) => {
  const [rows] = await db.execute(
    `
      SELECT t.*, 
      u1.username AS created_by_username, 
      GROUP_CONCAT(DISTINCT u2.username SEPARATOR ", ") AS assigned_to_usernames, 
      u3.username AS assigned_by_username, 
      tp.can_edit, 
      th.edited_by, 
      u4.username AS edited_by_username, 
      MAX(th.edited_at) AS edited_at
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
  GROUP BY t.id;
  `,
    [userId, userId]
  );
  return rows;
};

// const getAssignedTasks = async (userId) => {
//   const [rows] = await db.execute(
//     `
//     SELECT t.*, 
//         u1.username as created_by_username, 
//         GROUP_CONCAT(u2.username SEPARATOR ", ") AS assigned_to_usernames, 
//         u3.username as assigned_to_username, 
//         tp.can_edit, 
//         th.edited_by, 
//         u4.username as edited_by_username, 
//         th.edited_at
        
//     FROM tasks t
//     LEFT JOIN users u1 ON t.created_by = u1.id
//     LEFT JOIN task_assignees ta ON t.id = ta.task_id
//     LEFT JOIN users u2 ON ta.user_id = u2.id
//     LEFT JOIN users u3 ON t.assigned_by = u3.id 
//     LEFT JOIN task_permissions tp ON t.id = tp.task_id AND tp.user_id = ?
//     LEFT JOIN task_history th ON t.id = th.task_id
//     LEFT JOIN users u4 ON th.edited_by = u4.id
//     WHERE ta.user_id = ? 
//     AND t.deleted = 0
//     GROUP BY t.id`,
//     [userId, userId]
//   );
//   return rows;
// };

// Function to get task by ID
const getTaskById = async (taskId) => {
  try {
    const query = `
      SELECT 
        t.*, 
        u1.username AS created_by_username,
        GROUP_CONCAT(u2.id) AS assigned_to_user_ids
      FROM tasks t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN task_assignees ta ON t.id = ta.task_id
      LEFT JOIN users u2 ON ta.user_id = u2.id
      WHERE t.id = ? AND t.deleted = 0
      GROUP BY t.id, u1.username
    `;
  // console.log(`Executing query: ${query} with taskId: ${taskId}`);
  const [rows] = await db.execute(query, [taskId]);

  if (rows.length === 0) return null;
  console.log("Task fetched by ID:", rows[0])
  return {
    ...rows[0],
    assigned_to_user_ids: rows[0].assigned_to_user_ids ? rows[0].assigned_to_user_ids.split(',') : []
  };
  } catch (error) {
     console.error("Failed to get task by ID", error);
    throw error;
  }
  
};

// Function to update a task
const updateTask = async (taskId, updates, editedBy) => {
  // console.log("updateTask", taskId, updates, editedBy);
  try {
    const { assignedTo, editPermissions, ...otherUpdates } = updates;

    const fields = Object.keys(otherUpdates);
    const values = Object.values(otherUpdates);
    const setClause = fields.map((field) => `${field} = ?`).join(", ");

    // console.log(`Updating task with ID ${taskId}`);
    // console.log(`Set clause: ${setClause}`);
    // console.log(`Values: ${values}`);

    // For inserting the updated tasks to tasks table
    await db.execute(
      `UPDATE tasks SET ${setClause} WHERE id = ?`,
      [...values, taskId]
    );

    if (assignedTo && assignedTo.length) {
      await db.execute("DELETE FROM task_assignees WHERE task_id = ?", [
        taskId,
      ]);
      await db.execute("DELETE FROM task_permissions WHERE task_id = ?", [
        taskId,
      ]);

      const uniqueAssignees = [...new Set(assignedTo)];
      for (const userId of uniqueAssignees) {
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
};

//Function to update the task status
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

//Function to set task edit permissions
const setTaskEditPermission = async (taskId, userId, canEdit) => {
  if (!userId) {
    return;
  }
  try {
    console.log(
      `Setting edit permission for task ${taskId}, user ${userId}: ${canEdit}`
    );
    await db.execute(
      "INSERT INTO task_permissions (task_id, user_id, can_edit) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE can_edit = ?",
      [taskId, userId, canEdit, canEdit]
    );
    console.log(
      `Edit permission successfully set for task ${taskId}, user ${userId}: ${canEdit}`
    );
  } catch (error) {
    console.error("Failed to set task edit permission:", error);
    throw error;
  }
};

//Function to get task edit permissions
const getTaskEditPermission = async (taskId, userId) => {
  try {
    const [rows] = await db.execute(
      "SELECT can_edit FROM task_permissions WHERE task_id = ? AND user_id = ?",
      [taskId, userId]
    );
    console.log("rows for edit", rows[0]);
    return rows.length ? rows[0].can_edit : false;
  } catch (error) {
    console.error("Failed to get task edit permission", error);
    throw error;
  }
};

// Function to get task history
const getTaskHistory = async (taskId) => {
  const [rows] = await db.execute(
    `SELECT th.*, u.username AS edited_by_username FROM task_history th
    LEFT JOIN users u ON th.edited_by = u.id
    WHERE th.task_id = ?
    ORDER BY th.edited_at DESC`,
    [taskId]
  );

  return rows;
};

//Function to delete the task
const softDeleteTask = async (taskId) => {
  const [result] = await db.execute(
    "UPDATE tasks SET deleted = 1 WHERE id = ?",
    [taskId]
  );
  console.log("result", result);
  return result;
};


module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  setTaskEditPermission,
  getTaskEditPermission,
  getUserTask,
  getAssignedTasks,
  getTaskHistory,
  softDeleteTask,
  updateTaskStatus,
  createNotes,
  getNotesById,
  deleteNote,
  getUsernameById,
  markNoteAsCompleted,
  createReplyNote,
  getNoteRepliesByNoteId,
  getCompletedNotes,
  deleteNoteReply
};

