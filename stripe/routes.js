const {
  getStripeAuth,
  getStripePeekAuth,
  postStripeNewAccount
} = require('./controllers');

module.exports = {
  '/stripe': {
    get: {
      '/auth': getStripeAuth,
      '/peekAuth': getStripePeekAuth
    },
    post: {
      '/new-account': postStripeNewAccount
    }
  }
};
