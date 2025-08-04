const http = require("http")
const crypto = require("crypto")
const server = http.createServer((req, res)=>{
    //every thing here handles your normal http call and response
    res.writeHead(200, {
        "content-type":"text/plain"
    });
    res.end("server Start On Port 9000");
});

server.addListener("upgrade", (req, socket, head)=>{
    if( req.headers['upgrade'] !== "websocket"){
        socket.end("HTTP/1.1 400 BAD Request");
        return;
    }

    key = req.headers['sec-websocket-key'];

    if( ! key ){
        socket.end("HTTP/1.1 400 Bad Request, Security Key not Found in the Request!");
        return;
    }

    const acceptKey = crypto.generateKeySync("hmac", {length: 24});

    const responseHeader = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-Websocket-Accept: ${acceptKey}`
    ];

    socket.write(responseHeader.join('\r\n') + '\r\n\r\n');

    console.log("Websocket Connection Established");
    //socket.end("Websocket connection Establish");

    socket.on('data', (data)=>{
        const result = parseWebsocketData(data);

        if( result.opcode === 1 ){
            const message = result.payload;
            console.log("Message Recieved, and the message is: ", message );
            //deal with message
           // sendSocketMessage(socket, message );
        } else if( result.opcode == 8 ){
            console.log("client disconnected from socket");
            socket.end();
        }
    });

    socket.on("end", ()=>{
        console.log("client has disconnected from socket");
    });
});


function parseWebsocketData(buffer){
    const firstByte = buffer.readUint8(0);
    const secondByte = buffer.readUint8(1);

    const opcode = firstByte & 0x0F;
    const isMasked = Boolean( secondByte & 0x80 );
    const payloadLength = secondByte & 0x7F;

    let maskStart = 2;//64 bit mask Start

    if( payloadLength === 126){
        payloadLength = buffer.readUint16BE(2);
        maskStart = 4;
    }

    else if(payloadLength === 127 ){
        payloadLength = buffer.readUint32BE(2);
        maskStart = 6;
    }

    const mask = buffer.slice(maskStart, maskStart + 4 );
    const payload = buffer.slice(maskStart + 4, maskStart + 4 + payloadLength );

    for( let x = 0; x < payload.length; x++){
        payload[i]  ^= mask[i % 4];
    }

    return {
        opcode,
        payload,
        isMasked
    }
}


const PORT = 9000;
server.listen(PORT, ()=>{
    console.log(`server started successfully 0n port: ${PORT}`);
});