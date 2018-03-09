const { User, Fundraiser } = require('enmapi/database');
const { sendUserError } = require('enmapi/common/errors');
const { requireFields } = require('enmapi/common/validation');
const SSK = 'sk_test_nehQ16RVy8FjjBTDnKPNvpSP'; // process.env.SSK;
const SCID = process.env.SCID;
const stripe = require('stripe')(SSK);
const axios = require('axios');

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
      requireFields({ title, description, goal });
      const fundraiser = await new Fundraiser({
        title,
        description,
        goal,
        owner: req.safeUser._id
      }).save();
      req.unsafeUser.fundraisers.push(fundraiser._id);
      await req.unsafeUser.save();
      res.json(fundraiser);
    } catch (error) {
      sendUserError(error, res);
    }
  },
  postCreateFundraiserAcct: async (req, res) => {
    try {
      const { code } = req.body;
      requireFields({ code });
      const newStripeAcct = await axios.post(
        'https://connect.stripe.com/oauth/token',
        {
          client_secret: SSK,
          code: code,
          grant_type: 'authorization_code'
        }
      );
      const user = req.unsafeUser;
      user.fundraiserAcct = newStripeAcct.data;
      user.isFundraiser = true;
      await user.save();

      res.json(newStripeAcct.data);
    } catch (error) {
      sendUserError(error, res);
    }
  }
};

const createMockup = async () => {
  try {
    const association = [
      'Association',
      'Club',
      'Cooperative',
      'Legue',
      'Society',
      'Fund',
      'Organization',
      'Union',
      'Alliance'
    ];
    let lastUsed;
    const randAssociations = () => {
      const nextRand =
        association[Math.floor(Math.random() * association.length)];
      if (nextRand !== lastUsed) {
        lastUsed = nextRand;
        return nextRand;
      } else return randAssociations();
    };
    const u = await User.findOne({ email: 'ryan.phytertek@gmail.com' });
    const mockData = require('./MOCK_DATA (10).json');
    const ownedMockData = mockData.map(e => {
      e.owner = u._id;
      e.title = `${e.title2} ${e.title1}s ${randAssociations()}`;
      return new Fundraiser(e);
    });
    const frids = ownedMockData.map(e => e._id);
    u.fundraisers = frids;
    await u.save();
    const allInserts = await Fundraiser.collection.insert(ownedMockData);
    console.log(allInserts);
  } catch (error) {
    console.log(error);
  }
};

// createMockup();
