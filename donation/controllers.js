const { User, Donation, Fundraiser } = require('enmapi/database');
const { sendUserError } = require('enmapi/common/errors');
const { requireFields } = require('enmapi/common/validation');
const SSK = process.env.SSK;
const stripe = require('stripe')(SSK);

const COMMISION_PERCENTAGE = 5;
const commission = amount => amount * COMMISION_PERCENTAGE;
module.exports = {
  postCreateDonation: async (req, res) => {
    try {
      const { token, donations } = req.body;
      requireFields({ token, donations });
      const user = req.unsafeUser;
      const newDonations = donations.map(d => {
        return new Donation({
          amount: d.amount,
          fundraiser: d.fundraiser._id,
          donor: user._id
        });
      });
      const fundOwners = donations.map(d => {
        return d.fundraiser.owner;
      });
      let fundraiserAccts = await User.find({
        _id: { $in: fundOwners }
      }).select('fundraiserAcct');
      fundraiserAccts = fundraiserAccts.reduce((fundRaiserAcctMap, owner) => {
        fundRaiserAcctMap[owner._id] = owner.fundraiserAcct.stripe_user_id;
        return fundRaiserAcctMap;
      }, {});
      const transfer_group = `${user._id}${Date.now()}`;
      const charges = newDonations.map(d =>
        stripe.charges.create({
          amount: d.amount,
          currency: 'usd',
          source: token.id,
          destination: {
            amount: d.amount - commission(d.amount),
            account: fundraiserAccts[d.owner]
          },
          transfer_group
        })
      );
      user.donations = [...user.donations, ...newDonations];
      await user.save();
      await Promise.all(charges);
      res.json(charges);
    } catch (error) {
      sendUserError(error, res);
    }
  }
};
