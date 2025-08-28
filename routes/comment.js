const express = require('express')
const Router = express.Router()
const mongoose = require('mongoose')
const Comment = require('../models/Comment')
const checkAuth = require('../middleware/checkAuth')
const jwt = require('jsonwebtoken')

Router.post('/new-comment/:videoId',checkAuth, async(req,res)=>{
    try
    {
       const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],'Liza loves Debraj') 
       console.log(verifiedUser)
       const newComment = new Comment({
        _id:new mongoose.Types.ObjectId,
        videoId:req.params.videoId,
        userId:verifiedUser._id,
        commentText:req.body.commentText
         })

        const comment = await newComment.save()
        res.status(200).json({
            newComment:comment
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({error:err})
    }
})

//get all comments for a video
Router.get('/:videoId', async(req,res)=>{
    try
    {
       const comments = await Comment.find({videoId:req.params.videoId}).populate('userId','channelName logoUrl')
       res.status(200).json({
        commentList:comments
       })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({error:err})
    }
})

//like api
Router.put('/like/:commentId',checkAuth,async(req,res)=>{
    try
    {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(' ')[1], 'Liza loves Debraj'); 
        console.log(verifiedUser);
        const comment = await Comment.findById(req.params.commentId)
        console.log(comment);
        if(comment.likedBy.includes(verifiedUser._id))
        {
            return res.status(500).json({
                error:'You have already liked this comment'
            });
        }

        if(comment.dislikedBy.includes(verifiedUser._id))
        {
            comment.dislike -= 1;
            comment.dislikedBy = comment.dislikedBy.filter(userId => userId.toString() !== verifiedUser._id);
        }
        comment.likes += 1;
        comment.likedBy.push(verifiedUser._id);
        await comment.save();
        res.status(200).json({
            message:'Comment liked',
            
        });
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:err});
    }
});
//dislike api
Router.put('/dislike/:commentId',checkAuth,async(req,res)=>{
    try
    {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(' ')[1], 'Liza loves Debraj'); 
        console.log(verifiedUser);
        const comment = await Comment.findById(req.params.commentId)
        console.log(comment);
        if(comment.dislikedBy.includes(verifiedUser._id))
        {
            return res.status(500).json({
                error:'You have already disliked this comment'
            });
        }

        if(comment.likedBy.includes(verifiedUser._id))
        {
            comment.likes -= 1;
            comment.likedBy = comment.likedBy.filter(userId => userId.toString() !== verifiedUser._id);
        }
        comment.dislike += 1;
        comment.dislikedBy.push(verifiedUser._id);
        await comment.save();
        res.status(200).json({
            message:'Comment disliked',
            
        });
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:err});
    }
});


module.exports = Router;