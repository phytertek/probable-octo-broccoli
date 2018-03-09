const { postCreateDonation } = require('./controllers');
const { authorizeRoute } = require('enmapi/services').Authentication;

module.exports = {
  '/donation': {
    middleware: [authorizeRoute], // enables authorization on all routes
    post: {
      '/create': postCreateDonation
    }
  }
};
