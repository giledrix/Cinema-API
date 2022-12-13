const mongoose = require('mongoose');// import mongoose model

// create schema of our database collection
let usersSchema = new mongoose.Schema({
    Username : String,
    Password : String,
    Classification : String,
});

// mapping members Collection to the schema.
module.exports = mongoose.model('users', usersSchema);
