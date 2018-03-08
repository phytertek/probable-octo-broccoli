const User = require('enmapi/database').User;
const { sendUserError } = require('enmapi/common/errors');
const { createCustomer } = require('enmapi/services').Stripe;

module.exports = {
  postCreateDonor: async (req, res) => {
    try {
      console.log(req.body);
      const fields = ['firstName', 'lastName'];
      const user = req.unsafeUser;
      fields.forEach(field => {
        if (req.body[field]) user[field] = req.body[field];
      });
      await user.save();
      res.json({ success: true });
    } catch (error) {
      sendUserError(error, res);
    }
  }
};
