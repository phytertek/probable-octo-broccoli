const controller = require('./controllers');
const { authorizeRoute } = require('enmapi/services').Authentication;
module.exports = {
  '/auth': {
    get: {
      '/logout': [authorizeRoute, controller.authGetLogoutUser],
      '/validate': [authorizeRoute, controller.authGetValidateToken]
    },
    post: {
      '/login': controller.authPostLoginUser,
      '/register': controller.authPostRegisterUser
    }
  }
};
