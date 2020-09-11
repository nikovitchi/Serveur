const express = require('express')

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const pool = require('./database');
var port = process.env.PORT || 8001;
var anonymousCount = 1;
var users = [];
const usersColors = {};
var usersTyping = [];
const url="http://192.168.0.109:5000/";
var axios = require('axios');


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/interface.html');
});

app.use("/static", express.static('./static/'));

io.on('connection', socket => {

        //Call when a 'new user' event is received
        socket.on('new user', user => {
            getUserWithNameFromDB(user.name).then ((res) =>{
                if (res.data.name != undefined){
                    console.log('user found already');
                    user = res.data;
                    users[socket.id] = user;
                }else{
                    console.log('no user found with this name');
                    user.name = checkNamesForSpaces(user.name);
                    users[socket.id] = user;
                    addUserToDB(user);
                }
            io.emit('new user', user);
            }).catch((e)=>{
                console.log("new user made :"+e.message)
            })   
        })

        socket.on('request all messages', user =>{
            getAllMessagesFromDB().then ((res) =>{
               //console.log(res);
                io.to(user.socketID).emit('initiate Messages', res.data);
            }).catch((e)=>{
                console.log("request all messages made :"+e.message)
            })
            })
        
        //Call when a 'chat message' event is received
        socket.on('chat message', msg => {
            addMessageToDB(msg,users[socket.id].name,"need to add date",users[socket.id].color).then((res)=>{
            // msg = msg.replace("inch", "****");
            msg = msg.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            if (!msg || /^\s*$/.test(msg)) {return;}
            if (users[socket.id] != null) {
                io.emit('chat message', {
                    msg: msg,
                    user: users[socket.id].name + ' : ',
                    color : users[socket.id].color,
                    socketID : users[socket.id].socketID
                });
            }
            }).catch((e)=>{
                console.log("chat message made :"+e.message)
            })
        
        
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
                console.log(users[socket.id].name + ' logged off')
                io.emit('userLeft', users[socket.id]);
                io.emit('chat message', { msg: users[socket.id].name + ' logged off', user: "server : " });
            }
           
        })

        








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

//DB Functions

function addUserToDB(user){
    axios.post(
        url+'users',
    {
        name : user.name,
        color : user.color,
        logTime : user.logTime,
        socketID : socket.id
    }
    )
}

async function getAllUsersFromDB() {
    return Promise.resolve(
        await axios.get(url + 'users',)
    )
}

async function getUserWithNameFromDB(userName) {
    return Promise.resolve(
        await axios.get(url + 'users/'+ userName)
    )
}

async function getAllMessagesFromDB() {
    return Promise.resolve(
        await axios.get(url + 'messages/')
    )
}

async function addMessageToDB(message, senderName, sendTime, color) {
    return Promise.resolve(await axios.post(
        url + 'messages',
        {
            message: message,
            senderName: senderName,
            sendTime: sendTime,
            color: color
        })
    )
}
    

});


http.listen(port, function () {
    console.log('server is listening on *:' + port);
});