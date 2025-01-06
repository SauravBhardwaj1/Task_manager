const express = require("express");
const {
  createTask,
  getTaskEditPermission,
  getTaskById,
  getAllTasks,
  getUserTask,
  getAssignedTasks,
  updateTask,
  updateTaskStatus,
  softDeleteTask,
  createNotes,
  getNotesById,
  deleteNote,
  getAssignedUsers,
  getUsernameById,
  createReplyNote,
  markNoteAsCompleted,
  getNoteReplies,
  getNoteRepliesByNoteId,
  getCompletedNotes,
  deleteNoteReply,
} = require("../models/tasksModel");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

module.exports = (io)=>{

  // Get all tasks for authenticated users
  router.get("/", authenticateToken, async (req, res) => {
    // console.log("commenting")
    try {
      const tasks = await getAllTasks();
      console.log("tasks", tasks);
      res.json(tasks);
    } catch (err) {
      res.status(500).send("Error fetching tasks");
    }
  });

  // Create a new task
  router.post("/", authenticateToken, async (req, res) => {
    const { title, description, priority, dueDate, assignedTo, editPermissions } = req.body;
    const createdBy = req.user.id;

    try {
      const taskId = await createTask(title, description, priority, dueDate, assignedTo, createdBy, editPermissions);
      const task = await getTaskById(taskId);

      res.status(201).json(task);
    } catch (err) {
      console.error("Failed to create task:", err.message);
      if (err.message === "Assigned user does not exist") {
        return res.status(400).json({ error: "Assigned user does not exist" });
      }
      res.status(500).json({ error: "Error creating task" });
    }
  });

  //Create a new Note
  router.post('/:id/create', authenticateToken, async(req,res)=>{
      try {
        const taskId = req.params.id
        const {newNote} = req.body
        const userId = req.user.id

        console.log('taskId',taskId)
        if (!taskId) {
          return res.status(400).json({ error: 'Task ID is required' });
        }
        if (!newNote.trim()) {
          return res.status(400).json({ error: 'Note content cannot be empty' });
        }

        const username= await getUsernameById(userId)
        // console.log('username',username)
        await createNotes(taskId, userId, newNote, username);
        res.status(201).json({message: 'Note created successfully'});
      } catch (error) {
        console.error('Failed to create note:',error.message)
        res.status(500).json({ error: 'Failed to create note', error: error.message });
      }
  })


  // Get a note for a task
  router.get('/:id/notes', authenticateToken, async(req, res)=>{
    try {
      const taskId = req.params.id
      // console.log("taskId: " + taskId)
      if (!taskId) {
        throw new Error('Task ID is required');
      }

      const notes = await getNotesById(taskId)
      res.status(200).json({notes})

    } catch (error) {
      console.error('Failed to get notes:'.error) 
      res.status(500).json({ error: 'Failed to get notes' });
    }
  })

  // Delete a note for a task
  router.delete('/delete/:id', authenticateToken, async(req, res)=>{
    try {
      const noteId = req.params.id
      if (!noteId) {
        return res.status(400).json({ message: 'Note ID is required' });
      }
      // console.log("NoteId: " + noteId)
      await deleteNote(noteId);
      res.status(200).json({message: 'Note deleted successfully'})
    } catch (error) {
      console.error('Failed to delete note:'.error)
      res.status(500).json({message: 'Failed to delete note:'})
    }
  })

  // Create a reply for a note
  router.post('/:id/reply', authenticateToken, async(req, res)=>{
    try {
      const {noteId, replyContent} = req.body;
      if(!noteId){
        throw new Error('NoteId is required')
      }

      const userId = req.user.id;
      const username = await getUsernameById(userId);
      await createReplyNote(noteId, userId, replyContent, username)

      // // Emit websockets events to notify assigned users
      io.to(`task-${noteId}`).emit('new-reply',{
        noteId,
        replyContent,
        createdBy: username,
        createAt: new Date()
      })

      res.status(201).json({message: 'Reply added successfully'})
    } catch (error) {
      console.error('Failed to create reply note', error.message)
      res.status(500).json({ error: 'Failed to create reply note', error: error.message });
    }
  })

  // Get a reply note
  router.get('/:id/notesReply', authenticateToken, async(req, res)=>{
    try {
      const noteId = req.params.id
      // console.log("taskId: " + taskId)
      if (!noteId) {
        throw new Error('Task ID is required');
      }

      const replies = await getNoteRepliesByNoteId(noteId)
      // console.log("replies: " + replies)
      res.status(200).json({replies})

    } catch (error) {
      console.error('Failed to get notes:'.error) 
      res.status(500).json({ error: 'Failed to get notes' });
    }
  })

  // Delete a reply for a note
  router.delete('/deleteReply/:id', authenticateToken, async(req, res)=>{
    try {
      const replyId = req.params.id
      if (!replyId) {
        return res.status(400).json({ message: 'Note ID is required' });
      }
      // console.log("NoteId: " + noteId)
      await deleteNoteReply(replyId);

      res.status(200).json({message: 'reply deleted successfully'})
    } catch (error) {
      console.error('Failed to delete note:', error)
      res.status(500).json({message: 'Failed to delete note:'})
    }
  })

  // To mark the note status completed
  router.patch('/complete/:id', authenticateToken, async(req, res)=>{
    try {
      console.log('Received request to update note completion:', req.body);
      const noteId = req.params.id;
      const {completed} = req.body
      if (typeof completed !== 'boolean') {
        console.log("complete: " + completed)
        return res.status(400).json({ message: 'Completed status is required' });
      }

      const updateMarkComplete = await markNoteAsCompleted(noteId, completed)    
      res.status(200).json({message: `Note marked as ${completed ? 'completed' : 'not completed'}`, updateMarkComplete })
    } catch (error) {
      console.error('Failed to mark note as completed', error.message)
      res.status(500).json({ message: 'Failed to toggle note completion', error: error.message });
    }
  });

  // Get all completed notes
  router.get('/completed/:taskId', authenticateToken, async (req, res) => {
    try {
      const { taskId } = req.params;
      console.log('Fetching completed notes for taskId:', taskId);

      const completedNotes = await getCompletedNotes(taskId);
      res.status(200).json(completedNotes);
    } catch (error) {
      console.error('Failed to get completed notes:', error.message);
      res.status(500).json({ message: 'Failed to get completed notes' });
    }
  });


  // Get userTask created by user
  router.get("/user", authenticateToken, async (req, res) => {
    try {
      const userTask = await getUserTask(req.user.id);
      res.json(userTask);
    } catch (error) {
      res.status(400).send("Error getting user task: " + error.message);
    }
  });

  //get assigned tasks
  router.get("/assigned", authenticateToken, async (req, res) => {
    try {
      const assignedTask = await getAssignedTasks(req.user.id);
      res.json(assignedTask);
    } catch (error) {
      console.error("Error getting assigned tasks:", error);
      res.status(400).send("Error getting assigned tasks");
    }
  });

  // Update the tasks for authenticated users
  router.put('/:id/permission', authenticateToken, async(req,res)=>{

    const taskId = req.params.id
    const {title, description, priority,dueDate,assignedTo, editPermissions}  = req.body;
    const editedBy = req.user.id;
    
    try {
      const task = await getTaskById(taskId);
      if (!task) return res.status(404).send('Task not found');

      const canEdit = await getTaskEditPermission(taskId, req.user.id);
      console.log("canEdit: route " + canEdit)

      if (!canEdit) {
        return res.status(403).json({message:'Permission denied'});
      }

      const updates={
        title,
        description,
        priority,
        due_date: dueDate ,
        assignedTo,
        editPermissions,
      }
      await updateTask(taskId, updates, editedBy);

      res.status(200).json({message:'Task updated'});
    } catch (err) {
      console.error("Failed to update task:", err.message);
      res.status(400).json({error:'Error updating task'});
    }
  })

  router.patch('/:id/status', authenticateToken, async(req,res)=>{
    const taskId = req.params.id
    const { status } = req.body;
    console.log("status: " + status)

    try {
      
      const result = await updateTaskStatus(taskId, status)
      // if(status !== 'completed' && status !== 'in-progress' && status !== 'pending'){
      //   return res.status(400).send('Invalid task status')
      // }

      if (result.affectedRows === 0) {
        return res.status(404).json({message:'Task not found'});
      }
      res.status(200).json({ message: 'Task status updated successfully' });
    } catch (error) {
      console.error('Error updating task status')
      res.status(500).send('Error updating task status');
    }
  })

  // For update the task
  router.put("/:id", authenticateToken, async (req, res) => {
    const taskId = req.params.id;
    const updates = req.body;
    const editedBy = req.user.id;

    try {
      const task = await getTaskById(taskId);
      if (!task) return res.status(404).send('Task not found');

      const canEdit = await getTaskEditPermission(taskId, req.user.id);
      if (!canEdit) {
        return res.status(403).send('Permission denied');
      }

      await updateTask(taskId, updates, editedBy);
      res.send('Task updated');
    } catch (err) {
      res.status(400).send('Error updating task');
    }
  });

  // Fetching the history of the task
  router.get("/:id/history", authenticateToken, async (req, res) => {
    const taskId = req.params.id;

    try {
      const history = await getTaskHistory(taskId);
      res.json(history);
    } catch (error) {
      res.status(400).send("Error fetching history");
    }
  });

  //For deleting the task
  router.delete("/:id", authenticateToken, async (req, res) => {
    const taskId = req.params.id;

    console.log("taskId", taskId);
    try {
      const result = await softDeleteTask(taskId);

      if(result.affectedRows === 0){
        return res.status(404).send('Task not found');
      }
      
      res.status(200).send("Task deleted");
    } catch (err) {
      console.error('Error deleting task:', err);
      res.status(400).send("Error deleting task");
    }
  });

  return router
}














    ///// OLD CODE ///////
