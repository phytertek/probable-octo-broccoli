module.exports = {
  safeReturnUser: user => {
    const safeUser = user.toObject();
    const unsafeProps = ['password', 'activeTokens'];
    unsafeProps.forEach(prop => {
      delete safeUser[prop];
    });
    return safeUser;
  }
};
