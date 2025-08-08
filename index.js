const http = require("http")//this makes it suitable to be used for a backend system
const crypto = require("crypto")
const {functionToImport, anotherToImport} = require("./other_file.js")
const fs    = require("fs")
const path  = require("path")
const ws    = require("ws")
const uuid = require("uuid")
const { channel } = require("process")
const html  = fs.readFileSync(path.join(__dirname, "frontend.html"))
const server = http.createServer((req, res)=>{
    //every thing here handles your normal http call and response
    res.writeHead(200, {
        "content-type":"text/html"
    });
    
    res.end(functionToImport( html ));
});

const channels = {
    'general': {
        sockets: new Set(),
        users: new Set(),
    }
}

const wss   = new ws.Server({server})

wss.on("connection", (socket)=>{
    const user_id = uuid.v4()
    
    socket.on("message", (message)=>{
        console.log("Message recieved from Client is: ", message)
        
        try {
            let text = JSON.parse( message.toString("utf-8") );
            const channel_info = channels[text.chat_id];

            if( channel_info ){
                const users = channel_info.sockets;
                channel_info.sockets.add(socket);
            
                for( use in users){
                    if( use != socket )
                        use.send(JSON.stringify(text));
                }
            } else {
                channels[text.chat_id] = {}
                channels[text.chat_id].sockets = new Set();
                channels[text.chat_id].sockets.add(socket);
            }
        } catch(e){
            console.error("error sending message ", e);
            socket.send("Invalid Message format sent");
        }
        
    });

    const send_obj = {
        message: user_id,
        type: "set_user"
    };

    channels['general'].users.add(user_id);
    channels['general'].sockets.add(socket);

    socket.send(JSON.stringify(send_obj))
});

const PORT = 9000;
server.listen(PORT, ()=>{
    console.log(`server started successfully 0n port: ${PORT}`);
});