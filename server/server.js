require('dotenv').config();
const express= require('express')
const cors = require('cors')
const mysql = require('mysql2');
const config = require('./config/config');
const app = express()
const userRoutes = require('./routes/userRoute')
const taskRoutes = require('./routes/TaskRoute')
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

const PORT =  process.env.PORT || 4010
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(bodyParser.json());

// Create HTTP server and websocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }
})

const db = mysql.createConnection(config.db);

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
//   console.log('Connected to the database.');
  // Run the initialization script
  require('./config/db');
});


app.get('/', (req,res)=>{
    res.send("Welcome to the Task management application")
})


// Use routes
app.use('/api/tasks', taskRoutes(io));
app.use('/api/users', userRoutes);


// Websockets event handlers
io.on('connection', (socket)=>{
  console.log('A user connected:', socket.id);

  //Listen for "join-task" events
  socket.on('join-task', (taskId)=>{
    console.log(`User ${socket.id} joined task ${taskId}`);
    socket.join(`task-${taskId}`);
  })

  // socket.on('reply', (data)=>{
  //   console.log(`Reply received ${JSON.stringify(data, null, 2)}`)

  //   const {taskId, reply} = data

  //   if(!taskId || !reply){
  //     console.error('Invalid reply data', data);
  //     return;
  //   }

  //   // Emit a notification to the task room
  //   io.to(`task-${taskId}`).emit('notification',{
  //     message: `New reply on task ${data.taskId}`,
  //     reply: data.reply
  //   })
  // })
  socket.on('reply', (data) => {
    console.log(`Reply received ${JSON.stringify(data, null, 2)}`);
  
    const { taskId, noteId, reply, user } = data;
  
    if (!taskId || !noteId || !reply) {
      console.error('Invalid reply data', data);
      return;
    }
  
    // Emit the unified 'new-reply' event to the task room
    io.to(`task-${taskId}`).emit('new-reply', {
      taskId,
      noteId,
      reply,
      user,
      message: `${user} replied to a note`,
    });

    console.log('Reply emitted to frontend:', { taskId, noteId, reply, user });
  });

  
  // Handle disconnections
  socket.on('disconnect', ()=>{
    console.log('User disconnected:', socket.id);
  })
})

// Start the server
server.listen(PORT, ()=>{
  console.log(`Server is running on port ${PORT}`); 
  console.log(`WebSocket server is also running on port ${PORT}`);
})


// app.listen(PORT, (req, res)=>{
//     console.log(`Server is running on port ${PORT}`)
// })

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});