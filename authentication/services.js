const User = require('enmapi/database').User;
const {
  encode,
  decode,
  compareUserToken,
  existingUserTokenSourceMatch
} = require('./utils/jwt');
const { sendUserError, throwError } = require('enmapi/common/errors');
const { requireFields } = require('enmapi/common/validation');
const { safeReturnUser } = require('./utils');

module.exports = {
  authorizeRoute: async (req, res, next) => {
    try {
      req.token = req.get('Authorization');
      if (!!!req.token) throwError('No token provided');
      req.decodedToken = await decode(req.token);
      const user = await User.findById(req.decodedToken._id).populate({
        path: 'activeTokens',
        model: 'Token'
      });
      if (!!!user) throwError('No user found');
      const tokenMatch = await compareUserToken(user, req);
      if (tokenMatch !== 'Success') throwError('Not an active token');
      req.unsafeUser = user;
      req.safeUser = safeReturnUser(user);
      next();
    } catch (error) {
      sendUserError(error, res);
    }
  }
};
