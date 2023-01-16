// const mongoose = require('mongoose'); // import "mongoose" model.

// mongoose.connect('mongodb://localhost:27017/UseerssDB'); // connect to usersDB collection.

const mongoose = require('mongoose')// import "mongoose" model.

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/UseerssDB')
    } catch (err) {
        console.log(err)
    }
}

module.exports = connectDB