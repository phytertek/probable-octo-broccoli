const { postCreateDonor } = require('./controllers');
const { authorizeRoute } = require('enmapi/services').Authentication; // Requires auth template component

module.exports = {
  '/donor': {
    middleware: [authorizeRoute], // enables authorization on all routes
    post: {
      '/create': postCreateDonor
    }
  }
};
