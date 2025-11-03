const router = require('express').Router();
// eslint-disable-next-line no-unused-vars
const e = require('express');
const {User} = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

router.post('/login', async(req,res)=>{
    let {email, password} = req.body;
    console.log(email);
    let user = await User.authUser(email, password);
    if(!user){
        res.status(401).send({error: 'email or password not correct'});
        return;
    }

    

    let token = jwt.sign({ username: user.username, _id: user._id},process.env.TOKEN_KEY,{expiresIn: 60 * 60} );
    
    
    res.send({token});
});

router.post('/login2', async(req,res)=>{
    let {email, password} = req.body;
    console.log(email);
    let user = await User.authUser(email, password);
    if(!user){
        res.status(401).send({error: 'email or password not correct'});
        return;
    }

    

    let token = jwt.sign({ username: user.username, _id: user._id},process.env.TOKEN_KEY,{expiresIn: 60 * 60} );
    
    res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV == 'production'
    }).send({message: 'Logged'});

});

router.get('/logout', auth.validateTokenWithCookie, (req,res)=>{
    return res.clearCookie('access_token')
              .send({message: 'You are logged out'});
});


module.exports = router;