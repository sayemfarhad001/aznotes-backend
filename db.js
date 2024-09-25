const mongoose = require('mongoose');
// const mongoURI = "mongodb://localhost:27017/{nameof the DB to be created}";
const mongoURI = "mongodb://localhost:27017/aznotes-db?readPreference=primary&tls=false&directConnection=true";

const connectToMongo = () =>{
    mongoose.connect(mongoURI);
}

module.exports = connectToMongo;