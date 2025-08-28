const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId:{type:String, required:true},
    videoId:{type:String, required:true},
    commentText:{type:String, required:true},
    
    
},{timestamps:true});

module.exports = mongoose.model('Comment', commentSchema);