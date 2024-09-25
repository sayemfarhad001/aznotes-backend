const express = require('express');
const User = require('../models/User');
// const Notes = require('../models/Notes');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRETKEY = 'AZisagoodA$ap';

// Create a User using: POST "/api/auth/createuser". No login required
router.post('/createuser',
    [
        body('name', "Enter a valid name").isLength({min: 3}),
        body('email', "Enter a valid email").isEmail(),
        body('password', "Password must be atleast 5 characters").isLength({min: 5}),
    ], 
    async (req, res) => {
        
        //If there are errors, return Bad request and the errors
        const errors = validationResult(req);    
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            //Check whether user with this email already exists
            let user = await User.findOne({email: req.body.email});
            if (user){
                return res.status(400).json({error: "Sorry a user with this email already exsists in the database"});
            }
            
            // bcryptJs - HASH PASSWORD
            const salt = await bcrypt.genSalt(10);
            const securedPassword = await bcrypt.hash(req.body.password, salt);
            
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: securedPassword,
            });

            // jsonwebtokenJs - create JWT TOKEN
            const payload = {
                exp: Math.floor(Date.now() / 1000) + (60 * 60),
                user:{
                    id: user.id
                }
            } 
            const authToken = jwt.sign( payload, JWT_SECRETKEY );
            // const authToken = jwt.sign( data, JWT_SECRETKEY, { algorithm: 'RS256' });
            res.json({authToken: authToken});

        } catch (error) {
            console.error(error.message);
            res.status(500).json({error: "Internal Server Error"});
        }
});


// Authenticate a User using: POST "/api/auth/login". Login required
router.post('/login',
    [
        body('email', "Enter a valid email").isEmail(),
        body('password', "Password cannot be blank").exists(),
    ], 
    async (req, res) => {
        
        //If there are errors, return Bad request and the errors
        const errors = validationResult(req);    
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        const {email,password} = req.body; 

        try {
            //Check whether user with this email already exists
            let user = await User.findOne({email});
            if (!user){
                return res.status(400).json({error: "Please try to login with correct credentials"});
            }

            // bcryptJs - Unhash Password
            const isValidPassword = await bcrypt.compareSync(password, user.password);     //true or false
            if(!isValidPassword){
                return res.status(400).json({error: "Please try to login with correct credentials"});
            }
            
            // jsonwebtokenJs - Check JWT TOKEN
            const payload = {
                exp: Math.floor(Date.now() / 1000) + (60 * 60),
                user:{
                    id: user.id
                }
            }
            const authToken = jwt.sign( payload, JWT_SECRETKEY );
            // const authToken = jwt.sign( data, JWT_SECRETKEY, { algorithm: 'RS256' });
            res.json({authToken: authToken});

        } catch (error) {
            console.error(error.message);
            res.status(500).json({error: "Internal Server Error"});
        }
});


module.exports = router;