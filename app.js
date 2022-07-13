// this is simple node js server for backend 
const express = require('express');
const app = express();

console.log("hi this is node js backend server code for building the backend using nodejs for solveit-app")

const port = 8080;

app.get("/", (req, res)=>{
    console.log("this is root route for this server\n");
    res.send("Hi from the backend or server side. Building process has been started");
})

// making a simple server here 
app.listen(port, ()=>{
    console.log(`listening at the port ${port}`);
})