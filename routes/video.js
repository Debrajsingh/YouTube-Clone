const express = require('express');
const Router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const Video = require('../models/Video');
const mongoose = require('mongoose');


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

Router.post('/upload',checkAuth,async(req,res) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        const user = await jwt.verify(token, 'Liza loves Debraj');
        //console.log(user);
        //console.log(req.body);
        //console.log(req.files.video);
        //console.log(req.files.thumbnail);
        const uploadedVideo = await cloudinary.uploader.upload(req.files.video.tempFilePath,{
            resource_type: "video"
        });
        const uploadedThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath);
        
        const newVideo = new Video({
            _id: new mongoose.Types.ObjectId(),
            title: req.body.title,
            description: req.body.description,
            user_id: user._id,
            videoUrl: uploadedVideo.secure_url,
            videoId: uploadedVideo.public_id,
            thumbnailUrl: uploadedThumbnail.secure_url,
            thumbnailId: uploadedThumbnail.secure_url,
            category: req.body.category,
            tags: req.body.tags.split(','),
        });

        const newUploadedVideoData = await newVideo.save();
        res.status(200).json({
            newVideo: newUploadedVideoData
        });
        
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:err});
    }
    
});


module.exports = Router;