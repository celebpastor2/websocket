const socket = new WebSocket('ws://localhost:9000');
sendMessage.onclick = function(){
    const text = message.value;

    if(text){
        socket.send({message:text, sender:"", reciever:"", channel:""});
    }
};