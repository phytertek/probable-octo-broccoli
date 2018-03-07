const { User, Fundraiser } = require('enmapi/database');
const { sendUserError } = require('enmapi/common/errors');
const SSK = process.env.SSK;
const stripe = require('stripe')(SSK);

module.exports = {
  getAllFundraisers: async (req, res) => {
    try {
      const fundraisers = await Fundraiser.find();
      res.json(fundraisers);
    } catch (error) {
      sendUserError(error, res);
    }
  },
  postCreateFundraiser: async (req, res) => {
    try {
      const { title, description, goal } = req.body;
    } catch (error) {
      sendUserError(error, res);
    }
  }
};
