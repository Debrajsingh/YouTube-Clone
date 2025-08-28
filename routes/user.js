const express = require("express");
const Router = express.Router();
const User = require("../models/User");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/checkAuth");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

Router.post("/signup", async (req, res) => {
  try {
    const users = await User.find({ email: req.body.email });
    if (users.length > 0) {
      return res.status(500).json({
        error: "User with this email already exists",
      });
    }

    const hashCode = await bcrypt.hash(req.body.password, 10);
    const uploadedImage = await cloudinary.uploader.upload(
      req.files.logo.tempFilePath
    );

    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      channelName: req.body.channelName,
      email: req.body.email,
      phone: req.body.phone,
      password: hashCode,
      logoUrl: uploadedImage.secure_url,
      logoId: uploadedImage.public_id,
    });

    const user = await newUser.save();
    res.status(200).json({
      newUser: user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

Router.post("/login", async (req, res) => {
  try {
    //console.log(req.body)
    const users = await User.find({ email: req.body.email });
    //console.log(users)
    if (users.length == 0) {
      return res.status(500).json({
        error: "User with this email does not exists",
      });
    }

    const isValid = await bcrypt.compare(req.body.password, users[0].password);
    //console.log(isValid)
    if (!isValid) {
      return res.status(500).json({
        error: "Incorrect Password",
      });
    }
    const token = jwt.sign(
      {
        _id: users[0]._id,
        channelName: users[0].channelName,
        email: users[0].email,
        phone: users[0].phone,
        logoId: users[0].logoId,
      },
      "Liza loves Debraj",
      {
        expiresIn: "365d",
      }
    );
    res.status(200).json({
      _id: users[0]._id,
      channelName: users[0].channelName,
      email: users[0].email,
      phone: users[0].phone,
      logoId: users[0].logoId,
      logoUrl: users[0].logoUrl,
      subscribers: users[0].subscribers,
      subscribedChannels: users[0].subscribedChannels,
      message: "Login Successful",
      token: token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

//subscribe api

Router.put("/subscribe/:userBId", checkAuth, async (req, res) => {
  try {
    const userA = await jwt.verify(
      req.headers.authorization.split(" ")[1],
      "Liza loves Debraj"
    );
    //userA is the one who is subscribing
    //userB is the one who is being subscribed to
    console.log(userA);
    const userB = await User.findById(req.params.userBId);
    console.log(userB);
    if (userB.subscribedBy.includes(userA._id)) {
      return res.status(500).json({
        error: "You have already subscribed to this channel",
      });
    }
    userB.subscribers += 1;
    userB.subscribedBy.push(userA._id);
    await userB.save();
    const userAFullInformation = await User.findById(userA._id);
    userAFullInformation.subscribedChannels.push(userB._id);
    await userAFullInformation.save();
    res.status(200).json({
      message: "Subscription successful",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

//unsubscribe api
Router.put("/unsubscribe/:userBId", checkAuth, async (req, res) => {
  try {
    const userA = await jwt.verify(
      req.headers.authorization.split(" ")[1],
      "Liza loves Debraj"
    );
    //userA is the one who is unsubscribing
    //userB is the one who is being unsubscribed from
    const userB = await User.findById(req.params.userBId);
    console.log(userA);
    console.log(userB);
    if (userB.subscribedBy.includes(userA._id) )
    {
      //unsubscribe logic
      userB.subscribers -= 1;
      userB.subscribedBy = userB.subscribedBy.filter(userId=> userId.toString() != userA._id);
      await userB.save();
      const userAFullInformation = await User.findById(userA._id);
      userAFullInformation.subscribedChannels = userAFullInformation.subscribedChannels.filter(userId=> userId.toString() != userB._id);
      await userAFullInformation.save();
      res.status(200).json({
        message: "Unsubscription successful",
      });
    }
    else{
      return res.status(500).json({
        error: "You are not subscribed to this channel",
      });
    }


  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});


module.exports = Router;
