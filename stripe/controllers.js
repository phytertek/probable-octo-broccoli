const SSK = process.env.SSK;
const stripe = require('stripe')('sk_test_nehQ16RVy8FjjBTDnKPNvpSP');

const { sendUserError } = require('enmapi/common/errors');

const auth = new stripAuthInfo();
module.exports = {
  getStripeAuth: async (req, res) => {
    try {
      const code = req.query.code;
      const scope = req.query.scope;
      const state = req.query.state;
      auth.setAuthSuccess(code, scope, state);
      res.sendStatus(200);
    } catch (error) {
      auth.setAuthError(error.error, error.error_description, error.state);
      // sendUserError(error, res);
    }
  },
  getStripePeekAuth: async (req, res) => {
    try {
      // console.log(stripe);
      res.json(auth.info);
    } catch (error) {
      sendUserError(error, res);
    }
  },
  postStripeNewAccount: async (req, res) => {
    try {
      const { email } = req.body;
      const newAcct = await stripe.accounts.create({
        type: 'standard',
        country: 'US',
        email
      });
      res.json(newAcct);
    } catch (error) {
      sendUserError(error, res);
    }
  }
};
