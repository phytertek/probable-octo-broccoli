const { postCreateDonor } = require('./controllers');
const { authorizeRoute } = require('enmapi/services').Authentication; // Requires auth template component

module.exports = {
  '/donation': {
    middleware: [authorizeRoute], // enables authorization on all routes
    post: {
      '/create-donor': postCreateDonor
    }
  }
};
