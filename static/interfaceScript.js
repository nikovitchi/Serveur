
$(function () {
    var clientSocket = io.connect();
    var userName = '';
    var listItems = document.getElementById("messages").getElementsByTagName("li");
    var typing = false;
    var connectedUsers = [];
    var currentUser ;
    
       
    clientSocket.on('connect', () => {
      userName = prompt('Type your name here.')
        if(userName == null){
            userName = '';
        }
        currentUser = {
            name: userName,
            id: clientSocket.id,
            color: getRandomColor()
        }
        //Call when the clientSocket get created.
        clientSocket.emit('new user', currentUser);
    });

    clientSocket.on('userLeft', user => {
      // if(connectedUsers){
        // connectedUsers.map(function(e) {return e.id;}).indexOf()
        const index = connectedUsers.findIndex(e => e.id === user.id);
        console.log(index, user);
        if(index > -1) {
          console.log("here2");
          connectedUsers.splice(index, 1);
          console.log(connectedUsers);
        }
        $('#'+user.id).remove();
        $('#nbrContact').text(connectedUsers.length);
      // }
    })

    //Call when a 'new user' event is emitted to this client.
    clientSocket.on('new user', user => { 
        connectedUsers.push(user);
        if(currentUser.id == user.id){
            $('#messages').append($('<li>').text("You logged in"));
            listItems[listItems.length-1].style.left = "0%";
        }else{
            $('#messages').append($('<li>').text(user.name + " logged in"));
            listItems[listItems.length-1].style.left = "65%";
        }
        listItems[listItems.length-1].style.background = "#4682B4";
        console.log(connectedUsers);
        $('#nbrContact').text(connectedUsers.length)
        if(connectedUsers){
          $('#contactList').append($('<li id="'+ user.id +'" class="list-group-item d-flex justify-content-between lh-condensed">\
          <div>\
            <h6 class="my-0">'+ user.name +'</h6>\
            <small class="text-muted">Brief description</small>\
          </div>\
          <span class="text-muted">connected</span>\
        </li>'))
        }
        $('html,body').stop().animate({ scrollTop: $("html, body")[0].scrollHeight }, 1000);
    });

    //Call when the textfield content is sent by pressing the button or enter.
    $('form').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        clientSocket.emit('chat message', $('#textField').val());
        $('#textField').val('');
        return false;
    });

    //Get user typing state.
    $('#textField').on('keydown', function () {
        if (!typing) {
            typing = true;
            clientSocket.emit('userTyping');
            var checkUserStoped = setInterval(function () {
                typing = false;
                clientSocket.emit('userStopedTyping')
                clearInterval(checkUserStoped);
            }, 5000)
        }
    });

    //Call when another user on the same clientSocket starts typing
    clientSocket.on('userTyping', function (usersTyping) {
        var usersTypingText = '';
        if (usersTyping.length == 0) {
            usersTypingText = usersTyping[0];
            $('#isWriting').text('');
        } else if (usersTyping == 1) {
            usersTypingText = usersTyping[0];
            $('#isWriting').text(usersTypingText + ' typing');
        } else {
            for (var i = 0; i < usersTyping.length; i++) {
                if (i == usersTyping.length - 1) {
                    usersTypingText = usersTypingText + usersTyping[i];
                } else {
                    usersTypingText = usersTypingText + usersTyping[i] + ' and ';
                }
            }
            $('#isWriting').text(usersTypingText + ' typing');
        }
    })

    //Call when a 'chat message' event is received
    clientSocket.on('chat message', msg => {
        if (currentUser.id == msg.id) {
            $('#messages').append($('<li>').text("You : " + msg.msg));
            listItems[listItems.length-1].style.left = "0%";
        } else {
            $('#messages').append($('<li>').text(msg.user + msg.msg));
            listItems[listItems.length-1].style.left = "65%";
            playSound("/static/notify.mp3");
        }
        listItems[listItems.length-1].style.background = msg.color;
        $('html,body').stop().animate({ scrollTop: $("html, body")[0].scrollHeight }, 1000);
    });

})

function playSound(url) {
    const audio = new Audio(url);
    audio.volume = 0.2;
    audio.play();
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}