// const {
//   createTask,
//   getTaskEditPermission,
//   setTaskEditPermission,
//   getTaskById,
//   getAllTasks,
//   getUserTask,
//   getAssignedTasks,
//   updateTask,
//   updateTaskStatus,
//   deleteTask,
//   softDeleteTask,
// } = require("../models/tasksModel");
// const { authenticateToken } = require("../middleware/auth");

// const router = express.Router();

// // Get all tasks for authenticated users
// router.get("/", authenticateToken, async (req, res) => {
//   try {
//     const tasks = await getAllTasks();
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).send("Error fetching tasks");
//   }
// });

// // Create a new task
// router.post("/", authenticateToken, async (req, res) => {
//   const { title, description, priority, dueDate, assignedTo, canEdit } = req.body;
//   const createdBy = req.user.id;

//   try {
//     const taskId = await createTask(title, description, priority, dueDate, assignedTo, createdBy);
//     const task = await getTaskById(taskId);

//     if (assignedTo) {
//       await setTaskEditPermission(taskId, assignedTo, canEdit);
//     }

//     res.status(201).json(task);
//   } catch (err) {
//     console.error("Failed to create task:", err.message);
//     if (err.message === "Assigned user does not exist") {
//       return res.status(400).json({ error: "Assigned user does not exist" });
//     }
//     res.status(500).json({ error: "Error creating task" });
//   }
// });

