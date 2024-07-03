const db = require('../config/db');
const express = require('express');
const { createTask, createNotes, getNoteById, deleteNote } = require('../models/taskModel');
const authenticateToken = require('../middleware/Auth');

const router = express.Router();

//Get All USER TASKS
router.get('/', authenticateToken , async(req, res)=>{
    const userId = req.user.id
    try {
        const res = await getAllTasks(userId)

        res.status(200).json(res)
    } catch (error) {
        console.error(error.message)
    }
})

//CREATE TASK
router.post('/', authenticateToken, async(req,res)=>{
    const userId = req.user.id
    const { title, description, dueDate, priority, createdBy, editPermissions  } = req.body

    try {
        await createTask(title, description, dueDate, priority, createdBy, editPermissions)

        res.status(201).json({message: 'Task created successfully'})
    } catch (error) {
        console.error(error)
    }
})

// Create a new Note
router.post('/:id/notes',authenticateToken , async(req,res)=>{
    try {
        const userId = req.user.id
        const taskId = req.params.id
        const { note } = req.body

        await createNotes(userId, taskId, note)

        res.status(201).json({message: 'Note created successfully'})
    } catch (error) {
        console.error('Failed to create a new note',error)
    }
})

// Route to get notes by ID
router.get('/:id/notes',authenticateToken, async(req,res)=>{
    try {
        const taskId = req.params.id

        const notes = await getNoteById(taskId)

        res.status(200).json({notes})
    } catch (error) {
        console.error(error)
    }
})

router.get('/:id/delete',authenticateToken, async(req,res)=>{
    try {
        const noteId = req.params.id

        await deleteNote(noteId)

        res.status(200).json({message: 'Task deleted successfully'})
    } catch (error) {
        console.error(error)
    }
})

module.exports = router