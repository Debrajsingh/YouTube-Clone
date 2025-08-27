const express = require('express');
const Router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const Video = require('../models/Video');
const mongoose = require('mongoose');
const e = require('express');



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
            thumbnailId: uploadedThumbnail.public_id,
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

//update video detail
Router.put('/:videoId',checkAuth,async(req,res)=>{
    try{
        const verifiedUser = await jwt.verify(req.headers.authorization.split(' ')[1], 'Liza loves Debraj'); 
        const video = await Video.findById(req.params.videoId)
        console.log(video);

        if(video.user_id === verifiedUser._id)
        {
            //update video details
            if(req.files)
            {
                //update thumbnail and text data
                await cloudinary.uploader.destroy(video.thumbnailId);
                const updatedThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath);
                const updatedData = {
                    title: req.body.title,
                    description: req.body.description,
                    category: req.body.category,
                    tags: req.body.tags.split(','),
                    thumbnailUrl: updatedThumbnail.secure_url,
                    thumbnailId: updatedThumbnail.public_id,
                }

                const updatedVideoDetail = await Video.findByIdAndUpdate(req.params.videoId,updatedData,{ new: true })
                res.status(200).json({
                    updatedVideo: updatedVideoDetail
                })

               
            }
            else
            {
                const updatedData = {
                    title: req.body.title,
                    description: req.body.description,
                    category: req.body.category,
                    tags: req.body.tags.split(','),
                    
                }

                const updatedVideoDetail = await Video.findByIdAndUpdate(req.params.videoId,updatedData,{ new: true })
                res.status(200).json({
                    updatedVideo: updatedVideoDetail
                })
                


            }
            
            
        }
        else
        {
            return res.status(500).json({
                error:'You are not authorized to update this video'
            });
        }
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:err});
    }
});


// delete video
Router.delete('/:videoId',checkAuth,async(req,res)=>{


    try{

        const verifiedUser = await jwt.verify(req.headers.authorization.split(' ')[1], 'Liza loves Debraj'); 
        console.log(verifiedUser);
        const video = await Video.findById(req.params.videoId)
        if(video.user_id == verifiedUser._id)
        {
            //delete video ,thumbnail and data from db
            await cloudinary.uploader.destroy(video.videoId,{resource_type: "video"});
            await cloudinary.uploader.destroy(video.thumbnailId)
            const deletedResponse = await Video.findByIdAndDelete(req.params.videoId)
            res.status(200).json({
                message:'Video deleted successfully',
                deletedResponse:deletedResponse
            })

        }
        else
        {
            return res.status(500).json({
                error:'You are not authorized to delete this video'
            });
        }

    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:err});
    }
})

module.exports = Router;