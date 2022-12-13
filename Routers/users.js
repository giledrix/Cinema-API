const { response } = require('express');
const express = require('express');
const session = require('express-session');
const router = express.Router();
const usersBL = require('../BL/usersBL');
const CurrentUser = require('../Utils/CurrentUser');

const jwt = require('jsonwebtoken');
const RSA_PRIVATE_KEY = 'secretkey';




// get all user request
router.route('/')
  .get(async function (req, resp) {

    const token = req.headers['x-access-token'];
    if (!token)
      return resp.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, RSA_PRIVATE_KEY, async function (err, decoded) {
      if (err) {
        if (err instanceof jwt.TokenExpiredError) {
          resp.status(200).send({ auth: false, message: 'jwt TokenExpiredError' });
        }
        else {
          resp.status(500).send({ auth: false, message: 'Failed to authenticate token' });
        }
      }
      else {
        let users = await usersBL.getAllUsers();
        resp.status(200).send({ auth: true, message: 'User is verified', users });// return the response as json
      }
    });
  });

// get alluser Data from all sources request
router.route('/getAllUserData')
  .get(async function (req, resp) {

    // verify user token
    // CurrentUser.verifyUserToken(req, resp);
    const token = req.headers['x-access-token'];
    if (!token)
      return resp.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, RSA_PRIVATE_KEY, async function (err, decoded) {
      if (err) {
        if (err instanceof jwt.TokenExpiredError) {
          resp.status(200).send({ auth: false, message: 'jwt TokenExpiredError' });
        }
        else {
          resp.status(500).send({ auth: false, message: 'Failed to authenticate token' });
        }
      }
      else {
        let users = await usersBL.getAllusersDataFromAllSourceses();
        resp.status(200).send({ auth: true, message: 'User is verified', users });
      }
    });

  });

// User Token verify
router.route('/tokenverify')
  .get(async function (req, resp) {

    // verify user token
    // CurrentUser.verifyUserToken(req, resp);
    const token = req.headers['x-access-token'];
    if (!token)
      resp.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, RSA_PRIVATE_KEY, function (err, decoded) {
      if (err) {
        if (err instanceof jwt.TokenExpiredError) {
          resp.status(200).send({ auth: false, message: 'jwt TokenExpiredError' });
        }
        else {
          resp.status(500).send({ auth: false, message: 'Failed to authenticate token' });
        }
      }
      else {
        resp.status(200).send({ auth: true, message: 'User is verified' });
      }
    });


  });


// login 
router.route('/')
  .post(async function (req, resp) {

    // get data from body 
    let input = req.body;

    let user = await usersBL.loginValidation(input.username, input.password)//return status

    if (typeof user === 'object' && user !== null) { // if user is found


      // check if need to delete all this
      // let sess = req.session;
      // sess.classification = user.classification; // save classifiction in seesion for allow admin operations
      // sess.name = user.name                   //  display user name in all pages
      // sess.authenticated = true;              // Prevents the user from reaching unauthorized pages 
      // sess.username = user.username;
      // sess.userID = user.id;
      // sess.tokenCinemaWS = user.tokenCinemaWS;
      // sess.tokenSubscriptionWS = user.tokenSubscriptionWS;
      // sess.cookie.expires = new Date(Date.now() + user.timeOut);

      return resp.json({ tokenCinemaWS: user.tokenCinemaWS, tokenSubscriptionWS: user.tokenSubscriptionWS, user: user })
    }
    else {
      return resp.json(user); // return the response as json
    }

  });


// User complite register (set password)
router.route('/reg')
  .post(async function (req, resp) {

    // get data from body 
    let user = req.body;

    let status = await usersBL.completeRegister(user.username, user.password)//return status

    return resp.json(status); // return the response as json
  });

router.route('/adminreg')
  .post(CurrentUser.checkToken, async function (req, resp) {

    // verify user token
    // CurrentUser.verifyUserToken(req, resp);
    const token = req.headers['x-access-token'];
    if (!token)
      return resp.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, RSA_PRIVATE_KEY, async function (err, decoded) {
      if (err) {
        if (err instanceof jwt.TokenExpiredError) {
          resp.status(200).send({ auth: false, message: 'jwt TokenExpiredError' });
        }
        else {
          resp.status(500).send({ auth: false, message: 'Failed to authenticate token' });
        }
      }
      else {
        // get data from body 
        let user = req.body;
        let status = await usersBL.adminCreateNewUser(user)//return status
        resp.status(200).send({ auth: true, message: 'User is verified', status });// return the response as json
      }
    });



  });

router.route('/updateuser')
  .post(CurrentUser.checkToken, async function (req, resp) {


    // verify user token
    // CurrentUser.verifyUserToken(req, resp);
    const token = req.headers['x-access-token'];
    if (!token)
      return resp.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, RSA_PRIVATE_KEY, async function (err, decoded) {
      if (err) {
        if (err instanceof jwt.TokenExpiredError) {
          resp.status(200).send({ auth: false, message: 'jwt TokenExpiredError' });
        }
        else {
          resp.status(500).send({ auth: false, message: 'Failed to authenticate token' });
        }
      }
      else {
        // get data from body 
        let user = req.body;

        let status = await usersBL.updateUserData(user)//return status
        resp.status(200).send({ auth: true, message: 'User is verified', status });
      }
    });

  });



router.route('/deleteuser/:id')
  .delete(CurrentUser.checkToken, async function (req, resp) {

    // verify user token
    // CurrentUser.verifyUserToken(req, resp);

    const token = req.headers['x-access-token'];
    if (!token)
      return resp.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, RSA_PRIVATE_KEY, async function (err, decoded) {
      if (err) {
        if (err instanceof jwt.TokenExpiredError) {
          resp.status(200).send({ auth: false, message: 'jwt TokenExpiredError' });
        }
        else {
          resp.status(500).send({ auth: false, message: 'Failed to authenticate token' });
        }
      }
      else {
        // get data from body 
        let userID = req.params.id;

        let deleteStatus = await usersBL.deleteUser(userID);

        resp.status(200).send({ auth: true, message: 'User is verified', deleteStatus });// return the response as json
      }
    });

  });


module.exports = router;