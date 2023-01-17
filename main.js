const express = require('express');
var cors = require('cors'); // import CORS model
var session = require('express-session'); // set up session
const usersRouter = require('./Routers/users');
const mongoose = require('mongoose')
const CONNECTION_URL = 'mongodb+srv://test_user123:test_user123@cluster0.kfrdiz3.mongodb.net/UsersDB?retryWrites=true&w=majority';
const PORT = process.env.PORT || 9000;

var app = express();
app.use(session({ secret: 'my-secret' }));

app.use(cors()); // prevent blocks of CORS policy (block request from unknown domain)

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/users', usersRouter);


mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(PORT, () => console.log('Server is running and listening on port 9000..')))
    .catch((error) => console.log(error.message));

mongoose.set('useFindAndModify', false);
