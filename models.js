const mongoose = require("mongoose")
const {Schema, model}  = mongoose;

const User = new Schema({
    user_id: {
        type: Schema.Types.String,
        required:true,
        unique: true,
        lowercase: true,
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
    channel_description:String
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