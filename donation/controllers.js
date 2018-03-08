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
      // Create stripe customer if does not exist
      const newDonations = donations.map(d => {
        return new Donation({
          amount: d.amount,
          fundraiser: d.fundraiser._id,
          donor: user._id
        });
      });
      const transfer_group = `${user._id}:${Date.now()}`;
      const donationsTotal =
        newDonations.reduce((t, d) => t + d.amount, 0) * 100;
      console.log('>>> DONATION TOTAL >>>>>', donationsTotal);
      const charge = await stripe.charges.create({
        amount: donationsTotal,
        currency: 'usd',
        source: token.id,
        transfer_group
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
      const transfers = newDonations.map(d => {
        console.log('>>>> TRANSFER AMOUNT >>>>', d.amount * 100);
        console.log(
          '>>>> COMMISSION AMOUNT >>>>',
          d.amount * 100 - commission(d.amount)
        );
        return stripe.transfers.create({
          amount: d.amount * 100,
          currency: 'usd',
          destination: {
            amount: Number(d.amount * 100 - commission(d.amount)),
            account: fundraiserAccts[d.owner]
          },
          transfer_group
        });
      });
      user.donations = [...user.donations, ...newDonations];
      await user.save();
      await Promise.all(transfers);
      res.json({ charges, transfers });
    } catch (error) {
      sendUserError(error, res);
    }
  }
};
