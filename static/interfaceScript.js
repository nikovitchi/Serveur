
$(function () {
    var clientSocket = io.connect();
    var anonymousCount = 1;
    var myName = prompt('Type your name here.');
    var listItems = document.getElementById("messages").getElementsByTagName("li");
    var typing = false;
    var title = document.title;
    

    //Call when the clientSocket get created.
    clientSocket.emit('new user', myName);

    //Call when a 'new user' event is emitted to this client.
    clientSocket.on('new user', (name) => { 
        if(clientSocket.socket.sessionid == myName){
            $('#messages').append($('<li>').text("You logged in"));
            listItems[listItems.length-1].style.left = "0%";
        }else{
            $('#messages').append($('<li>').text(name + " logged in"));
            listItems[listItems.length-1].style.left = "65%";
        }
        listItems[listItems.length-1].style.background = "#4682B4";
        $('#messages').stop().animate({ scrollTop: $("#messages")[0].scrollHeight }, 1000);
    });

    //Call when the textfield content is sent by pressing the button or enter.
    $('form').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        clientSocket.emit('chat message', $('#textField').val());
        $('#textField').val('');
        return false;
    });

    //Get user typing state.
    $('#textField').on('keydown', function (name) {
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
    clientSocket.on('chat message', function (msg) {
        
        if (msg.name == myName + ' : ') {
            $('#messages').append($('<li>').text("You : " + msg.msg));
            //listItems[listItems.length-1].innerHTML = "hi";
        } else {
            $('#messages').append($('<li>').text(msg.name + msg.msg));
            //listItems[listItems.length-1].innerHTML = "hi";
            playSound("/static/notify.mp3");
        }
        listItems[listItems.length-1].style.background = msg.color;
        $('#messages').stop().animate({ scrollTop: $("#messages")[0].scrollHeight }, 1000);
        if(msg.name == myName + ' : '){
            
            listItems[listItems.length-1].style.left = "0%";
        }else{
            listItems[listItems.length-1].style.left = "65%";
        }
    });

})





function playSound(url) {
    const audio = new Audio(url);
    audio.volume = 0.2;
    audio.play();
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