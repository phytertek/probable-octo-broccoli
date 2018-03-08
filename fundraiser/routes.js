const {
  getAllFundraisers,
  postCreateFundraiser,
  postCreateFundraiserAcct
} = require('./controllers');
const { authorizeRoute } = require('enmapi/services').Authentication;
module.exports = {
  '/fundraiser': {
    get: {
      '/all': getAllFundraisers
    },
    post: {
      '/create': [authorizeRoute, postCreateFundraiser],
      '/create-acct': [authorizeRoute, postCreateFundraiserAcct]
    }
  }
};