// // Get userTask created by user
// router.get("/user", authenticateToken, async (req, res) => {
//   try {
//     const userTask = await getUserTask(req.user.id);
//     res.json(userTask);
//   } catch (error) {
//     res.status(400).send("Error getting user task: " + error.message);
//   }
// });

// //get assigned tasks
// router.get("/assigned", authenticateToken, async (req, res) => {
//   try {
//     const assignedTask = await getAssignedTasks(req.user.id);
//     res.json(assignedTask);
//   } catch (error) {
//     res.status(400).send("Error getting assigned tasks");
//   }
// });

// // Update the tasks for authenticated users
// router.put('/:id/permission', authenticateToken, async(req,res)=>{

//   const taskId = req.params.id
//   const updates  = req.body;
//   const editedBy = req.user.id;
  
//   try {
//     const task = await getTaskById(taskId);
//     if (!task) return res.status(404).send('Task not found');

//     const canEdit = await getTaskEditPermission(taskId, req.user.id);
//     console.log("canEdit: " + canEdit)

//     if (!canEdit) {
//       return res.status(403).json({message:'Permission denied'});
//     }

//     await updateTask(taskId, updates, editedBy);
//     res.status(200).json({message:'Task updated'});
//   } catch (err) {
//     res.status(400).json({error:'Error updating task'});
//   }
// })

// router.patch('/:id/status', authenticateToken, async(req,res)=>{
//   const taskId = req.params.id
//   const { status } = req.body;
//   console.log("status: " + status)

//   try {
    
//     const result = await updateTaskStatus(taskId, status)
//     // if(status !== 'completed' && status !== 'in-progress' && status !== 'pending'){
//     //   return res.status(400).send('Invalid task status')
//     // }

//     if (result.affectedRows === 0) {
//       return res.status(404).json({message:'Task not found'});
//     }
//     res.status(200).json({ message: 'Task status updated successfully' });
//   } catch (error) {
//     console.error('Error updating task status')
//     res.status(500).send('Error updating task status');
//   }
// })

// // For update the task
// router.put("/:id", authenticateToken, async (req, res) => {
//   const taskId = req.params.id;
//   const updates = req.body;
//   const editedBy = req.user.id;

//   try {
//     const task = await getTaskById(taskId);
//     if (!task) return res.status(404).send('Task not found');

//     const canEdit = await getTaskEditPermission(taskId, req.user.id);
//     if (!canEdit) {
//       return res.status(403).send('Permission denied');
//     }

//     await updateTask(taskId, updates, editedBy);
//     res.send('Task updated');
//   } catch (err) {
//     res.status(400).send('Error updating task');
//   }
// });

// // Fetching the history of the task
// router.get("/:id/history", authenticateToken, async (req, res) => {
//   const taskId = req.params.id;

//   try {
//     const history = await getTaskHistory(taskId);
//     res.json(history);
//   } catch (error) {
//     res.status(400).send("Error fetching history");
//   }
// });

// //For deleting the task
// router.delete("/:id", authenticateToken, async (req, res) => {
//   const taskId = req.params.id;

//   console.log("taskId", taskId);
//   try {
//     const result = await softDeleteTask(taskId);

//     if(result.affectedRows === 0){
//       return res.status(404).send('Task not found');
//     }
    
//     res.status(200).send("Task deleted");
//   } catch (err) {
//     console.error('Error deleting task:', err);
//     res.status(400).send("Error deleting task");
//   }
// });

// module.exports = router;