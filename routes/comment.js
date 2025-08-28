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


module.exports = Router;