const SSK = process.env.SSK;
const stripe = require('stripe')(SSK);

const { sendUserError } = require('enmapi/common/errors');

class stripAuthInfo {
  constructor(code, scope, state) {
    this._code = '';
    this._scope = '';
    this._state = '';
    this._error = '';
    this._error_description = '';
  }
  setAuthSuccess(code, scope, state) {
    this._code = code;
    this._scope = scope;
    this._state = state;
  }
  setAuthError(error, error_description, state) {
    this._error = error;
    this._error_description = error_description;
    this._state = state;
  }
  get info() {
    return {
      code: this._code,
      scope: this._scope,
      state: this._state,
      error: this._error,
      error_description: this._error_description
    };
  }
  get state() {
    return this._state;
  }
  set state(state) {
    this._state = state;
    return this._state;
  }
  get code() {
    return this._code;
  }
  set code(code) {
    this._code = code;
    return this._code;
  }
  get scope() {
    return this._scope;
  }
  set scope(scope) {
    this._scope = scope;
    return this._scope;
  }
  get error() {
    return this._error;
  }
  set error(error) {
    this._error = error;
    return this._error;
  }
  get error_description() {
    return this._error_description;
  }
  set error_description(error_description) {
    this._error_description = error_description;
    return this._error_description;
  }
}

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
