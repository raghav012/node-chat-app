//this is the module used to define the actual path of nay folder
const path =require('path');
//this is used t store the actual path of the public folder
const  publicPath= path.join(__dirname,'/../public');
//this module is the main which is used to setup the server
const http = require('http');
//this is used to make complex actions of node easy to implements
const express = require('express');
//this the actula package use to set up the web sockets
const socketIO = require('socket.io'); 
//this is nomally done by the host and process.env is a global variable define by node
//here it define the actual port to be used to listen  
const port = process.env.PORT || 3000;
//intilaization of express app
var app = express();
//creating of web server 
var server = http.createServer(app);
//passing of webserver to the define socket
var io = socketIO(server);
//this simply making of public folder as actually public 
app.use(express.static(publicPath));

//this is the intial setup up of io connection for websocket
io.on('connection', (socket) => {
  console.log('New user connected');
 //emit is used to actually send any aur create any data and send it to only to paticular listener
//   socket.emit('newMessage', {
//     from: 'John',
//     text: 'See you then',
//     createdAt: 123123
//   });

  //the on keyword is used to actual listen to an action it is same as event listener
  //it contain actual name of event and a callback function
  socket.on('createMessage', (message) => {
    console.log('createMessage', message);
    //smae as that of socket.emit but differnece it that socket.emit is for particular client but io.emit will send to all the listener even to those who send it
    //console.log(message.from,mesage.text);
    io.emit('newMessage',{
       from:message.from,
       text:message.text,
       createdAt: new Date().getTime()

    });
  });
//this disconnect here is also a pre define event handler which trigger ig client become inactive
  socket.on('disconnect', () => {
    console.log('User was disconnected');
    
  });
});

//this the acutal setup of server with websocket at predefine port
server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
