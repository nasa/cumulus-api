'use strict';

var cognito = require('amazon-cognito-identity-js');

// Hack to make cognitor library work outside of the browser
global.window = {
  localStorage: {
    getItem () { return null; },
    setItem () { },
    deleteItem () { }
  }
};

global.navigator = {};

var signup = function (email, password, inviteCode, cb) {
  if (!email) {
    return cb('valid email is not provided');
  }

  if (!password) {
    return cb('valid password is not provided');
  }

  if (inviteCode === process.env.INVITE_CODE) {
    const userPool = new cognito.CognitoUserPool({
      UserPoolId: process.env.USER_POOL_ID,
      ClientId: process.env.CLIENT_ID
    });
    const attributeEmail = new cognito.CognitoUserAttribute({
      Name: 'email',
      Value: email
    });
    const attributeList = [attributeEmail];
    // TODO: catch bad email here
    const username = email.split('@')[0];

    userPool.signUp(username, password, attributeList, null, (err, result) => {
      if (err) {
        console.warn(err);
        return cb(err);
      }
      let cognitoUser = result.user;
      console.log('New sign up. Username is ' + cognitoUser.getUsername());
      cb(null, {
        detail: 'Sign up was successful. You cannot login until Cumulus administrator confirms the sign up.',
        username: cognitoUser.getUsername()
      });
    });
  } else {
    cb('Invalid invite code provided');
  }
};

var signin = function (username, password, cb) {
  const userPool = new cognito.CognitoUserPool({
    UserPoolId: process.env.USER_POOL_ID,
    ClientId: process.env.CLIENT_ID
  });
  const cognitoUser = new cognito.CognitoUser({
    Username: username,
    Pool: userPool
  });
  const authenticationDetails = new cognito.AuthenticationDetails({
    Username: username,
    Password: password
  });
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      cb(null, {token: result.getIdToken().getJwtToken()});
    },

    onFailure: function (err) {
      console.error(err);
      cb(err);
    }
  });
};

module.exports.signup = signup;
module.exports.signin = signin;
