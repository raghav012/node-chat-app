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

//this is a file which we have call for to make our work easy
const {generateMessage,generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
var users = new Users();
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
//this is actual checking of the parameter get from the  client side
socket.on('join', (params, callback) => {
  if (!isRealString(params.name) || !isRealString(params.room)) {
    callback('Name and room name are required.');
  }
  //this line here will open create different chat page with different chat room name
  socket.join(params.room);

  //this here is use to close that room only
  // socket.leave('The Office Fans');
  
  //this here is use to emit to all user join to particular chat room
  // io.emit -> io.to('The Office Fans').emit
  
//this here is use to emit to all user join to particular chat room except one who has send this
  // socket.broadcast.emit -> socket.broadcast.to('The Office Fans').emit
  // socket.emit
   if(users){
  users.removeUser(socket.id);
   }
   users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
    callback();
});




//these are the intial message that a user is join and to user tha welcome to him
// socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));

// //broadcast will send to all except to himself this is the only differnece between io.emit
// socket.broadcast.emit('newMessage', generateMessage('Admin', 'New user joined'));



//the on keyword is used to actual listen to an action it is same as event listener
  //it contain actual name of event and a callback function
  socket.on('createMessage', (message,callback) => {
    var user = users.getUser(socket.id);
    //smae as that of socket.emit but differnece it that socket.emit is for particular client but io.emit will send to all the listener even to those who send it
    //console.log(message.from,mesage.text);
    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    } //this callback used here is simply use as a acknowledgement from the server side that message is send properly to client side
    callback();
   
  });

  
//this the event handler for the catching the location generation variable 
  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);

    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));  
    }
   });


//this disconnect here is also a pre define event handler which trigger ig client become inactive
  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
    }
  });
    
  });



//this the acutal setup of server with websocket at predefine port
server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
