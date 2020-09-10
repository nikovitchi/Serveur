const express = require('express')
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 8001;
var anonymousCount = 1;
const users = {};
const usersColors = {};
var usersTyping = [];

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/interface.html');
});

app.use("/static", express.static('./static/'));

io.on('connection', socket => {

        //Call when a 'new user' event is received
        socket.on('new user', name => {
            name = checkNamesForSpaces(name);
            users[socket.id] = name;
            usersColors[socket.id] = getRandomColor();

            console.log(users[socket.id] + ' logged in')
            io.emit('new user', name);
        });

        //Call when a 'chat message' event is received
        socket.on('chat message', msg => {
            msg = checkMessagesIfEmpty(msg);
            if (msg.length == 0) {return;}
            if (users[socket.id] != null) {
                io.emit('chat message', { msg: msg, name: users[socket.id] + ' : ', color: usersColors[socket.id] });
            }
        });

        //Call when a 'userTyping' event is received
        socket.on('userTyping', () => {
            if (users[socket.id] != null) {
                if (usersTyping.indexOf(users[socket.id]) == -1) {
                    usersTyping.push(users[socket.id]);
                    io.emit('userTyping', usersTyping);
                }
            }
        })

        //Call when a 'userStopedTyping' event is received
        socket.on('userStopedTyping', () => {
            if (users[socket.id] != null) {
                usersTyping.splice(socket.id)
                io.emit('userTyping', usersTyping);
            }
        })

        //Call when a user disconnects
        socket.on('disconnect', () => {
            if (users[socket.id] != null) {
                console.log(users[socket.id] + ' logged off')
                io.emit('userLeft', users[socket.id]);
                io.emit('chat message', { msg: users[socket.id] + ' logged off', name: "server : " });
            }
        })
});

http.listen(port, function () {
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

function checkNamesForSpaces(name) {
    var i = 0;

    if (name.charAt(i) == '') {
        name = 'Anonymous ' + anonymousCount
        anonymousCount++;
    }

    do {
        if (name.charAt(i) == ' ') {
            i++;
        } else {
            break;
        }
        if (i == name.length) {
            name = 'Anonymous ' + anonymousCount
            anonymousCount++;
        }
    }
    while (i < name.length);

    return name;
}

function checkMessagesIfEmpty(msg){
    var i = 0;
            do {
                if (msg.length == 1) {
                    break
                }
                if (i == msg.length - 1 || msg.charAt(i - 1) == ' ') {
                    return;
                }
                if (msg.charAt(i) == ' ') {
                    msg.replace(msg.charAt(i), '');
                }
                else {
                    break;
                }
                i++;
            }
            while (i = msg.length);

            return msg;
}