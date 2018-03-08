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
      const fields = ['firstName', 'lastName'];
      const user = req.unsafeUser;
      fields.forEach(field => {
        if (req.body[field]) user[field] = req.body[field];
      });
      const customer = await stripe.customers.create({
        description: 'Donor',
        source: token.id,
        email: user.email
      });
      console.log(customer);
      res.json(customer);
    } catch (error) {
      sendUserError(error, res);
    }
  }
};

// const newDonations = donations.map(d => {
//   return new Donation({
//     amount: d.amount,
//     fundraiser: d.fundraiser._id,
//     donor: user._id
//   })
// })
// const fundOwners = donations.map(d => {
//   return d.fundraiser.owner
// })
// let fundraiserAccts = await User.find({ _id: { $in: fundOwners } }).select('fundraiserAcct')
// let houseTake = 0
// fundraiserAccts = fundraiserAccts.reduce((fundRaiserAcctMap, owner) => {
//   fundRaiserAcctMap[owner._id] = owner.fundraiserAcct.stripe_user_id
//   return fundRaiserAcctMap
// }, {})
// const chargesToMake = newDonations.map(d => {
//   const amount = d.amount - (((d.amount* 100) * 5) / 100)
// })
// const charges = []
// newDonations.forEach(d => {
//   charges.push(stripe
// })
// const charge = await stripe.charges.create({});
// await user.save();
// res.json({ success: true });
