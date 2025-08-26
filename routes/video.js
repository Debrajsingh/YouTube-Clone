const express = require('express');
const Router = express.Router();
const checkAuth = require('../middleware/checkAuth');
jwt = require('jsonwebtoken');

Router.post('/upload',checkAuth,async(req,res) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        const user = await jwt.verify(token, 'Liza loves Debraj');
        console.log(user);
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:err});
    }
    
});


module.exports = Router;