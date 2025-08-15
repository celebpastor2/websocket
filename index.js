const http = require("http")//this makes it suitable to be used for a backend system
const crypto = require("crypto")
const env = require("dotenv")
env.config();
const {functionToImport, anotherToImport} = require("./other_file.js")
const fs    = require("fs")
const path  = require("path")
const ws    = require("ws")//websocket manager
const uuid  = require("uuid")//unique id system for our users
const { channel } = require("process")
const mongoose = require("mongoose")
const UserRoutes = require("./userRoutes.js")
const express = require("express")
const {User, Channel, Message} = require("./models.js")
const html  = fs.readFileSync(path.join(__dirname, "frontend.html"))
const app   = express()

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "html"));//load up a setting on your app


app.use(function(req, res, next){
    next()
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded());
//controllers 
app.all('/endpoint', function(req, res){
    res.render("index");
});

app.use(UserRoutes);


//test dynamism of ejs template
app.all('/second/endies', function(req, res){
    res.render("index", {
        title: "Second Template",
        text: "<p>Testing the Dynamism of EJS template</p>"
    });
});



const server = http.createServer((req, res)=>{
    //every thing here handles your normal http call and response
    res.writeHead(200, {
        "content-type":"text/html"
    });
    
    res.end(functionToImport( html ));
});

const production = process.env.ENVIRONMENT;
let uri         = process.env.LOCAL_SERVER;

if( production == "production")
    uri         = process.env.PRODUCTION_SERVER;


mongoose.connect(uri, {
    maxPoolSize: 10,
    socketTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    retryReads: true
});

console.log("connected database");

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

        console.log("Message recieved from Client is: ", message.toString("utf-8"))
        
        try {
            //messages must always be formatted in JSON format
            let text = JSON.parse( message.toString("utf-8") );

            if( text.former_user_id && text.former_user_id != text.chat_id ){
                const currentUser = User.findOne({user_id:text.chat_id});
                const formerUser = User.findOne({user_id:text.former_user_id});
            }

            const channel_info = channels[text.channel_id ?? 'general'];//checking if the variable if falsy

            if( text.channel_id && ! channels[text.channel_id] ){
                channels[text.channel_id] = {
                    sockets: new Set([{user_id: text.sender_id, socket }]),
                    users  : new Set([text.sender_id]),
                    creator_id: text.sender_id
                }

                if( text.recipient_id && channel_info.users.has(text.recipient_id)){
                    for( const user of channel_info.sockets ){
                        if( user.user_id == text.recipient_id ){
                           channels[text.channel_id].sockets.add(user);
                           channels[text.channel_id].users.add(text.recipient_id);
                           text.online_users = channels[text.channel_id].sockets.size;
                           user.socket.send(JSON.stringify(text));
                           break;
                        }
                    }
                }
                
            }

            else if( channel_info ){
                const users = channel_info.sockets;
                //channel_info.sockets.add(socket);

                if( text.recipient_id && channel_info.users.has(text.recipient_id) && text.sender_id ){
                    for( const user of channel_info.sockets ){
                        if( text.recipient_id == user.user_id ){
                            text.online_users = channel_info.sockets.size;
                            user.socket.send(JSON.stringify(text));
                            break;
                        }
                    }
                } else {
                     for( const user of users){
                        if( user.socket != socket ){
                            text.online_users = channel_info.sockets.size;
                            user.socket.send(JSON.stringify(text));
                        }

                            
                    }
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
    const user_socket = {
        user_id,
        socket
    };

    User.create({
        user_id,
    });
    channels['general'].sockets.add(user_socket);
    send_obj.online_users = channels['general'].sockets.size;

    socket.send(JSON.stringify(send_obj));
});

const PORT = 9000;
server.listen(PORT, ()=>{
    console.log(`server started successfully 0n port: ${PORT}`);
});

app.listen(9001, function(){
    console.log("express JS server started!");
});