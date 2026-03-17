const mongoose = require("mongoose")

const roomSchema = new mongoose.Schema({
    roomId:{
        type:String,
        required:true
    },
    host:String,
    videoId:String,
    currentTime:{
        type:Number,
        default:0
    },
    isPlaying:{
        type:Boolean,
        default:false
    },
    participants:[
        {
            username:String,
            role:String
        }
    ]
})

module.exports = mongoose.model("Room",roomSchema)