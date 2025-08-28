const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId:{type:mongoose.Schema.Types.ObjectId, required:true,ref:'User'},
    videoId:{type:String, required:true},
    commentText:{type:String, required:true},
    likes:{type:Number, default:0},
    dislike:{type:Number, default:0},
    likedBy:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    dislikedBy:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    
    
    
},{timestamps:true});

module.exports = mongoose.model('Comment', commentSchema);