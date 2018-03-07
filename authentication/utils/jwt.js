const jwt = require('jwt-simple');
const hash = require('object-hash');
const useragent = require('express-useragent');
const JWT_SECRET = process.env.JWT_SECRET || 'Super Secret JWT Shit';

const encode = async ({ _id, email }) => {
  try {
    const token = await jwt.encode(
      {
        _id,
        email,
        iat: new Date().getTime()
      },
      JWT_SECRET
    );
    return token;
  } catch (error) {
    throw new Error(error);
  }
};

const decode = async token => {
  try {
    const user = await jwt.decode(token, JWT_SECRET);
    return user;
  } catch (error) {
    throw new Error(error);
  }
};

const generateUserToken = async (user, req) => {
  try {
    if (!!!user) {
      throw new Error('No user provided for token generation');
    }
    const token = await encode(user);
    const source = useragent.parse(req.headers['user-agent']);

    return {
      user: user._id,
      token,
      source
    };
  } catch (error) {
    throw new Error(error);
  }
};

const sourceMatch = (a, b) => {
  try {
    let match = true;
    Object.keys(a).forEach(k => (a[k] !== b[k] ? (match = false) : null));
    return match;
  } catch (error) {
    console.log(error);
  }
};

const existingUserTokenSourceMatch = (user, req) => {
  let match;
  user.activeTokens.forEach(token => {
    const reqSource = useragent.parse(req.headers['user-agent']);
    console.log('req source', reqSource);
    console.log('token source', token.source);
    console.log(sourceMatch(token.source, reqSource));
    if (sourceMatch(token.source, reqSource)) {
      match = token;
    }
  });
  return match || false;
};

const compareUserToken = async (user, req) => {
  try {
    const reqToken = req.token;
    const reqSource = useragent.parse(req.headers['user-agent']);
    if (!!!user.activeTokens || !!!reqToken)
      throw new Error('No token provided');

    const userToken = user.activeTokens.find(t => t.token === reqToken);
    if (!!!userToken) throw new Error('No active tokens provided');
    if (!sourceMatch(userToken.source, reqSource))
      throw new Error('Not a valid source');
    return 'Success';
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  encode,
  decode,
  generateUserToken,
  compareUserToken,
  existingUserTokenSourceMatch
};
