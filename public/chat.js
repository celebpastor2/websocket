
//const socket = new WebSocket('ws://localhost:9000');
sendMessage.onclick = function(){
    const text = message.value;

    if(text){
        //sent the message
       
        //socket.send({message:text, sender:"", reciever:"", channel:""});
        const messageCont = document.createElement("div");
        messageCont.classList.add("message");
        messageCont.classList.add("sent");
        messageCont.innerText = `${text}`;
        messageBox.appendChild(messageCont);
        message.value = "";
        
        
    }
};