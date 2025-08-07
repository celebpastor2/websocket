const http = require("http")//this makes it suitable to be used for a backend system
const crypto = require("crypto")
const {functionToImport, anotherToImport} = require("./other_file.js")
const fs    = require("fs")
const path  = require("path")
const ws    = require("ws")
const html  = fs.readFileSync(path.join(__dirname, "frontend.html"))
const server = http.createServer((req, res)=>{
    //every thing here handles your normal http call and response
    res.writeHead(200, {
        "content-type":"text/html"
    });
    
    res.end(functionToImport( html ));
});

const wss   = new ws.Server({server})

wss.on("connection", (socket)=>{
    socket.on("message", (message)=>{
        console.log("Message recieved from Client is: ", message)
        socket.send("Reply from server");
    });

    socket.send("Message from Server")
});

const PORT = 9000;
server.listen(PORT, ()=>{
    console.log(`server started successfully 0n port: ${PORT}`);
});