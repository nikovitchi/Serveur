
$(function () {
    var clientSocket = io.connect();
    var userName = '';
    var listItems = document.getElementById("messages").getElementsByTagName("li");
    var typing = false;
    var connectedUsers = [];
    var currentUser ;
    var d = new Date();
       
    clientSocket.on('connect', () => {
        
        i=0, msg = "Type your name here."
        do{
            i++;
            if(i > 1) msg = "dok hada assem, inch ?";
            userName = prompt(msg,'');
            if(userName == null){
                userName = '';
            }
        }while(userName.length > 20)

        currentUser = {
            name: userName,
            socketID: clientSocket.id,
            color: getRandomColor(),
            logTime : d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()
        }
        //Call when the clientSocket get created.
        clientSocket.emit('new user', currentUser);
        clientSocket.emit('request all messages', currentUser);
    });

    clientSocket.on('initiate Messages', res => {
        for (i=0 ; i<Math.min(50,res.length) ; i++){
            $('#messages').append($('<div class="form-group d-flex flex-column"><small class="form-text text-muted align-self-end" style="width:32%">'+ res[i].senderName +'</small><li class="text-break">'+ res[i].message +'</li></div>'))
            listItems[listItems.length-1].style.left = "65%";
            listItems[i].style.background = res[i].color;
        }
    })

    clientSocket.on('userLeft', user => {
        const index = connectedUsers.findIndex(e => e.socketID === user.socketID);
        if(index > -1) {
          connectedUsers.splice(index, 1);
        }
        $('#'+user.socketID).remove();
        $('#nbrContact').text(connectedUsers.length);
    })

    //Call when a 'new user' event is emitted to this client.
    clientSocket.on('new user', user => { 
        connectedUsers.push(user);


        // if(currentUser.socketID == user.socketID){
        //     $('#messages').append($('<li>').text("You logged in"));
        //     listItems[listItems.length-1].style.left = "0%";
        // }else{
        //     $('#messages').append($('<li>').text(user.name + " logged in"));
        //     listItems[listItems.length-1].style.left = "65%";
        // }
        // listItems[listItems.length-1].style.background = "#4682B4";
        //$('html,body').stop().animate({ scrollTop: $("html, body")[0].scrollHeight }, 1000);


        $('#nbrContact').text(connectedUsers.length)
        if(connectedUsers){
          $('#contactList').append($('<li id="'+ user.socketID +'" class="list-group-item d-flex justify-content-between lh-condensed">\
          <div>\
            <h6 class="my-0">'+ user.name +'</h6>\
            <small class="text-muted"> Connected on : '+ user.logTime + '</small>\
          </div>\
          <span class="text-muted">connected</span>\
        </li>'))
        }
        
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
    
        if (currentUser.socketID == msg.socketID) {
            // $('#messages').append($('<li class="text-break">').text("You : " + msg.msg));
            $('#messages').append($('<div class="form-group d-flex flex-column"><small class="form-text text-muted pl-4">You</small><li class="text-break">'+ msg.msg +'</li></div>'))
            listItems[listItems.length-1].style.left = "0%";
        } else {
            // $('#messages').append($('<li class="text-break">').text(msg.user + msg.msg));
            $('#messages').append($('<div class="form-group d-flex flex-column"><small class="form-text text-muted align-self-end" style="width:32%">'+ msg.user +'</small><li class="text-break">'+ msg.msg +'</li></div>'))
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