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

            // // To check password
            // bcrypt.compareSync("B4c0/\/", hash);        //true
            // bcrypt.compareSync("not_bacon", hash);      //false
            
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: securedPassword,
            });


            // jsonwebtokenJs - USE JWT TOKEN
            const authToken = jwt.sign(
                { 
                    exp: Math.floor(Date.now() / 1000) + (60 * 60),
                    id: user.id 
                }, 
                JWT_SECRETKEY);
            // const authToken = jwt.sign(
            //     { 
            //         exp: Math.floor(Date.now() / 1000) + (60 * 60),
            //         id: user.id 
            //     }, 
            //     JWT_SECRETKEY, 
            //     { algorithm: 'RS256' });
            res.json({authToken: authToken});

        } catch (error) {
            console.error(error.message);
            res.status(500).json({error: "Error occured"});
        }
});

module.exports = router;