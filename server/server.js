const express = require('express')
const app = express()

const PORT = process.env.PORT || 5000

app.use(express.json())


app.get('/', function(req,res){
    res.send('Welcome to the Task Manager application')
})



app.listen(PORT, (req,res)=>{
    console.log(`Server is running on port ${PORT}`)
})