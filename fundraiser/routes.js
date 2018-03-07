const { getAllFundraisers, postCreateFundraiser } = require('./controllers');
const { authorizeRoute } = require('enmapi/services').Authentication;
module.exports = {
  '/fundraiser': {
    get: {
      '/all': getAllFundraisers
    },
    post: {
      '/create': [authorizeRoute, postCreateFundraiser]
    }
  }
};
