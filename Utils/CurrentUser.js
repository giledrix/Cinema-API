const jwt = require('jsonwebtoken');
const RSA_PRIVATE_KEY = 'secretkey';

const verifyUserToken = function (req, resp) {

  const token = req.headers['x-access-token'];
  if (!token)
    resp.status(401).send({ auth: false, message: 'No token provided.' });
  else {
    jwt.verify(token, RSA_PRIVATE_KEY, function (err, decoded) {
      if (err) {
        if (err instanceof jwt.TokenExpiredError) {
          return resp.status(200).send({ auth: false, message: 'jwt TokenExpiredError' });
        }
        else {
          return resp.status(500).send({ auth: false, message: 'Failed to authenticate token' });
        }
      }
    });
  }
}

//Check to make sure header is not undefined, if so, return Forbidden (403)
//So this function check if token is provide to request
const checkToken =  (req, res, next) =>  {
  const header = req.headers['x-access-token'];

  if(typeof header !== 'undefined') {

      const bearer = header.split(' ');
      const token = bearer[1];

      req.token = token;

      next();
  } else {
      //If header is undefined return Forbidden (403)
      res.sendStatus(403)
  }
}



module.exports = { verifyUserToken,checkToken }