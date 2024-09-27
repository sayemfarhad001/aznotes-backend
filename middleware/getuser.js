const jwt = require('jsonwebtoken')
require('dotenv').config();
const JWT_SECRETKEY = process.env.JWT_SECRETKEY;

const getuser = (req, res, next)=>{
    //Get User from jwt token and add id to req object
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error: "/getfuserToken invalid"})
    }
    
    try {
        const data = jwt.verify(token, JWT_SECRETKEY);
        req.user = data.user;
        console.log('getuser', req.user)
        next()
    }catch(error){
        res.status(401).send({error: "Please authenticate using a valid token"})
    }
}

module.exports = getuser;
