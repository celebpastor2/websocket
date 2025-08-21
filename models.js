const mongoose = require("mongoose")
const bcrypt    = require("bcrypt")
const {Schema, model}  = mongoose;

const User = new Schema({
    user_id: {
        type: Schema.Types.String,
        required:true,
        unique: true,
        lowercase: true,
    },
    username: {
        type: String,
        required: true,
        unique:true,
        lowercase:true
    },
    phone_number : {
        type:String,
        default:""
    },
    email : {
        type:String,
        unique:true,
        required:false
    },
    password : {
        type:String,
        required:true
    },
    first_name : String,
    last_name: String,

    timestamp:Date
});
const Channels = new Schema({
    channel_id: {
        type:String,
        unique:true,
        require:true
    },
    users : [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    channel_name: String,
    channel_description:String,
    channel_icon:String
});
const Message = new Schema({
    message_id: {
        type:String,
        unique:true,
        required:true
    },
    message: {type:String, default:""},
    sender : {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reciever : {
        type: Schema.Types.ObjectId,
        ref: 'User',        
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "Channel"
    },
    timestamp:Date
});


User.methods.get_id = function(){
    return this.user_id;
}

User.methods.load_chats = function(){
    const id = this._id;
    const messages = Message.find();

    const user_messages = messages.filter((message)=>{
       const user = message.sender;
       return user._id == id;
    });

    return user_messages;
}

User.methods.comparePassword = function(password){
    return bcrypt.compareSync( password, this.password );
}

User.pre("save", function(){
     this.password = bcrypt.hashSync(this.password, 10);
});

User.pre("deleteOne", function(){
    const id = this.get_id();
    const channel = model( "Channel", Channels);
    const allChannel = channel.find();

    allChannel.forEach(()=>(channel)=>{
        const channel_user = channel.populate('users');

        channel_user.forEach((user, index)=>{
            if( user._id == id ){
                delete channel_user[index];
            }
        });
    });
})


//usage 
//const user = new User(id=id)
//const user_id = user.get_id();

User.statics.find_user_by_id = function(id){
    return this.findOne(chat_id=id);

}

//usage 
//User.find_one_by_id(id)

const exportation = {
    User: model( "User", User),
    Channel: model( "Channel", Channels),
    Message: model( "Message", Message)
};

module.exports = exportation;