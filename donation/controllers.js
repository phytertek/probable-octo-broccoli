const { User, Donation, Fundraiser } = require('enmapi/database');
const { sendUserError } = require('enmapi/common/errors');
const { requireFields } = require('enmapi/common/validation');
const SSK = process.env.SSK;
const stripe = require('stripe')(SSK);

module.exports = {
  postCreateDonation: async (req, res) => {
    try {
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
          fundraiserOwner: d.fundraiser.owner,
          donor: user._id
        });
      });
      const donationsTotal = newDonations.reduce(
        (total, donation) => total + donation.amount,
        0
      );
      const fundOwners = donations.map(donation => {
        return donation.fundraiser.owner;
      });
      let fundraiserAccts = await User.find({
        _id: { $in: fundOwners }
      }).select('fundraiserAcct');
      fundraiserAccts = fundraiserAccts.reduce((fundRaiserAcctMap, owner) => {
        fundRaiserAcctMap[owner._id] = owner.fundraiserAcct.stripe_user_id;
        return fundRaiserAcctMap;
      }, {});

      // remove decimals from amounts
      const removeDec = n => Math.round(n * 100);
      const COMMISION_PERCENTAGE_POINTS = 5;
      const commission = n => Math.floor(n * COMMISION_PERCENTAGE_POINTS);

      // In Production, trigger transfers via webhook on charge transaction complete or at set payout intervals -- Using immediate transfers here for demo purposes
      const transfer_group = `${user._id}:${Date.now()}`;
      const charge = await stripe.charges.create({
        amount: removeDec(donationsTotal),
        currency: 'usd',
        source: user.donorAcct.default_source,
        customer: user.donorAcct.id,
        transfer_group
      });
      const transfers = newDonations.map(donation => {
        return stripe.transfers.create({
          amount: removeDec(donation.amount) - commission(donation.amount),
          currency: 'usd',
          destination: fundraiserAccts[donation.fundraiserOwner],
          transfer_group
        });
      });

      // Automatic transfers w/ commission, but causes multiple charges
      // const charges = newDonations.map(d => {
      //   return stripe.charges.create({
      //     amount: d.amount * 100,
      //     currency: 'usd',
      //     source: user.donorAcct.default_source,
      //     customer: user.donorAcct.id,
      //     destination: {
      //       account: fundraiserAccts[d.fundraiserOwner],
      //       amount: d.amount * 100 - commission(d.amount)
      //     }
      //   });
      // });
      // await Promise.all(charges);

      // TODO: assign charge results to user and transfers results to donations

      user.donations = [...user.donations, ...newDonations];
      await user.save();
      await Promise.all(transfers);
      res.json({ isDonor: user.isDonor, success: true, donationsTotal });
    } catch (error) {
      sendUserError(error, res);
    }
  }
};
