
$(function () {
    var socket = io.connect();
    var x=0; 
    var ul = document.getElementById("messages");
    var listItems = ul.getElementsByTagName("li");
    const name = prompt('Ki Semak Ellah ?');
    var colorPicker = document.getElementById("color");
    var typing = false;
    //socket.emit('color changed', name);
    //colorPicker.addEventListener("input", function () {
    //res.innerHTML = c.value;
  //}, false);

    socket.emit('new user', name);

    socket.on('new user', (name) => {
        $('#messages').append($('<li>').text(name + " logged in"));
          listItems[x].style.background = "#4682B4";
          x++
          window.scrollTo(0, document.getElementById("messages").scrollHeight);
         
    });

    $('form').submit(function(e) {
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#textField').val());
        $('#textField').val('');
        return false;
    });

    $('#textField').on('keydown', function(name){
        if (!typing){
            typing = true;
            socket.emit('userTyping');
            var checkUserStoped = setInterval(function(){
                typing = false;
                socket.emit('userStopedTyping')
                clearInterval(checkUserStoped);
            },5000)            
        }
        
        
    });



    socket.on('userTyping', function(usersTyping){
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


        socket.on('userStopedTyping',()=>{
            typing = false;
        });
        
        socket.on('chat message', function(msg){
            $('#messages').append($('<li>').text(msg.name + msg.msg)); 
              listItems[x].style.background = msg.color;
              x++;             
              $('#messages').stop().animate({ scrollTop: $("#messages")[0].scrollHeight}, 1000);
        });
          
            

        socket.on('refresh', ()=>{
            window.location.reload(false);
        });

    })

    
    
    


