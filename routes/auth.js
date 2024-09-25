const express = require('express')
const User = require('../models/User')
// const Notes = require('../models/Notes')
const router = express.Router()

// Create a User using: POST "/api/auth". Doesn't require Auth
router.post('/', (req, res) => {
    console.log(req.body)
    const user = User(req.body);
    user.save();
    // REQUEST SAMPLE JSON
    // {
    //     "name": "Harry",
    //     "email": "aznotes@gmail.com",
    //     "password": "1234567"
    // }
    res.send(req.body)
})

module.exports = router;