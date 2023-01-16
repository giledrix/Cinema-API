const express = require('express');
var cors = require('cors'); // import CORS model
var session = require('express-session'); // set up session
const usersRouter = require('./Routers/users');

var app = express();
app.use(session({secret : 'my-secret'}));

app.use(cors()); // prevent blocks of CORS policy (block request from unknown domain)

require('./configs/database'); // run database.js on startup



app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/users', usersRouter);


app.listen(9000, () => console.log("Server is running and listening on port 9000...."));