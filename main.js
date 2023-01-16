const express = require('express');
var cors = require('cors'); // import CORS model
var session = require('express-session'); // set up session
const usersRouter = require('./Routers/users');
const connectDB = require('./Configs/database')
const mongoose = require('mongoose')

var app = express();
app.use(session({secret : 'my-secret'}));

app.use(cors()); // prevent blocks of CORS policy (block request from unknown domain)

connectDB();




app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/users', usersRouter);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(9000, () => console.log(`Server is running and listening on port 9000....`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})


// app.listen(9000, () => console.log("Server is running and listening on port 9000...."));