const db = require('../config/db');
const express = require('express');
const { createTask } = require('../models/taskModel');

const router = express.router();

//Get All USER TASKS
router.get('/', async(req, res)=>{
    const userId = req.user.id
    try {
        const res = await getAllTasks(userId)

        res.status(200).json(res)
    } catch (error) {
        console.error(error.message)
    }
})

//CREATE TASK
router.post('/', async(req,res)=>{
    const userId = req.user.id
    const { title, description, dueDate, priority, createdBy, editPermissions  } = req.body

    try {
        await createTask(title, description, dueDate, priority, createdBy, editPermissions)

        res.status(201).json({message: 'Task created successfully'})
    } catch (error) {
        console.error(error)
    }
})


module.exports = router