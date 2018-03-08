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
      const acct = await stripe.accounts.retrieve();
      const { token, donations } = req.body;
      requireFields({ token, donations });
      const user = req.unsafeUser;
      // Create stripe customer if does not exist
      if (!user.isDonor) {
        ['firstName', 'lastName'].forEach(field => {
          if (req.body[field]) user[field] = req.body[field];
        });
        const customer = await stripe.customers.create({
          description: 'Donor',
          source: token.id,
          email: user.email
        });
        user.donorAcct = customer;
        user.isDonor = true;
      }
      const newDonations = donations.map(d => {
        return new Donation({
          amount: d.amount,
          fundraiser: d.fundraiser._id,
          donor: user._id
        });
      });
      const donationsTotal = newDonations.reduce((t, d) => t + d.amount);
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
      const transfer_group = `${user._id}:${Date.now()}`;
      const charge = await stripe.charges.create({
        amount: donationsTotal * 100,
        currency: 'usd',
        customer: user.donorAcct.id,
        source: user.donorAcct.default_source,
        transfer_group
      });
      const transfers = newDonations.map(d =>
        stripe.transfers.create({
          amount: d.amount * 100 - commission(d.amount),
          currency: 'usd',
          source: user.donorAcct.default_source,
          destination: fundraiserAccts[d.owner]
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
