const bcrypt = require('bcrypt');
const hashPassword = async password => bcrypt.hash(password, 11);
const comparePassword = async (password, hash) =>
  bcrypt.compare(password, hash);

module.exports = { hashPassword, comparePassword };
