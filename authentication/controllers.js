const { User, Token } = require('enmapi/database');
const {
  generateUserToken,
  existingUserTokenSourceMatch
} = require('./utils/jwt');
const { sendUserError, throwError } = require('enmapi/common/errors');
const { requireFields } = require('enmapi/common/validation');
const {
  dbDocumentUpdateFromExistingFields: updateIfExists
} = require('enmapi/common/utils');

module.exports = {
  authGetLogoutUser: async (req, res) => {
    try {
      const user = req.unsafeUser;
      const token = req.token;
      user.activeTokens = user.activeTokens.filter(t => t.token !== token);
      await Token.findOneAndRemove({ token });
      await user.save();
      res.json({ success: 'User successfully logged out' });
    } catch (error) {
      sendUserError(error, res);
    }
  },
  authPostLoginUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      requireFields({ email, password });
      const user = await User.findOne({ email }).populate({
        path: 'activeTokens',
        model: 'Token'
      });
      if (!!!user) throwError('Not a valid email / password combination');
      const passwordMatch = await user.checkPassword(password);
      if (!passwordMatch)
        throwError('Not a valid email / password combination');
      let token;
      const existingTokenForSource = existingUserTokenSourceMatch(user, req);
      if (existingTokenForSource) {
        token = existingTokenForSource;
      } else {
        token = await new Token(await generateUserToken(user, req)).save();
        user.activeTokens.push(token._id);
        await user.save();
      }
      res.json({ token: token.token, email });
    } catch (error) {
      sendUserError(error, res);
    }
  },
  authPostRegisterUser: async (req, res) => {
    try {
      const { password, email } = req.body;
      requireFields({ password, email });
      const user = new User({ password, email });
      const token = await new Token(await generateUserToken(user, req)).save();
      user.activeTokens.push(token._id);
      await user.save();
      res.json({ token: token.token, email });
    } catch (error) {
      sendUserError(error, res);
    }
  },
  authGetValidateToken: async (req, res) =>
    res.json({ email: req.safeUser.email })
};
