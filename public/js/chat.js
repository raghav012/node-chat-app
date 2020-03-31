var socket = io();


//this is use to scroll to bottom if msg are more than the window size
function scrollToBottom () {
  // Selectors
  var messages = jQuery('#messages');
//   var newMessage = messages.children('li:last-child')
  // Heights
//   var clientHeight = messages.prop('clientHeight');
//   var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
//   var newMessageHeight = newMessage.innerHeight();
//   var lastMessageHeight = newMessage.prev().innerHeight();

 // if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  //}
}


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
//this will help us to fetch the value of url contaning name chat room name as a object
var params = jQuery.deparam(window.location.search);
//this is how we have send this information to server
socket.emit('join', params, function (err) {
  if (err) {
    alert(err);
    window.location.href = '/';
  } else {
    console.log('No error');
  }
});



//in this we have to create event handler outside connect block  which is different from the server side other all is same
socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

//this is event handler which handle any new message and show it on the web
// socket.on('newMessage', function (message) {
//     console.log('newMessage', message);
//   //this is simply dom manipulation of the incoming message  
//   var formattedTime = moment(message.createdAt).format('h:mm a');
//   var li = jQuery('<li></li>');
//   li.text(`${message.from} ${formattedTime}: ${message.text}`);

  
//     jQuery('#messages').append(li);
//   });

//  //this is same as above but is use to add link of the location to be used 
//   socket.on('newLocationMessage', function (message) {
//    //moment is a module which help us to identify time in correct format and implemnt it
//     var formattedTime = moment(message.createdAt).format('h:mm a');
//   var li = jQuery('<li></li>');
//   var a = jQuery('<a target="_blank">My current location</a>');

//   li.text(`${message.from} ${formattedTime}: `);
//     a.attr('href', message.url);
//     li.append(a);
//     jQuery('#messages').append(li);
//   });

socket.on('updateUserList', function (users) {
  var ol = jQuery('<ol></ol>');

  users.forEach(function (user) {
    ol.append(jQuery('<li></li>').text(user));
  });

  jQuery('#users').html(ol);
});



//the above implementation these two are simple and from strach
//this implementation is with the the help of Mustache 
//this create a template format in which we pass the information in simple form
socket.on('newMessage', function (message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    //getting the template as define in index.html
    var template = jQuery('#message-template').html();
    //passing the infromation actually required by it
    var html = Mustache.render(template, {
      text: message.text,
      from: message.from,
      createdAt: formattedTime
    });
    //finally adding to correct area
    jQuery('#messages').append(html);
    scrollToBottom();
  });
  
  socket.on('newLocationMessage', function (message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = jQuery('#location-message-template').html();
    var html = Mustache.render(template, {
      from: message.from,
      url: message.url,
      createdAt: formattedTime
    });
    jQuery('#messages').append(html);
    scrollToBottom();
});





  //this is used to restrict the nomal fn of form submit button that is to refresh and to do what we wnt to do
  jQuery('#message-form').on('submit', function (e) {
    e.preventDefault();
  
    var messageTextbox = jQuery('[name=message]');

  socket.emit('createMessage', {
    from: 'User',
    text: messageTextbox.val()
  }, function () {
    messageTextbox.val('')
  });

  });
  


//this below is the code to fetch the onclick option and fetcht the location and then emit it  
 
var locationButton = jQuery('#send-location');
locationButton.on('click', function () {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser.');
  }

  locationButton.attr('disabled', 'disabled').text('Sending location...');

  navigator.geolocation.getCurrentPosition(function (position) {
    locationButton.removeAttr('disabled').text('Send location');
    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
  }, function () {
    locationButton.removeAttr('disabled').text('Send location');
    alert('Unable to fetch location.');
  });
});
