var socket = io();
//this same as done at server side 
//this will open a connection
socket.on('connect', function () {
  console.log('Connected to server');
//this same as that of server this will trigger the "on" fn with name createMessage at server side
//   socket.emit('createMessage', {
//     from: 'Andrew',
//     text: 'Yup, that works for me.'
//   });
});
//in this we have to create event handler outside connect block  which is different from the server side other all is same
socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

socket.on('newMessage', function (message) {
  console.log('newMessage', message);
});
