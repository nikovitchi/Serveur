
$(function () {
    var socket = io.connect();
    const myName = prompt('Type your name here.');
    var listItems = document.getElementById("messages").getElementsByTagName("li");
    var typing = false;

    //Call when the socket get created.
    socket.emit('new user', myName);

    //Call when a 'new user' event is emitted to this client.
    socket.on('new user', (name) => {
        $('#messages').append($('<li>').text(name + " logged in"));
        listItems[listItems.length-1].style.background = "#4682B4";
        $('#messages').stop().animate({ scrollTop: $("#messages")[0].scrollHeight }, 1000);
    });

    //Call when the textfield content is sent by pressing the button or enter.
    $('form').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#textField').val());
        $('#textField').val('');
        return false;
    });

    //Get user typing state.
    $('#textField').on('keydown', function (name) {
        if (!typing) {
            typing = true;
            socket.emit('userTyping');
            var checkUserStoped = setInterval(function () {
                typing = false;
                socket.emit('userStopedTyping')
                clearInterval(checkUserStoped);
            }, 5000)
        }
    });

    //Call when another user on the same socket starts typing
    socket.on('userTyping', function (usersTyping) {
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
    socket.on('chat message', function (msg) {
        if (msg.name == myName + ' : ') {
            $('#messages').append($('<li>').text("You : " + msg.msg));
        } else {
            $('#messages').append($('<li>').text(msg.name + msg.msg));
        }
        listItems[listItems.length-1].style.background = msg.color;
        $('#messages').stop().animate({ scrollTop: $("#messages")[0].scrollHeight }, 1000);
    });

})






