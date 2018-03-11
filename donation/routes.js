const { postCreateDonation } = require('./controllers');
const { authorizeRoute } = require('enmapi/services').Authentication;

module.exports = {
  '/donation': {
    middleware: [authorizeRoute],
    post: {
      '/create': postCreateDonation
    }
  }
};
