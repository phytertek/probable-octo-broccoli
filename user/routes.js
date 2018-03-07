const { postUpdateUser } = require('./controllers');
const { authorizeRoute } = require('enmapi/services').Authentication; // Requires auth template component

module.exports = {
  '/user': {
    middleware: [authorizeRoute], // enables authorization on all routes
    post: {
      '/update': postUpdateUser
    }
  }
};
