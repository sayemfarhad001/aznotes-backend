const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const getuser = require('../middleware/getuser');

const Note = require('../models/Note');
// const getnotes = require('../middleware/getnotes');



// ROUTE 1 : Get all notes: GET "/getnotes". Login required
router.get('/getnotes', getuser, async (req, res) => {
    try{
        const notes = await Note.find({user: req.user.id})
        res.json(notes);
    } catch (error){
        console.error(error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
})

// ROUTE 2 : Add a new notes: POST "/addnote". Login required
router.post('/addnote', getuser, [
        body('title', "Enter a valid title").isLength({min: 3}),
        body('description', "Description must be atleast 5 characters").isLength({min: 5}),
        // body('tag', "Enter a valid tag"),
    ],
    async (req, res) => {

        const {title, description, tag} = req.body;
        //If there are errors, return Bad request and the errors
        const errors = validationResult(req);    
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        
        try{
            const note = await new Note({
                title, description,tag, user: req.user.id
            })
            const savedNote = await note.save();
            res.json(note);
        }catch(error){
            console.error(error.message);
            res.status(500).json({error: "Internal Server Error"});
        }


    }
)

// ROUTE 3 : Update existing note if user is authenticated: POST "/addnote". Login required
router.put('/updatenote/:id', getuser, async (req, res) => {

        const {title, description, tag} = req.body;
        
        //If there are errors, return Bad request and the errors
        const errors = validationResult(req);    
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        
        try{
            // Create new note
            const newNote = {};

            if(title){newNote.title = title};
            if(description){newNote.description = description};
            if(tag){newNote.tag = tag};

            //Find the note to be updated
            let note = await Note.findById(req.params.id);
            if(!note){res.status(404).send("Not Found")}

            //ENSURE USER IS AUTHENTIC
            if(note.user.toString() !== req.user.id) {
                return res.status(401).send("Not Allowed");
            }
            //UPDATE NOTE
            note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true});

            res.json({note});
        }catch(error){
            console.error(error.message);
            res.status(500).json({error: "Internal Server Error"});
        }
    }
)

// ROUTE 4 : DELETE existing note if user is authenticated: DELETE "/deletenote". Login required
router.delete('/deletenote/:id', getuser, async (req, res) => {
    //If there are errors, return Bad request and the errors
    const errors = validationResult(req);    
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    
    try{
        //Find the note to be updated
        let note = await Note.findById(req.params.id);
        if(!note){res.status(404).send("Not Found")}

        //ENSURE USER IS AUTHENTIC
        if(note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        //DELETE NOTE
        note = await Note.findByIdAndDelete(req.params.id);

        res.json({"Success" : "Note has been deleted", note: note});
    }catch(error){
        console.error(error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
})

module.exports = router;