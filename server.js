const express = require('express')
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 8001;
var x = 1;
const users = {};
const usersColors = {};
var usersTyping = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/interface.html');
});
forceNew: true;
app.use("/static", express.static('./static/'));

io.on('connection', socket => {
    
    if(socket.id != undefined){
        socket.on('new user', name => {
            name = checkNamesForSpaces(name);
            users[socket.id]= name;
            usersColors[socket.id] = getRandomColor();
            
            console.log(users[socket.id] + ' logged in')
            socket.emit('new user',name);
            socket.broadcast.emit('new user', name );
          });
        socket.on('chat message', msg => {
            var i = 0;
            do {
                if (msg.length == 1) {
                    break
                }
                if (i == msg.length-1 || msg.charAt(i-1) == ' '){
                    return;
                }
                if (msg.charAt(i) == ' '){
                    msg.replace (msg.charAt(i) , '');
                }
                else{
                    break;
                }
                i++;
              }
              while (i = msg.length);
            
            if (msg.length == 0){
                return;
            }
            if (users[socket.id] != null) {
            socket.emit('chat message', {msg : msg , name : users[socket.id] + ' : ',color : usersColors[socket.id]});
            socket.broadcast.emit('chat message', {msg : msg , name : users[socket.id] + ' : ',color : usersColors[socket.id]});
            }else{
                
            }
        });
        
        socket.on('userTyping', () => {
            if (users[socket.id] != null) {
                if (usersTyping.indexOf(users[socket.id]) == -1){
                    usersTyping.push(users[socket.id]);
                    socket.emit('userTyping', usersTyping);
                    socket.broadcast.emit('userTyping', usersTyping);
                }
            }
        })

        socket.on('userStopedTyping', () => {
            if (users[socket.id] != null) {
                usersTyping.splice(socket.id)
                socket.emit('userTyping', usersTyping);
                socket.broadcast.emit('userTyping', usersTyping);
            }
        })

        socket.on('disconnect', () => {
            if (users[socket.id] != null) {
                console.log(users[socket.id] + ' logged off')
                socket.emit('userLeft', users[socket.id]);
                socket.broadcast.emit('userLeft', users[socket.id]);
                socket.emit('chat message', { msg: users[socket.id] + ' logged off', name: "server : " });
                socket.broadcast.emit('chat message', { msg: users[socket.id] + ' logged off', name: "server : " });
            }
        })
    }else{
        console.log('socket null');
    }
    
  });

  

http.listen(port, function(){
  console.log('server is listening on *:' + port);
});

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

function checkNamesForSpaces(name){
    var i = 0;
           
    if (name.charAt(i) == ''){
        name = 'Anonymous ' + x
            x++;
    }

    do {
        if (name.charAt(i) == ' '){
            i++;
        }else{
            break;
        }
        if (i == name.length){
            name = 'Anonymous ' + x
            x++;
        }
    }
    while (i < name.length);

    return name;
}